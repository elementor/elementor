<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Css_Converter_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'css-to-atomic';

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			[
				'methods' => 'POST',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->convert( $request ) ),
				'permission_callback' => fn() => is_user_logged_in(),
				'args' => [
					'blocks' => [
						'type' => 'object',
						'required' => true,
					],
				],
			],
		] );
	}

	private function convert( \WP_REST_Request $request ) {
		$blocks = $request->get_param( 'blocks' );

		if ( ! is_array( $blocks ) ) {
			return Error_Builder::make( 'invalid_blocks' )
				->set_status( 400 )
				->set_message( __( 'The "blocks" parameter must be an object of named CSS strings.', 'elementor' ) )
				->build();
		}

		$converter = new Css_Converter( Converter_Registry_Factory::create(), new Null_Failure_Reporter() );

		$results = [];

		foreach ( $blocks as $name => $css ) {
			$result = $converter->convert( (string) $css );

			$results[ $name ] = [
				'props' => (object) $result['props'],
				'customCss' => $result['customCss'],
			];
		}

		return Response_Builder::make( $results )->build();
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return Error_Builder::make( 'unexpected_error' )
				->set_message( __( 'Something went wrong', 'elementor' ) )
				->build();
		}

		return $response;
	}
}
