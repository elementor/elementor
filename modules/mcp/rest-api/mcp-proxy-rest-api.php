<?php

namespace Elementor\Modules\Mcp\RestApi;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\Mcp\Abilities\Create_Element_Ability;
use Elementor\Modules\Mcp\Abilities\Style_Best_Practices_Ability;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_Proxy_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE      = 'mcp-proxy';

	private array $tools     = [];
	private array $resources = [];

	public function __construct() {
		$this->tools = [
			'create-element' => fn( array $input ) => ( new Create_Element_Ability() )->execute( $input ),
		];

		$this->resources = [
			'elementor://style/best-practices' => fn() => ( new Style_Best_Practices_Ability() )->execute(),
		];
	}

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods'             => 'POST',
				'callback'            => fn( $request ) => $this->route_wrapper( fn() => $this->handle_tool( $request ) ),
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
				'args'                => [
					'tool'  => [
						'type'     => 'string',
						'required' => true,
					],
					'input' => [
						'type'     => 'object',
						'required' => true,
					],
				],
			],
			[
				'methods'             => 'GET',
				'callback'            => fn( $request ) => $this->route_wrapper( fn() => $this->handle_resource( $request ) ),
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
				'args'                => [
					'uri' => [
						'type'     => 'string',
						'required' => true,
					],
				],
			],
		] );
	}

	private function handle_tool( \WP_REST_Request $request ) {
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

		return $this->build_response( $result );
	}

	private function handle_resource( \WP_REST_Request $request ) {
		$uri = $request->get_param( 'uri' );

		if ( ! isset( $this->resources[ $uri ] ) ) {
			return Error_Builder::make( 'unknown_resource' )
				->set_status( 404 )
				// translators: By resource URI
				->set_message( sprintf( __( 'Unknown resource: %s', 'elementor' ), $uri ) )
				->build();
		}

		$result = ( $this->resources[ $uri ] )();

		return $this->build_response( $result );
	}

	private function build_response( $result ) {
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
