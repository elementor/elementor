<?php

namespace Elementor\Modules\AppsOauth\Includes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles:
 *  - GET  /wp-admin/admin.php?page=elementor-oauth-authorize  (consent page)
 *  - POST /wp-json/elementor/v1/oauth/token                   (code → access_token)
 *  - POST /wp-json/elementor/v1/oauth/introspect              (validate token for MCP server)
 *  - GET  /wp-json/elementor/v1/oauth/document/<post_id>      (fetch Elementor document tree)
 */
class OAuth_Controller {

	const REST_NAMESPACE = 'elementor/v1';
	const ADMIN_PAGE     = 'elementor-oauth-authorize';
	const CLIENT_OPTION  = 'elementor_chatgpt_oauth_client';

	private Token_Store $store;

	public function __construct( Token_Store $store ) {
		$this->store = $store;
	}

	// -------------------------------------------------------------------------
	// Admin page (authorization / consent)
	// -------------------------------------------------------------------------

	public function register_admin_page(): void {
		// Register the hidden page so WordPress recognises the slug and enforces capability checks.
		add_submenu_page(
			'', // hidden — no parent menu
			__( 'Authorize ChatGPT', 'elementor' ),
			__( 'Authorize ChatGPT', 'elementor' ),
			'edit_posts',
			self::ADMIN_PAGE,
			'__return_false' // Never called — intercepted in admin_init before headers are sent.
		);
	}

	/**
	 * Intercept our page in admin_init — fires before admin-header.php is included,
	 * so we can output our own HTML and redirect without "headers already sent" errors.
	 */
	public function maybe_intercept_oauth_page(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$page = sanitize_text_field( wp_unslash( $_GET['page'] ?? '' ) );

		if ( self::ADMIN_PAGE !== $page ) {
			return;
		}

		$this->render_authorize_page();
		exit;
	}

	public function render_authorize_page(): void {
		if ( ! is_user_logged_in() ) {
			wp_safe_redirect( wp_login_url( add_query_arg( [] ) ) );
			exit;
		}

		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		$client_id    = sanitize_text_field( wp_unslash( $_GET['client_id'] ?? '' ) );
		$redirect_uri = esc_url_raw( wp_unslash( $_GET['redirect_uri'] ?? '' ) );
		$state        = sanitize_text_field( wp_unslash( $_GET['state'] ?? '' ) );
		// phpcs:enable

		$client = $this->get_registered_client();

		if ( ! $client || $client['client_id'] !== $client_id ) {
			wp_die( esc_html__( 'Unknown OAuth client.', 'elementor' ), 403 );
		}

		if ( ! $redirect_uri || ! $this->redirect_uri_matches( $client, $redirect_uri ) ) {
			wp_die( esc_html__( 'Invalid redirect URI.', 'elementor' ), 403 );
		}

		// Handle form submission (user clicked Allow).
		if (
			'POST' === $_SERVER['REQUEST_METHOD'] &&
			isset( $_POST['elementor_oauth_nonce'] ) &&
			wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['elementor_oauth_nonce'] ) ), 'elementor_oauth_authorize' )
		) {
			$this->handle_consent( $redirect_uri, $state );
			return;
		}

		$this->render_consent_html( $client_id, $redirect_uri, $state );
	}

	private function handle_consent( string $redirect_uri, string $state ): void {
		$user_id = get_current_user_id();
		$user    = wp_get_current_user();

		$result = \WP_Application_Passwords::create_new_application_password(
			$user_id,
			[ 'name' => 'ChatGPT Elementor Connector - ' . gmdate( 'Y-m-d H:i' ) ]
		);

		if ( is_wp_error( $result ) ) {
			wp_die( esc_html( $result->get_error_message() ), 500 );
		}

		[ $plain_password ] = $result;

		$code = wp_generate_uuid4();
		$this->store->store_code( $code, $user_id, $user->user_login, $plain_password );

		$redirect = add_query_arg(
			array_filter( [
				'code'  => $code,
				'state' => $state,
			] ),
			$redirect_uri
		);

		// Use wp_redirect (not wp_safe_redirect) — redirect_uri is already validated against our
		// registered whitelist, and the destination (e.g. chatgpt.com) is an external domain.
		wp_redirect( $redirect ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect
		exit;
	}

	private function render_consent_html( string $client_id, string $redirect_uri, string $state ): void {
		$user        = wp_get_current_user();
		$action_url  = add_query_arg( [
			'page'         => self::ADMIN_PAGE,
			'client_id'    => rawurlencode( $client_id ),
			'redirect_uri' => rawurlencode( $redirect_uri ),
			'state'        => rawurlencode( $state ),
		], admin_url( 'admin.php' ) );
		?>
		<!DOCTYPE html>
		<html <?php language_attributes(); ?>>
		<head>
			<meta charset="<?php bloginfo( 'charset' ); ?>">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title><?php esc_html_e( 'Connect ChatGPT to Elementor', 'elementor' ); ?></title>
			<style>
				body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f0f1; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
				.card { background: #fff; border-radius: 8px; padding: 40px; max-width: 440px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
				h1 { font-size: 20px; margin: 0 0 8px; color: #1d2327; }
				p { color: #50575e; margin: 0 0 24px; line-height: 1.6; }
				.user { font-weight: 600; color: #1d2327; }
				.actions { display: flex; gap: 12px; }
				button[type=submit] { background: #2271b1; color: #fff; border: none; border-radius: 4px; padding: 10px 20px; font-size: 14px; cursor: pointer; flex: 1; }
				button[type=submit]:hover { background: #135e96; }
				a.deny { display: flex; align-items: center; justify-content: center; flex: 1; text-align: center; color: #50575e; text-decoration: none; font-size: 14px; }
			</style>
		</head>
		<body>
			<div class="card">
				<h1><?php esc_html_e( 'Connect ChatGPT to Elementor', 'elementor' ); ?></h1>
				<p>
					<?php
					printf(
						/* translators: 1: logged-in username */
						esc_html__( 'Signed in as %s. ChatGPT is requesting permission to read and edit your Elementor pages on this site.', 'elementor' ),
						'<span class="user">' . esc_html( $user->user_login ) . '</span>'
					);
					?>
				</p>
				<form method="POST" action="<?php echo esc_url( $action_url ); ?>">
					<?php wp_nonce_field( 'elementor_oauth_authorize', 'elementor_oauth_nonce' ); ?>
					<div class="actions">
						<button type="submit"><?php esc_html_e( 'Allow', 'elementor' ); ?></button>
						<a class="deny" href="<?php echo esc_url( $redirect_uri . '?error=access_denied' ); ?>"><?php esc_html_e( 'Deny', 'elementor' ); ?></a>
					</div>
				</form>
			</div>
		</body>
		</html>
		<?php
		exit;
	}

	// -------------------------------------------------------------------------
	// REST endpoints
	// -------------------------------------------------------------------------

	public function register_rest_routes(): void {
		register_rest_route( self::REST_NAMESPACE, '/oauth/token', [
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'handle_token' ],
				'permission_callback' => '__return_true',
				'args'                => [
					'code'          => [ 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
					'client_id'     => [ 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
					'client_secret' => [ 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
				],
			],
		] );

		register_rest_route( self::REST_NAMESPACE, '/oauth/introspect', [
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'handle_introspect' ],
				'permission_callback' => '__return_true',
				'args'                => [
					'token' => [ 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
				],
			],
		] );

		register_rest_route( self::REST_NAMESPACE, '/oauth/document/(?P<post_id>\d+)', [
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'handle_get_document' ],
				'permission_callback' => [ $this, 'check_edit_permission' ],
				'args'                => [
					'post_id' => [ 'required' => true, 'type' => 'integer' ],
				],
			],
		] );
	}

	public function handle_token( \WP_REST_Request $request ): \WP_REST_Response {
		$client = $this->get_registered_client();

		if (
			! $client ||
			$client['client_id'] !== $request->get_param( 'client_id' ) ||
			! hash_equals( $client['client_secret'], $request->get_param( 'client_secret' ) )
		) {
			return $this->error_response( 'invalid_client', 'Invalid client credentials.', 401 );
		}

		$code_data = $this->store->consume_code( $request->get_param( 'code' ) );

		if ( false === $code_data ) {
			return $this->error_response( 'invalid_grant', 'Authorization code is invalid or expired.', 400 );
		}

		$token = wp_generate_uuid4();
		$this->store->store_token( $token, $code_data['user_id'], $code_data['user_login'], $code_data['app_password'] );

		return $this->success_response( [
			'access_token' => $token,
			'token_type'   => 'Bearer',
			'expires_in'   => Token_Store::TOKEN_TTL_SECONDS,
			'scope'        => 'elementor:read elementor:write',
		] );
	}

	public function handle_introspect( \WP_REST_Request $request ): \WP_REST_Response {
		$entry = $this->store->find_token( $request->get_param( 'token' ) );

		if ( false === $entry ) {
			return $this->success_response( [ 'active' => false ] );
		}

		return $this->success_response( [
			'active'       => true,
			'user_id'      => $entry['user_id'],
			'user_login'   => $entry['user_login'],
			'app_password' => $entry['app_password'],
			'expires_at'   => $entry['expires_at'],
		] );
	}

	public function handle_get_document( \WP_REST_Request $request ): \WP_REST_Response {
		$post_id = (int) $request->get_param( 'post_id' );
		$post    = get_post( $post_id );

		if ( ! $post ) {
			return $this->error_response( 'not_found', 'Post not found.', 404 );
		}

		$raw  = get_post_meta( $post_id, '_elementor_data', true );
		$tree = $raw ? json_decode( $raw, true ) : [];

		return $this->success_response( [
			'post_id' => $post_id,
			'title'   => get_the_title( $post ),
			'status'  => $post->post_status,
			'tree'    => is_array( $tree ) ? $this->simplify_tree( $tree ) : [],
		] );
	}

	public function check_edit_permission(): bool {
		return current_user_can( 'edit_posts' );
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	private function get_registered_client(): ?array {
		$client = get_option( self::CLIENT_OPTION );

		// Support both PHP-serialized arrays (saved via update_option) and raw JSON strings
		// (inserted directly into the DB, e.g. during local dev setup).
		if ( is_string( $client ) ) {
			$decoded = json_decode( $client, true );
			$client  = is_array( $decoded ) ? $decoded : null;
		}

		if ( ! is_array( $client ) || empty( $client['client_id'] ) ) {
			return null;
		}

		return $client;
	}

	private function redirect_uri_matches( array $client, string $redirect_uri ): bool {
		if ( ! isset( $client['redirect_uri'] ) ) {
			return false;
		}

		// Support single string or array of allowed URIs.
		$allowed = (array) $client['redirect_uri'];

		foreach ( $allowed as $allowed_uri ) {
			if ( rtrim( $allowed_uri, '/' ) === rtrim( $redirect_uri, '/' ) ) {
				return true;
			}
		}

		return false;
	}

	private function simplify_tree( array $elements ): array {
		return array_map( function ( array $item ) {
			return [
				'id'         => $item['id'] ?? null,
				'elType'     => $item['elType'] ?? null,
				'widgetType' => $item['widgetType'] ?? null,
				'settings'   => $item['settings'] ?? [],
				'elements'   => isset( $item['elements'] ) && is_array( $item['elements'] )
					? $this->simplify_tree( $item['elements'] )
					: [],
			];
		}, $elements );
	}

	private function success_response( array $data, int $status = 200 ): \WP_REST_Response {
		$response = rest_ensure_response( $data );
		$response->set_status( $status );
		return $response;
	}

	private function error_response( string $code, string $message, int $status ): \WP_REST_Response {
		$response = rest_ensure_response( [ 'error' => $code, 'error_description' => $message ] );
		$response->set_status( $status );
		return $response;
	}
}
