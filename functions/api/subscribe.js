const DEFAULT_LISTMONK_URL = "https://lists.a.srg.id.au";

function corsHeaders(request, env) {
    const origin = request.headers.get("Origin");
    const configured = (env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);

    let allowedOrigin = "*";
    if (configured.length > 0) {
        allowedOrigin = configured[0];
        if (origin && configured.includes(origin)) {
            allowedOrigin = origin;
        }
    }

    return {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        Vary: "Origin",
    };
}

function jsonResponse(request, env, status, payload) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...corsHeaders(request, env),
        },
    });
}

function normalizeBaseUrl(url) {
    const value = url || DEFAULT_LISTMONK_URL;
    return value.replace(/\/+$/, "");
}

function messageFromPayload(payload, fallback) {
    if (payload && typeof payload.message === "string" && payload.message.trim() !== "") {
        return payload.message.trim();
    }
    return fallback;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function parseRequestBody(request) {
    const contentType = (request.headers.get("Content-Type") || "").toLowerCase();

    if (contentType.includes("application/json")) {
        return request.json();
    }

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        return {
            email: form.get("email"),
            source: form.get("source"),
        };
    }

    return {};
}

async function listmonkRequest(env, method, path, body, query) {
    const baseUrl = normalizeBaseUrl(env.LISTMONK_URL);
    const username = env.LISTMONK_API_USER || "web";
    const token = env.LISTMONK_API_TOKEN;

    if (!token) {
        return {
            ok: false,
            status: 500,
            payload: { message: "Server is missing LISTMONK_API_TOKEN." },
        };
    }

    const url = new URL(`${baseUrl}${path}`);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        }
    }

    const response = await fetch(url.toString(), {
        method,
        headers: {
            Authorization: `Basic ${btoa(`${username}:${token}`)}`,
            Accept: "application/json",
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let payload = null;
    if (text) {
        try {
            payload = JSON.parse(text);
        } catch (_) {
            payload = { message: text };
        }
    }

    return {
        ok: response.ok,
        status: response.status,
        payload,
    };
}

async function ensureSubscriberInList(env, email, listId) {
    const search = await listmonkRequest(env, "GET", "/api/subscribers", null, { search: email });
    if (!search.ok) {
        return {
            ok: false,
            message: messageFromPayload(search.payload, "Could not verify existing subscription."),
        };
    }

    const results = (((search.payload || {}).data || {}).results || []);
    const lowerEmail = email.toLowerCase();
    const subscriber = results.find((entry) => (entry.email || "").toLowerCase() === lowerEmail);

    if (!subscriber) {
        return { ok: true, alreadySubscribed: true };
    }

    const listIds = (subscriber.lists || []).map((list) => list.id);
    if (listIds.includes(listId)) {
        return { ok: true, alreadySubscribed: true };
    }

    const update = await listmonkRequest(env, "PUT", `/api/subscribers/${subscriber.id}`, {
        email: subscriber.email,
        name: subscriber.name || "",
        status: subscriber.status || "enabled",
        attribs: subscriber.attribs || {},
        lists: [...new Set([...listIds, listId])],
        preconfirm_subscriptions: true,
    });

    if (!update.ok) {
        return {
            ok: false,
            message: messageFromPayload(update.payload, "Could not update your subscription."),
        };
    }

    return { ok: true, alreadySubscribed: false };
}

export async function onRequestOptions(context) {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(context.request, context.env),
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    let body = {};
    try {
        body = await parseRequestBody(request);
    } catch (_) {
        return jsonResponse(request, env, 400, {
            ok: false,
            message: "Invalid request body.",
        });
    }

    const email = String((body || {}).email || "").trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
        return jsonResponse(request, env, 400, {
            ok: false,
            message: "Please enter a valid email address.",
        });
    }

    const parsedListId = Number(env.LISTMONK_LIST_ID || "3");
    if (!Number.isInteger(parsedListId) || parsedListId <= 0) {
        return jsonResponse(request, env, 500, {
            ok: false,
            message: "Server misconfigured: LISTMONK_LIST_ID is invalid.",
        });
    }

    const source = String((body || {}).source || "").trim();
    const createPayload = {
        email,
        name: "",
        status: "enabled",
        lists: [parsedListId],
        preconfirm_subscriptions: true,
        ...(source ? { attribs: { source } } : {}),
    };

    const create = await listmonkRequest(env, "POST", "/api/subscribers", createPayload);

    if (create.ok) {
        return jsonResponse(request, env, 200, {
            ok: true,
            already_subscribed: false,
            message: "Subscribed successfully.",
        });
    }

    const createMessage = messageFromPayload(create.payload, "Subscription failed.");
    const isDuplicate = create.status === 409 || /already exists/i.test(createMessage);

    if (isDuplicate) {
        const ensured = await ensureSubscriberInList(env, email, parsedListId);
        if (!ensured.ok) {
            return jsonResponse(request, env, 502, {
                ok: false,
                message: ensured.message || "Could not complete subscription.",
            });
        }

        return jsonResponse(request, env, 200, {
            ok: true,
            already_subscribed: !!ensured.alreadySubscribed,
            message: ensured.alreadySubscribed
                ? "You are already subscribed."
                : "Subscription updated.",
        });
    }

    if (create.status >= 400 && create.status < 500) {
        return jsonResponse(request, env, 400, {
            ok: false,
            message: createMessage,
        });
    }

    return jsonResponse(request, env, 502, {
        ok: false,
        message: "Subscription service is temporarily unavailable.",
    });
}
