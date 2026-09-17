<?php

namespace Elementor\Modules\Mcp\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tool_Input_Schema_Sanitizer {

	public function register_hooks(): void {
		add_filter( 'rest_post_dispatch', [ $this, 'sanitize_rest_response' ], 10, 3 );
	}

	public function sanitize_rest_response( $response, $server, $request ) {
		if ( ! $response instanceof \WP_REST_Response || ! $request instanceof \WP_REST_Request ) {
			return $response;
		}

		if ( ! $this->is_mcp_route( $request->get_route() ) ) {
			return $response;
		}

		$data = $response->get_data();
		if ( ! is_array( $data ) ) {
			return $response;
		}

		$this->sanitize_node( $data );
		$response->set_data( $data );

		return $response;
	}

	public function sanitize_node( array &$node ): void {
		if (
			isset( $node['type'], $node['properties'] )
			&& 'object' === $node['type']
			&& is_array( $node['properties'] )
			&& empty( $node['properties'] )
		) {
			$node['properties'] = new \stdClass();
		}

		foreach ( $node as &$child ) {
			if ( is_array( $child ) ) {
				$this->sanitize_node( $child );
			}
		}
	}

	private function is_mcp_route( string $route ): bool {
		return false !== strpos( $route, '/mcp' );
	}
}
