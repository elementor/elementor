<?php
namespace Elementor\Modules\Checklist\Data;

use Elementor\Data\V2\Base\Controller as Controller_Base;
use Elementor\Modules\Checklist\Data\Endpoints\Refresh_Checklist;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Controller extends Controller_Base {
	public function get_name() {
		return 'checklist';
	}

	protected function register_endpoints() {
        $this->register_endpoint( new Refresh_Checklist($this) );

	}
}
