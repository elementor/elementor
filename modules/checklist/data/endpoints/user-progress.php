<?php
namespace Elementor\Modules\Checklist\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class User_Progress extends Endpoint_Base {

	protected function register () {
		$this->register_items_route( \WP_REST_Server::EDITABLE, $args = [
			'first_closed_checklist_in_editor' => [
				'type' => 'boolean',
				'description' => 'if user closed the list for the first time',
				'required' => true,
			],
		] );
	}

	public function get_name() : string {
		return 'user_progress';
	}

	public function get_format() : string {
		return 'checklist';
	}

	public function get_items( $request ) {
		return $this->get_checklist_data();
	}

	public function update_items( $request ) {
		$progress_data = $this->get_checklist_data();
		if( $progress_data[ 'first_closed_checklist_in_editor' ] === false ) {
			Plugin::$instance->modules_manager->get_modules( 'checklist' )->set_user_progress();
		}
	}

	private function get_checklist_data(): array {
		$checklist_module = Plugin::$instance->modules_manager->get_modules( 'checklist' );
		$progress_data = $checklist_module->get_user_progress_from_db();

		return [
			'data' => $progress_data,
		];
	}
}
