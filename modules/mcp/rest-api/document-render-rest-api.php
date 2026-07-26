<?php

namespace Elementor\Modules\Mcp\RestApi;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Renderer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Render_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'mcp/documents/(?P<post_id>\d+)/render';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			'methods' => 'GET',
			'callback' => fn( \WP_REST_Request $request ) => $this->route_wrapper( fn() => $this->handle_render( $request ) ),
			'permission_callback' => fn( \WP_REST_Request $request ) => current_user_can( 'edit_post', (int) $request->get_param( 'post_id' ) ),
			'args' => [
				'post_id' => [
					'type' => 'integer',
					'required' => true,
				],
				'element_id' => [
					'type' => 'string',
					'required' => false,
				],
				'text_limit' => [
					'type' => 'integer',
					'required' => false,
				],
			],
		] );
	}

	private function handle_render( \WP_REST_Request $request ) {
		$post_id = (int) $request->get_param( 'post_id' );
		$element_id = $request->get_param( 'element_id' );
		$element_id = is_string( $element_id ) && '' !== $element_id ? $element_id : null;
		$text_limit = $request->get_param( 'text_limit' );
		$text_limit = null !== $text_limit ? (int) $text_limit : null;

		$result = ( new Document_Renderer() )->render( $post_id, $element_id, $text_limit );

		return $this->build_response( $result );
	}

	private function build_response( $result ) {
		if ( is_wp_error( $result ) ) {
			$data = $result->get_error_data();
			$status = is_array( $data ) && isset( $data['status'] ) ? $data['status'] : 400;

			return Error_Builder::make( $result->get_error_code() )
				->set_status( $status )
				->set_message( $result->get_error_message() )
				->build();
		}

		return Response_Builder::make( $result )->build();
	}

	private function route_wrapper( callable $cb ) {
		try {
			return $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}
	}
}
