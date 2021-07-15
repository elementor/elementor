<?php
namespace Elementor\Includes\TemplateLibrary\Data;

use Elementor\Data\Base\Controller as Controller_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Controller_Base {

	public function get_name() {
		return 'template-library';
	}

	public function register_endpoints() {
		$this->register_endpoint( Endpoints\Templates::class );
	}
}
