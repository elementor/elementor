# ChatGPT MCP Server — POC to Production Roadmap

## What Was Built (POC)

A working end-to-end integration that lets ChatGPT connect to any Elementor WordPress site via
the Model Context Protocol (MCP). Two components:

### PHP — WordPress OAuth module (`modules/apps-oauth/`)

| File | Description |
|---|---|
| `module.php` | Elementor experiment module — hidden, alpha, inactive by default |
| `includes/oauth-controller.php` | OAuth consent page + token + introspect + document endpoints |
| `includes/token-store.php` | Auth codes in transients (10 min TTL), tokens in user_meta (1 hr TTL) |
| `core/modules-manager.php` | Registers the module |

### Node.js — MCP server (`packages/apps/elementor-mcp-server/`)

| File | Description |
|---|---|
| `src/server.ts` | HTTP server: OAuth discovery, token proxy, MCP handler |
| `src/middleware/auth.ts` | Bearer token → WP introspect → AuthContext |
| `src/lib/wp-client.ts` | WP REST API calls with Basic Auth |
| `src/tools/list-pages.ts` | List Elementor-built pages |
| `src/tools/get-document.ts` | Fetch document tree from `_elementor_data` |
| `src/tools/apply-patch.ts` | Mutate document tree and save back |
| `src/tools/save-draft.ts` | Set page status to draft |

### Auth flow

```
ChatGPT → GET /.well-known/oauth-authorization-server   (discovery)
ChatGPT → redirect user to WP consent page              (authorize)
User approves → WP creates Application Password → code
ChatGPT → POST /oauth/token (proxied via MCP server)    (token exchange)
ChatGPT → POST /mcp  Authorization: Bearer <token>      (MCP calls)
MCP server → POST /wp-json/elementor/v1/oauth/introspect
MCP server → WP REST API  Authorization: Basic <user:app_password>
```

### Key lessons learned during POC

- Elementor autoloader maps `Token_Store` → `token-store.php` (no `class-` prefix)
- Base `Module::is_active()` always returns `true` — must override to gate on experiment flag
- `wp_safe_redirect()` rejects external domains (chatgpt.com) — use `wp_redirect()` after validating the URI against the registered whitelist
- `admin-header.php` runs before page callbacks → intercept in `admin_init` to avoid "headers already sent" errors
- localtunnel bypass page blocks server-to-server token exchange → proxy `/oauth/token` through the MCP server so it calls WP locally (no tunnel needed for the token endpoint)
- `WP_SITE_URL` must have a real default in `auth.ts` — empty string breaks `fetch()` with "Invalid URL"

---

## Setup Guide

### Prerequisites
- Local by Flywheel running with a WP site that has Elementor active
- Elementor plugin symlinked into the site:
  ```bash
  ln -s ~/Dev/elementor ~/Local\ Sites/<site>/app/public/wp-content/plugins/elementor
  ```
- ngrok: `brew install ngrok` + `ngrok config add-authtoken <token>`

### Step 1 — Enable the experiment
```bash
wp --path="~/Local Sites/<site>/app/public" \
  option set elementor_experiments '{"apps-oauth":"active"}' --format=json
```

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
npm run dev        # port 8787
```

### Step 4 — Expose via ngrok
```bash
ngrok http 8787
# copy https://<id>.ngrok-free.app
```

### Step 5 — Restart with public URL
```bash
MCP_PUBLIC_URL=https://<id>.ngrok-free.app npm run dev
```

### Step 6 — Configure ChatGPT connector
1. chatgpt.com → profile → **My GPTs** → connector settings
2. MCP Server URL: `https://<id>.ngrok-free.app/mcp`
3. Copy the callback URL → update `redirect_uri` in DB (Step 2)

### Step 7 — Connect & test
Click **Connect** → WP consent page → Allow.  
Ask ChatGPT: _"List my Elementor pages"_

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `WP_SITE_URL` | `http://baba-site-3.local:10008` | Local WP URL for backend calls |
| `WP_PUBLIC_URL` | same as `WP_SITE_URL` | WP URL for the browser-facing consent redirect |
| `MCP_PUBLIC_URL` | `http://localhost:8787` | Public MCP URL in OAuth discovery metadata |
| `PORT` | `8787` | Server port |

---

## Production Roadmap

### Phase 0 — Security (blocking — must fix before any deployment)

| # | Issue | Fix |
|---|---|---|
| 0.1 | `introspect` is unauthenticated and returns raw `app_password` | Add `X-MCP-Introspect-Key` shared secret header validation |
| 0.2 | Token lookup uses `LIKE '%token%'` — full table scan + collision risk | Store `sha256(token)` as a separate `user_meta` index key for O(1) exact lookup |
| 0.3 | Application Password stored in plaintext in `user_meta` | Store a hash; re-verify via `WP_Application_Passwords::authenticate()` on introspect |
| 0.4 | `apply-patch.ts` uses `Math.random()` for element IDs | Replace with `crypto.randomUUID()` |
| 0.5 | `CORS: *` | Lock to `https://chatgpt.com` via `ALLOWED_ORIGINS` env var |

### Phase 1 — Infrastructure

- **Deploy MCP server**: Try **Cloudflare Workers** first (edge, stateless, free).
  Fallback to **Railway** if the MCP SDK's `StreamableHTTPServerTransport` doesn't run on Workers.
- **Multi-tenancy**: `WP_SITE_URL` is currently a static env var — only works for one site.
  Fix: embed `site_url` in the token → return it from introspect → construct `WpClient` per-request.
  One MCP server deployment handles all WP sites.

### Phase 2 — OAuth Hardening

- **PKCE** (RFC 7636): `code_challenge` / `code_verifier` in authorize + token endpoints.
  Add `"code_challenge_methods_supported": ["S256"]` to discovery metadata.
- **Refresh tokens**: 30-day rotating refresh tokens so users don't re-auth every hour.
- **Token revocation** (RFC 7009): `POST /wp-json/elementor/v1/oauth/revoke` — deletes token
  and the associated Application Password. Required for "Disconnect ChatGPT" UX.

### Phase 3 — MCP Server

- Structured logging (pino) — log tool name, duration, site_url (hashed), success/error
- Rate limiting — per user, per site (Cloudflare bindings or in-process sliding window)
- **More tools** (priority order):
  - `publish_page` — set `status: publish`
  - `get_site_info` — site title, URL, Elementor version (useful as ChatGPT context)
  - `create_page` — create a new WP page with Elementor initialized
  - `search_pages` — search by title keyword
  - `list_templates` — return Elementor saved templates
- **Extend `apply_patch` ops**: `update_button_text`, `update_image_src`,
  `update_background_color`, `update_text_editor_widget`

### Phase 4 — WordPress Plugin

- **Admin UI**: Connected Apps dashboard (list active tokens + revoke button)
  → new REST endpoint `GET /wp-json/elementor/v1/oauth/tokens`
- **Multisite**: use `get_site_option`/`update_site_option` for the client registration option
- **Experiment graduation**: Alpha (`hidden: true`) → Beta → RC → Stable

### Phase 5 — Testing

- **PHPUnit** (`tests/phpunit/elementor/modules/apps-oauth/`):
  - `Token_Store`: store/consume code, single-use enforcement, token expiry, no substring collision
  - `OAuth_Controller`: client validation, PKCE enforcement, introspect key requirement
- **Vitest** (zero tests currently): auth middleware, apply-patch tree mutations, wp-client headers
- **Integration** (via `wp-env`): full OAuth flow end-to-end
- **MCP conformance**: `initialize` → `tools/list` → `tools/call` sequence against running server

---

## Priority Order

```
Phase 0 (all security fixes)
  → Phase 1 (infra + multi-tenancy)
    → Phase 2 (PKCE + refresh tokens)
      → Phase 5 (tests)
        → Phase 3 (more tools + logging)
          → Phase 4 (admin UI + experiment graduation)
```
