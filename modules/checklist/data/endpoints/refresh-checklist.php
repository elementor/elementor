<?php
namespace Elementor\Modules\Checklist\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Base;
use Elementor\Modules\Checklist\Module as Checklist_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Refresh_Checklist extends Base {

	public function get_name() : string {
		return 'refresh-checklist';
	}

	public function get_format() : string {
		return 'checklist';
	}

	public function get_items( $request ) {
		return $this->get_checklist_data( $request );
	}

	public function get_checklist_data( \WP_REST_Request $request ): array {
		$data = $request->get_params();
		$checklist_module = Plugin::$instance->modules_manager->get_modules( 'checklist' );
		$steps_data = $checklist_module->get_steps_manager()->get_steps_for_frontend();

		return [
			'data' => $steps_data,
		];
	}
}
