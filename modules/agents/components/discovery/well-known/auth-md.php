<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Auth.md — /.well-known/auth.md
 *
 * Human- and machine-readable Markdown describing how agents authenticate:
 * which methods are accepted, how to obtain credentials, available scopes,
 * and the MCP endpoint location.
 *
 * Content type: text/markdown
 *
 * Applicable whenever this module is active (always in MVP).
 */
class Auth_Md extends Abstract_Well_Known_Endpoint {

	public function get_id(): string {
		return 'auth_md';
	}

	public function get_well_known_slug(): string {
		return 'auth.md';
	}

	public function get_content_type(): string {
		return 'text/markdown';
	}

	protected function generate_content(): string {
		$site_name    = $this->sanitize( get_bloginfo( 'name' ) );
		$home         = trailingslashit( home_url() );
		$mcp_endpoint = rest_url( 'elementor/agents-mcp' );
		$is_ssl       = is_ssl() ? 'yes' : 'no (HTTPS required in production)';

		$oauth_section = $this->oauth_section( $home );

		/* phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped */
		$markdown = <<<MD
# Authentication — {$site_name}

> **Machine-readable metadata**
> - Protected resource: `{$home}.well-known/oauth-protected-resource`
> - API catalog: `{$home}.well-known/api-catalog`
> - MCP server card: `{$home}.well-known/mcp/server-card.json`

---

## MCP Endpoint

| Property  | Value |
|-----------|-------|
| URL       | `{$mcp_endpoint}` |
| Transport | Streamable HTTP (MCP spec 2025-11-25) |
| Protocol  | JSON-RPC 2.0 over HTTP POST |
| HTTPS     | {$is_ssl} |

---

## Authentication Methods

### Application Passwords (active)

WordPress Application Passwords provide per-agent, individually-revocable
credentials without requiring a full OAuth setup.

**Steps to obtain credentials:**

1. Create a WordPress account and assign the `elementor_agent` role.
2. Visit `/wp-admin/profile.php` → *Application Passwords* → *Add New*.
3. Name the password after your agent (e.g. `my-agent-prod`) — this name
   appears in the request log for attribution.
4. Copy the generated password (shown once).

**Usage:**

Send HTTP Basic authentication with every MCP request:

```
Authorization: Basic base64(username:application_password)
```

**Required capability:** `elementor_agent_read`

{$oauth_section}---

## Scopes

| Scope                  | Description |
|------------------------|-------------|
| `elementor_agent_read` | Read-only access to site content via MCP tools. |

---

## Rate Limits

Rate limits apply per Application Password token. Excessive requests receive
HTTP 429. Limits are configurable by the site owner.

---

## Audit Log

All authenticated MCP tool invocations are logged with timestamp, tool name,
agent label (Application Password name), anonymised IP hash, response status,
and duration. Logs are retained for 30 days by default.

MD;
		/* phpcs:enable */

		/**
		 * Filter the Auth.md content before serving.
		 *
		 * @param string $markdown Generated Markdown.
		 * @param string $home     The site home URL.
		 */
		return (string) apply_filters( 'elementor/agents/auth_md_content', $markdown, $home );
	}

	private function oauth_section( string $home ): string {
		$applicable = (bool) apply_filters( 'elementor/agents/oauth_authorization_server/is_applicable', false );

		if ( ! $applicable ) {
			return '';
		}

		$token_url = (string) apply_filters(
			'elementor/agents/oauth_authorization_server/token_endpoint',
			rest_url( 'elementor/agents/oauth/token' )
		);

		return <<<MD

### OAuth 2.1 + PKCE (available)

| Property             | Value |
|----------------------|-------|
| Authorization server | `{$home}.well-known/oauth-authorization-server` |
| Token endpoint       | `{$token_url}` |
| Grant type           | `authorization_code` with PKCE (S256) |

MD;
	}
}
