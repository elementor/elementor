<?php
namespace Elementor\Data\TemplateLibrary;

use Elementor\Data\Base\Controller as Controller_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * TODO: The valid location for this file will be in 'includes/template-library/data' but autoloader cannot handle this.
 */
class Controller extends Controller_Base {

	public function get_name() {
		return 'template-library';
	}

	public function register_endpoints() {
		$this->register_endpoint( Endpoints\Templates::class );
	}
}
