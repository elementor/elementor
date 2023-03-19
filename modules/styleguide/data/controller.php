<?php
namespace Elementor\Modules\Styleguide\Data;

use Elementor\Data\V2\Base\Controller as Controller_Base;
use Elementor\Modules\Styleguide\Data\Endpoints\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Controller_Base {
	public function get_name() {
		return 'preview/styleguide';
	}

	public function register_endpoints() {
		$this->register_endpoint( new Settings( $this ) );
	}
}
