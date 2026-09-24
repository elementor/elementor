<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Auth.md — /.well-known/auth.md
 *
 * Human- and machine-readable Markdown describing how agents authenticate:
 * which methods are accepted and how to obtain credentials.
 *
 * MCP endpoint, server card, and protected-resource URLs are included only
 * when `elementor/agents/link_headers/emit_mcp_card` is true, matching
 * Link headers and Oauth_Protected_Resource.
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

	public function get_slug_aliases(): array {
		return [ 'auth' ];
	}

	public function get_content_type(): string {
		return 'text/markdown';
	}

	protected function generate_content(): string {
		$site_name     = $this->sanitize( get_bloginfo( 'name' ) );
		$home          = trailingslashit( home_url() );
		$advertise_mcp = $this->is_mcp_advertised();

		$oauth_section = $this->oauth_section( $home );
		$metadata      = $this->metadata_lines( $home, $advertise_mcp );
		$mcp_section   = $advertise_mcp ? $this->mcp_endpoint_section() : '';
		$usage_target  = $advertise_mcp ? ' with every MCP request' : '';
		$audit_log     = $advertise_mcp ? $this->audit_log_section() : '';

		/* phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped */
		$markdown = <<<MD
# Authentication — {$site_name}

> **Machine-readable metadata**
{$metadata}

---

{$mcp_section}## Authentication Methods

{$oauth_section}### Application Passwords (active)

WordPress Application Passwords provide per-agent, individually-revocable
credentials without requiring a full OAuth setup. They are available on
WordPress 5.6 and later, over HTTPS.

**Steps to obtain credentials:**

1. Ask the site owner to create a dedicated WordPress user for your agent,
   with the lowest role that covers what you need to read.
2. In *Users → Profile* (or *Users → Edit User* for another account), open
   *Application Passwords* → *Add New*.
3. Name the credential after your agent (e.g. `my-agent-prod`). WordPress shows
   that name, the creation date, and the last-used date and IP on the same screen.
4. Copy the generated password — it is shown once and cannot be retrieved later.

**Usage:**

Send HTTP Basic authentication{$usage_target}:

```
Authorization: Basic base64(username:application_password)
```

**Permissions:** An application password grants exactly the capabilities of the
WordPress user it belongs to. There is no separate Elementor role or scope to
assign. The discovery documents and Markdown page variants on this site are
public and require no credentials.
{$audit_log}
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

	private function is_mcp_advertised(): bool {
		return (bool) apply_filters( 'elementor/agents/link_headers/emit_mcp_card', false );
	}

	private function metadata_lines( string $home, bool $advertise_mcp ): string {
		$lines = [];

		if ( $advertise_mcp ) {
			$lines[] = '> - Protected resource: `' . $home . '.well-known/oauth-protected-resource`';
		}

		$lines[] = '> - API catalog: `' . $home . '.well-known/api-catalog`';

		if ( $advertise_mcp ) {
			$lines[] = '> - MCP server card: `' . $home . '.well-known/mcp/server-card.json`';
		}

		return implode( "\n", $lines );
	}

	private function mcp_endpoint_section(): string {
		$mcp_endpoint = rest_url( 'elementor/agents-mcp' );
		$is_ssl       = is_ssl() ? 'yes' : 'no (HTTPS required in production)';

		return <<<MD
## MCP Endpoint

| Property  | Value |
|-----------|-------|
| URL       | `{$mcp_endpoint}` |
| Transport | Streamable HTTP (MCP spec 2025-11-25) |
| Protocol  | JSON-RPC 2.0 over HTTP POST |
| HTTPS     | {$is_ssl} |

---

MD;
	}

	private function audit_log_section(): string {
		return <<<'MD'

---

## Audit Log

All authenticated MCP tool invocations are logged with timestamp, tool name,
agent label (Application Password name), anonymised IP hash, response status,
and duration. Logs are retained for 30 days by default.

MD;
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
