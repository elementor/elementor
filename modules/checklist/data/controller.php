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

	public function register_endpoints() {
        $this->register_endpoint( new Refresh_Checklist($this) );
	}

    public function get_item_permissions_check ( $request ) {
        return true;
    }

	public function get_items_permissions_check( $request ) {
		return true;
	}
}
