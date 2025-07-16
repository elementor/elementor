<?php

namespace Elementor\Modules\Design_System_Generator;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Design_System_Generator_REST_API {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'design-system-generator';

	const MAX_ITEMS = 500;

	private $repository = null;

	public function register_hooks() {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/colors', [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->load_all_colors( $request ) ),
				'permission_callback' => fn() => true,
				'args' => [],
			],
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/variables-suggestions', [
			[
				'methods' => 'GET',
				'callback' => fn( $request ) => $this->route_wrapper( fn() => $this->get_variables_suggestions() ),
				'permission_callback' => fn() => true,
				'args' => [],
			],
		] );
	}

	public function get_variables_suggestions() {
		$all_posts = ( new Load_Posts_Meta() )->load();

		$variables_extractor = new Variables_Suggestions_Extractor( $all_posts );
		$suggestions = $variables_extractor->extract();

		return new \WP_REST_Response(
			[
				'variables_suggestions' => $suggestions,
			],
			200
		);
	}

	private function load_all_colors( \WP_REST_Request $request ) {
		$colors_data = Plugin::$instance->data_manager_v2->run('globals/colors');

		return new \WP_REST_Response(
			[
				'colors' => $colors_data,
			],
			200
		);
	}

	private function route_wrapper( callable $cb ) {
		try {
			$response = $cb();
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'elemtntor_design_system_generator_error',
				$e->getMessage(),
				[ 'status' => 500 ]
			);
		}

		return $response;
	}
}
