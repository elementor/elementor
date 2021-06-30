<?php
namespace Elementor\Modules\DefaultValues\Data;

use Elementor\Data\Base\Controller as Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {
	public function get_name() {
		return 'default-values';
	}

	protected function register_internal_endpoints() {
		//
	}

	public function register_endpoints() {
//		$this->register_endpoint(  )
	}
}
