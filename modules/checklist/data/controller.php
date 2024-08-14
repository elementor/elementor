<?php
namespace Elementor\Modules\Checklist\Data;

use Elementor\Data\V2\Base\Controller as Base_Controller;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Base_Controller {
	public function get_name() {
		return 'checklist';
	}

	public function register_endpoints() {
		$this->register_endpoint( new Endpoints\Step_Status( $this ) );
	}
}
