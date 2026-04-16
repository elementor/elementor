# ChatGPT MCP Server

## 1. How To Run

### Prerequisites
- Local by Flywheel with a WP site that has Elementor active
- Elementor plugin symlinked into the site:
  ```bash
  ln -s ~/Dev/elementor ~/Local\ Sites/<site>/app/public/wp-content/plugins/elementor
  ```
- ngrok: `brew install ngrok` + `ngrok config add-authtoken <token>`

### Step 1 — Enable the experiment in WordPress
```bash
wp --path="~/Local Sites/<site>/app/public" \
  option set elementor_experiments '{"apps-oauth":"active"}' --format=json
```
Or: WP Admin → Elementor → Settings → Experiments → search "apps-oauth" → Enable.

### Step 2 — Register the OAuth client
```sql
INSERT INTO wp_options (option_name, option_value, autoload)
VALUES (
  'elementor_chatgpt_oauth_client',
  '{"client_id":"chatgpt-elementor-poc","client_secret":"dev-secret","redirect_uri":"https://chatgpt.com/connector/oauth/REPLACE_ME"}',
  'yes'
) ON DUPLICATE KEY UPDATE option_value = VALUES(option_value);
```
Replace `REPLACE_ME` with the callback URL from your ChatGPT connector settings.

### Step 3 — Start the MCP server
```bash
cd packages/apps/elementor-mcp-server
npm install        # first time only
npm run dev        # listens on port 8787
```

### Step 4 — Expose via ngrok
```bash
ngrok http 8787
# copy the https://<id>.ngrok-free.app URL
```

### Step 5 — Restart with the public URL
```bash
MCP_PUBLIC_URL=https://<id>.ngrok-free.app npm run dev
```

### Step 6 — Configure the ChatGPT connector
1. chatgpt.com → profile → My GPTs → connector settings
2. Set **MCP Server URL** to: `https://<id>.ngrok-free.app/mcp`
3. Copy the **callback URL** shown → update `redirect_uri` in Step 2

### Step 7 — Connect & test
Click **Connect** → WP consent page appears → click **Allow**.
Ask ChatGPT: _"List my Elementor pages"_

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `WP_SITE_URL` | `http://baba-site-3.local:10008` | Local WP URL used for backend calls (introspect, token proxy) |
| `WP_PUBLIC_URL` | same as `WP_SITE_URL` | WP URL the user's browser is redirected to for the consent page |
| `MCP_PUBLIC_URL` | `http://localhost:8787` | Public MCP URL advertised in OAuth discovery metadata |
| `PORT` | `8787` | Port the MCP HTTP server listens on |

---

## 2. What's Next (POC → Production)

### Phase 0 — Security · _blocking, must fix before any deployment_

| # | Issue | Fix |
|---|---|---|
| 0.1 | `introspect` is unauthenticated and returns the raw `app_password` | Add `X-MCP-Introspect-Key` shared secret header validation |
| 0.2 | Token lookup uses `LIKE '%token%'` — full table scan + substring collision risk | Store `sha256(token)` as a separate `user_meta` index key for O(1) exact lookup |
| 0.3 | Application Password stored in plaintext in `user_meta` | Store hash only; re-verify via `WP_Application_Passwords::authenticate()` on introspect |
| 0.4 | `apply-patch.ts` uses `Math.random()` for element IDs | Replace with `crypto.randomUUID()` |
| 0.5 | `CORS: *` | Lock to `https://chatgpt.com` via `ALLOWED_ORIGINS` env var |

### Phase 1 — Infrastructure

- **Deploy MCP server**: Try **Cloudflare Workers** first (edge, stateless, free). Fallback to **Railway** if the MCP SDK's `StreamableHTTPServerTransport` doesn't run on Workers.
- **Multi-tenancy**: `WP_SITE_URL` is a static env var — only one WP site per deployment. Fix: embed `site_url` in the token, return it from introspect, construct `WpClient` per-request. One deployment handles all sites.

### Phase 2 — OAuth Hardening

- **PKCE** (RFC 7636) — `code_challenge` / `code_verifier` in authorize + token. Add `"code_challenge_methods_supported": ["S256"]` to discovery metadata.
- **Refresh tokens** — 30-day rotating so users don't re-auth every hour.
- **Token revocation** (RFC 7009) — `POST /oauth/revoke` deletes the token and its Application Password. Required for a "Disconnect ChatGPT" button in WP admin.

### Phase 3 — More MCP Tools

Current: `list_pages`, `get_document_tree`, `apply_patch`, `save_draft`

| Tool | Priority |
|---|---|
| `publish_page` | High |
| `get_site_info` (title, URL, Elementor version) | High |
| `create_page` | Medium |
| `search_pages` | Medium |
| `list_templates` | Medium |

Extend `apply_patch` operations: `update_button_text`, `update_image_src`, `update_background_color`, `update_text_editor_widget`.

### Phase 4 — WordPress Plugin

- **Admin UI** — Connected Apps dashboard: list active tokens + revoke button
- **Multisite** — use `get_site_option` / `update_site_option` for client registration
- **Experiment graduation** — Alpha (`hidden: true`) → Beta → RC → Stable

### Phase 5 — Testing

- **PHPUnit** — `Token_Store` (store/consume, single-use, expiry, no substring collision) and `OAuth_Controller` (client validation, PKCE, introspect key)
- **Vitest** — auth middleware, apply-patch tree mutations, wp-client headers (zero tests currently)
- **Integration** — full OAuth flow end-to-end via `wp-env`

### Priority order

```
Phase 0 → Phase 1 → Phase 2 → Phase 5 → Phase 3 → Phase 4
```
