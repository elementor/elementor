<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Rest_Api {
	const API_NAMESPACE = 'elementor/v1';

	const API_BASE = 'atomic-widgets/custom-icon-svg';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'GET',
				'callback' => [ $this, 'get_svg' ],
				'permission_callback' => fn() => current_user_can( 'edit_posts' ),
				'args' => [
					'library' => [
						'type' => 'string',
						'required' => true,
						'sanitize_callback' => static function ( $value ) {
							return is_scalar( $value ) ? (string) $value : '';
						},
					],
					'value' => [
						'type' => 'string',
						'required' => false,
					],
				],
			],
		] );
	}

	public function get_svg( \WP_REST_Request $request ) {
		$library = (string) $request->get_param( 'library' );
		$value = $request->get_param( 'value' );

		if ( '' === $library ) {
			return Error_Builder::make( 'invalid_library' )
				->set_status( 400 )
				->set_message( __( 'The "library" parameter is required.', 'elementor' ) )
				->build();
		}

		if ( is_string( $value ) && '' !== $value ) {
			return Response_Builder::make( [
				'html' => Resolver::resolve( [
					'library' => $library,
					'value' => $value,
				] ),
			] )->build();
		}

		return Response_Builder::make( [
			'icons' => Resolver::resolve_library( $library ),
		] )->build();
	}
}
