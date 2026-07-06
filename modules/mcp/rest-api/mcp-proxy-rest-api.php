<?php

namespace Elementor\Modules\Mcp\RestApi;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\Mcp\Abilities\Create_Element_Ability;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_Proxy_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE      = 'mcp-proxy';

	private array $tools = [];

	public function __construct() {
		$this->tools = [
			'create-element' => fn( array $input ) => ( new Create_Element_Ability() )->execute( $input ),
		];
	}

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods'             => 'POST',
				'callback'            => fn( $request ) => $this->route_wrapper( fn() => $this->handle( $request ) ),
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
				'args'                => [
					'tool'  => [
						'type' => 'string',
						'required' => true,
					],
					'input' => [
						'type' => 'object',
						'required' => true,
					],
				],
			],
		] );
	}

	private function handle( \WP_REST_Request $request ) {
		$tool  = $request->get_param( 'tool' );
		$input = $request->get_param( 'input' );

		if ( ! isset( $this->tools[ $tool ] ) ) {
			return Error_Builder::make( 'unknown_tool' )
				->set_status( 404 )
				// translators: By tool name
				->set_message( sprintf( __( 'Unknown tool: %s', 'elementor' ), $tool ) )
				->build();
		}

		$result = ( $this->tools[ $tool ] )( is_array( $input ) ? $input : [] );

		if ( is_wp_error( $result ) ) {
			$data   = $result->get_error_data();
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
