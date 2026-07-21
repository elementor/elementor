<?php

namespace Elementor\Core\Common\Modules\EventsManager\RestApi;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Events_Proxy_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'events';

	const API_UPSTREAM_HOST = 'https://api-eu.mixpanel.com';
	const LIBS_UPSTREAM_HOST = 'https://cdn.mxpnl.com/libs';

	const REQUEST_TIMEOUT = 3;
	const MAX_BODY_BYTES = 10 * MB_IN_BYTES;

	const FORWARDED_REQUEST_HEADERS = [ 'content-type', 'authorization', 'content-encoding' ];

	const RAW_RESPONSE_HEADER = 'X-Elementor-Raw-Proxy-Response';

	const ASYNC_DISPATCH_PATHS = [ 'track', 'engage', 'groups', 'record' ];
	const ASYNC_DISPATCH_SUCCESS_BODY = '1';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
		add_filter( 'rest_authentication_errors', [ $this, 'bypass_nonce_check_for_own_routes' ], 0 );
		add_filter( 'rest_pre_serve_request', [ $this, 'maybe_serve_raw_response' ], 10, 2 );
	}

	public function bypass_nonce_check_for_own_routes( $result ) {
		if ( $this->is_own_route_request() ) {
			return true;
		}

		return $result;
	}

	public function maybe_serve_raw_response( $served, $result ) {
		if ( ! ( $result instanceof \WP_REST_Response ) ) {
			return $served;
		}

		$headers = $result->get_headers();

		if ( empty( $headers[ self::RAW_RESPONSE_HEADER ] ) ) {
			return $served;
		}

		if ( ! headers_sent() ) {
			status_header( $result->get_status() );

			foreach ( $headers as $name => $value ) {
				if ( self::RAW_RESPONSE_HEADER === $name ) {
					continue;
				}

				header( "{$name}: {$value}" );
			}
		}

		echo $result->get_data(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- raw upstream body, must be sent byte-for-byte.

		return true;
	}

	private function is_own_route_request(): bool {
		$request_uri = Utils::get_super_global_value( $_SERVER, 'REQUEST_URI' ) ?? '';

		return false !== strpos( $request_uri, self::API_NAMESPACE . '/' . self::API_BASE . '/' );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/api/(?P<path>.+)', [
			'methods' => \WP_REST_Server::ALLMETHODS,
			'callback' => fn( \WP_REST_Request $request ) => $this->proxy_api_request( $request ),
			'permission_callback' => fn() => current_user_can( 'edit_posts' ),
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/libs/(?P<file>[\w\-.]+)', [
			'methods' => 'GET',
			'callback' => fn( \WP_REST_Request $request ) => $this->proxy_libs_request( $request ),
			'permission_callback' => fn() => current_user_can( 'edit_posts' ),
		] );
	}

	private function proxy_api_request( \WP_REST_Request $request ) {
		$path = ltrim( (string) $request->get_param( 'path' ), '/' );
		$query = $request->get_query_params();

		unset( $query['rest_route'] );

		$url = self::API_UPSTREAM_HOST . '/' . $path;

		if ( ! empty( $query ) ) {
			$url = add_query_arg( $query, $url );
		}

		return $this->forward_request( $url, $request, $this->is_fire_and_forget_path( $path ) );
	}

	private function is_fire_and_forget_path( string $path ): bool {
		return in_array( strtok( $path, '/' ), self::ASYNC_DISPATCH_PATHS, true );
	}

	private function proxy_libs_request( \WP_REST_Request $request ) {
		$file = (string) $request->get_param( 'file' );
		$url = self::LIBS_UPSTREAM_HOST . '/' . $file;

		return $this->forward_request( $url, $request );
	}

	private function forward_request( string $url, \WP_REST_Request $request, bool $async = false ) {
		$body = $request->get_body();

		if ( strlen( $body ) > self::MAX_BODY_BYTES ) {
			return $this->build_raw_response( '', 413 );
		}

		$args = [
			'method' => $request->get_method(),
			'timeout' => self::REQUEST_TIMEOUT,
			'redirection' => 2,
			'headers' => $this->build_forwarded_headers( $request ),
		];

		if ( ! empty( $body ) ) {
			$args['body'] = $body;
		}

		if ( $async ) {
			$args['blocking'] = false;

			wp_remote_request( $url, $args );

			return $this->build_raw_response( self::ASYNC_DISPATCH_SUCCESS_BODY, 200, 'text/plain' );
		}

		$response = wp_remote_request( $url, $args );

		if ( is_wp_error( $response ) ) {
			return $this->build_raw_response( '', 502 );
		}

		return $this->build_raw_response(
			wp_remote_retrieve_body( $response ),
			(int) wp_remote_retrieve_response_code( $response ),
			wp_remote_retrieve_header( $response, 'content-type' )
		);
	}

	private function build_forwarded_headers( \WP_REST_Request $request ): array {
		$headers = [];

		foreach ( self::FORWARDED_REQUEST_HEADERS as $header_name ) {
			$value = $request->get_header( $header_name );

			if ( null !== $value && '' !== $value ) {
				$headers[ $header_name ] = $value;
			}
		}

		$remote_address = Utils::get_super_global_value( $_SERVER, 'REMOTE_ADDR' );
		$host = Utils::get_super_global_value( $_SERVER, 'HTTP_HOST' );

		if ( $remote_address ) {
			$headers['x-forwarded-for'] = $remote_address;
		}

		if ( $host ) {
			$headers['x-forwarded-host'] = $host;
		}

		return $headers;
	}

	private function build_raw_response( string $body, int $status, string $content_type = '' ) {
		$response = new \WP_REST_Response( $body, $status );

		if ( $content_type ) {
			$response->header( 'Content-Type', $content_type );
		}

		$response->header( self::RAW_RESPONSE_HEADER, '1' );

		return $response;
	}
}
