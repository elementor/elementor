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

    public function get_item_permisions_check ( $request ) {
        return true;
    }

    public function get_items_permisions_check ( $request ) {
        return true;
    }

	public function get_item( $request ) {
		return $this->get_checklist_data( $request );
	}

	public function get_items( $request ) {
		return $this->get_checklist_data( $request );
	}

	public function get_checklist_data( \WP_REST_Request $request ): array {
		$data = $request->get_params();
		$checklist_module = Plugin::elementor()->modules_manager->get_modules( 'checklist' );
		$steps_data = $checklist_module->get_step_manager()->get_steps_for_frontend();

		return [
			'data' => wp_json_encode( $steps_data ),
		];
	}
}
