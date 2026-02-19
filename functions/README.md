# Cloudflare Pages Subscription Function

This project includes a Pages Function endpoint at `/api/subscribe`:

- File: `functions/api/subscribe.js`
- Purpose: accept email signups from the blog UI and forward them to Listmonk.
- Attributes saved to subscriber `attribs`: `source` (form variant) and `page_url` (exact page URL where signup happened).

## Configure in Cloudflare Pages

In your Cloudflare Pages project settings, add these environment variables:

- `LISTMONK_URL`: `https://lists.a.srg.id.au`
- `LISTMONK_API_USER`: `web`
- `LISTMONK_LIST_ID`: `3`
- `LISTMONK_API_TOKEN`: your Listmonk API token (set as a secret)
- `ALLOWED_ORIGINS`: optional comma-separated list, for example `https://srg.id.au,https://www.srg.id.au`

When this repo is connected to Cloudflare Pages with Git integration, pushes deploy automatically and the function is available without running `wrangler deploy`.

## Local development

1. Build the site output:
   - `zola build`
2. Create `functions/.dev.vars` with your local values.
3. Start Pages dev server:
   - `npx wrangler pages dev public`
