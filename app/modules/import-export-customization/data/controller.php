<?php

namespace Elementor\App\Modules\ImportExportCustomization\Data;

use Elementor\App\Modules\ImportExportCustomization\Data\Routes\Export;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'import-export-customization';

	public static function register_hooks() {
		add_action( 'rest_api_init', fn() => self::register_routes() );
	}

	public static function get_base_url() {
		return get_rest_url() . self::API_NAMESPACE . '/' . self::API_BASE;
	}

	private static function register_routes() {
		$export_route = new Export();

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/' . $export_route->get_route(), [
			[
				'methods' => $export_route->get_method(),
				'callback' => fn( $request ) => $export_route->callback( $request )->to_wp_rest_response(),
				'permission_callback' => fn() => $export_route->get_permission_callback()(),
				'args' => $export_route->get_args(),
			],
		] );
	}
}
