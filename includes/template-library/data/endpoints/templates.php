<?php
namespace Elementor\Includes\TemplateLibrary\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Templates extends Endpoint {
	public function get_name() {
		return 'templates';
	}

	public function get_format() {
		return 'template-library/templates';
	}

	public function get_items( $request ) {
		return Plugin::$instance->templates_manager->get_library_data( [ 'filter_sources' => [ $request->get_param( 'source' ) ] ] );
	}
}
