<?php

namespace Elementor\Modules\Mcp\Oauth;

use WP\MCP\Transport\Contracts\McpRestTransportInterface;
use WP\MCP\Transport\Infrastructure\HttpRequestContext;
use WP\MCP\Transport\Infrastructure\HttpRequestHandler;
use WP\MCP\Transport\Infrastructure\McpTransportContext;
use WP\MCP\Transport\Infrastructure\McpTransportHelperTrait;
use WPMedia\MCP\OAuth\Auth\JWT;
use WPMedia\MCP\OAuth\Auth\SecretManager;
use WPMedia\MCP\OAuth\Logging\McpLogger;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Elementor_Oauth_Http_Transport implements McpRestTransportInterface {
	use McpTransportHelperTrait;

	/** @var HttpRequestHandler */
	private $request_handler;

	public function __construct( McpTransportContext $transport_context ) {
		$this->request_handler = new HttpRequestHandler( $transport_context );
		add_action( 'rest_api_init', [ $this, 'register_routes' ], 16 );
	}

	public function register_routes(): void {
		$server = $this->request_handler->get_transport_context()->mcp_server;

		register_rest_route(
			$server->get_server_route_namespace(),
			$server->get_server_route(),
			[
				'methods' => [ 'POST', 'GET', 'DELETE' ],
				'callback' => [ $this, 'handle_request' ],
				'permission_callback' => [ $this, 'check_permission' ],
			]
		);
	}

	public function check_permission( \WP_REST_Request $request ): bool {
		return true;
	}

	public function handle_request( \WP_REST_Request $request ): \WP_REST_Response {
		$authorization = $request->get_header( 'Authorization' );

		if ( ! empty( $authorization ) && 0 === strpos( $authorization, 'Bearer ' ) ) {
			$user_or_error = $this->validate_bearer_token( $request );

			if ( is_wp_error( $user_or_error ) ) {
				return $this->build_auth_error_response( $user_or_error );
			}
		} elseif ( ! $this->user_has_transport_permission( $request ) ) {
			return $this->build_permission_denied_response();
		}

		$context = new HttpRequestContext( $request );

		return $this->request_handler->handle_request( $context );
	}

	private function user_has_transport_permission( \WP_REST_Request $request ): bool {
		$context = new HttpRequestContext( $request );
		$transport_context = $this->request_handler->get_transport_context();

		if ( null !== $transport_context->transport_permission_callback ) {
			try {
				$result = call_user_func( $transport_context->transport_permission_callback, $context->request );

				if ( ! is_wp_error( $result ) ) {
					return (bool) $result;
				}

				$transport_context->error_handler->log(
					'Permission callback returned WP_Error: ' . $result->get_error_message(),
					[ 'Elementor_Oauth_Http_Transport::user_has_transport_permission' ]
				);

				return false;
			} catch ( \Throwable $e ) {
				$transport_context->error_handler->log(
					'Error in transport permission callback: ' . $e->getMessage(),
					[ 'Elementor_Oauth_Http_Transport::user_has_transport_permission' ]
				);

				return false;
			}
		}

		$user_capability = apply_filters( 'mcp_adapter_default_transport_permission_user_capability', 'read', $context );

		if ( ! is_string( $user_capability ) || empty( $user_capability ) ) {
			$user_capability = 'read';
		}

		return current_user_can( $user_capability ); // phpcs:ignore WordPress.WP.Capabilities.Undetermined
	}

	private function validate_bearer_token( \WP_REST_Request $request ) {
		$authorization = $request->get_header( 'Authorization' );

		if ( empty( $authorization ) || 0 !== strpos( $authorization, 'Bearer ' ) ) {
			return $this->unauthenticated_error();
		}

		$token = substr( $authorization, 7 );
		$claims = JWT::decode( $token, SecretManager::get_secret() );

		if ( null === $claims ) {
			return $this->unauthenticated_error( 'invalid_token', 'JWT signature invalid or token expired.' );
		}

		$expected_aud = Oauth_Integration::get_elementor_mcp_rest_url();
		$token_aud = $claims['aud'] ?? '';

		if ( $token_aud !== $expected_aud ) {
			McpLogger::log(
				'TRANSPORT',
				'rejected: JWT audience mismatch',
				[
					'token_aud' => $token_aud,
					'expected_aud' => $expected_aud,
				]
			);

			return $this->unauthenticated_error( 'invalid_token', 'JWT audience mismatch.' );
		}

		$expected_iss = home_url();
		$token_iss = (string) ( $claims['iss'] ?? '' );

		if ( $token_iss !== $expected_iss ) {
			return $this->unauthenticated_error( 'invalid_token', 'JWT issuer mismatch.' );
		}

		$user_id = (int) ( $claims['sub'] ?? 0 );
		$app_pass_uuid = (string) ( $claims['app_pass_id'] ?? '' );

		if ( 0 === $user_id || '' === $app_pass_uuid ) {
			return $this->unauthenticated_error( 'invalid_token', 'Malformed JWT claims.' );
		}

		$app_pass = \WP_Application_Passwords::get_user_application_password( $user_id, $app_pass_uuid );

		if ( ! is_array( $app_pass ) ) {
			return $this->unauthenticated_error( 'invalid_token', 'MCP session has been revoked.' );
		}

		$user = get_user_by( 'id', $user_id );

		if ( false === $user ) {
			return $this->unauthenticated_error( 'invalid_token', 'User not found.' );
		}

		wp_set_current_user( $user_id );

		return $user;
	}

	private function unauthenticated_error( $code = 'unauthorized', $description = '' ) {
		$base_url = home_url();

		$www_auth = sprintf(
			'Bearer realm="%s", resource_metadata="%s/.well-known/oauth-protected-resource"',
			esc_url( $base_url ),
			esc_url( $base_url )
		);

		if ( '' !== $description ) {
			$www_auth .= sprintf( ', error="%s", error_description="%s"', $code, $description );
		}

		return new \WP_Error(
			'mcp_unauthorized',
			'' !== $description ? $description : __( 'MCP authentication required.', 'elementor' ),
			[
				'status' => 401,
				'WWW-Authenticate' => $www_auth,
			]
		);
	}

	private function build_auth_error_response( \WP_Error $error ): \WP_REST_Response {
		$error_data = $error->get_error_data();
		$www_auth = is_array( $error_data ) ? ( $error_data['WWW-Authenticate'] ?? '' ) : '';
		$status = is_array( $error_data ) ? (int) ( $error_data['status'] ?? 401 ) : 401;

		$response = new \WP_REST_Response(
			[
				'code' => $error->get_error_code(),
				'message' => $error->get_error_message(),
				'data' => [ 'status' => $status ],
			],
			$status
		);

		if ( '' !== $www_auth ) {
			$response->header( 'WWW-Authenticate', $www_auth );
		}

		return $response;
	}

	private function build_permission_denied_response(): \WP_REST_Response {
		$status = is_user_logged_in() ? 403 : 401;

		return new \WP_REST_Response(
			[
				'code' => 'rest_forbidden',
				'message' => __( 'Sorry, you are not allowed to do that.', 'elementor' ),
				'data' => [ 'status' => $status ],
			],
			$status
		);
	}
}
