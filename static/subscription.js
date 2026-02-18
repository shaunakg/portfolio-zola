(function () {
    const roots = document.querySelectorAll("[data-subscribe-root]");
    if (!roots.length) return;

    function updateStatus(node, message, tone) {
        if (!node) return;
        node.textContent = message || "";
        node.classList.remove("is-success", "is-error");
        if (tone === "success") node.classList.add("is-success");
        if (tone === "error") node.classList.add("is-error");
    }

    for (const root of roots) {
        const form = root.querySelector("[data-subscribe-form]");
        const emailInput = root.querySelector(".newsletter-email");
        const statusNode = root.querySelector("[data-subscribe-status]");
        const submitButton = root.querySelector(".newsletter-submit");
        const endpoint = root.getAttribute("data-subscribe-endpoint") || "/api/subscribe";
        const source = root.getAttribute("data-subscribe-source") || "unknown";

        if (!form || !emailInput) continue;

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email = emailInput.value.trim();
            if (!email) {
                updateStatus(statusNode, "Enter an email address.", "error");
                return;
            }

            submitButton.disabled = true;
            submitButton.setAttribute("aria-busy", "true");
            updateStatus(statusNode, "Subscribing...");

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({ email, source }),
                });

                const payload = await response.json().catch(function () {
                    return {};
                });

                if (!response.ok) {
                    const errorMessage = payload && payload.message
                        ? payload.message
                        : "Could not subscribe right now. Please try again.";
                    throw new Error(errorMessage);
                }

                if (payload.already_subscribed) {
                    updateStatus(statusNode, "You're already on the list.", "success");
                } else {
                    updateStatus(statusNode, "Done. New posts will land in your inbox.", "success");
                }

                form.reset();
            } catch (error) {
                updateStatus(
                    statusNode,
                    error && error.message ? error.message : "Something went wrong. Please try again.",
                    "error"
                );
            } finally {
                submitButton.disabled = false;
                submitButton.removeAttribute("aria-busy");
            }
        });
    }
})();
