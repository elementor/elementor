<?php
namespace Elementor\Modules\Checklist\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class User_Progress extends Endpoint_Base {
	protected function register() {
		parent::register();

		$this->register_route( '', \WP_REST_Server::CREATABLE );
	}

	public function get_name() : string {
		return 'user_progress';
	}

	public function get_format() : string {
		return 'checklist';
	}

//	protected function register () {
////		parent::register();
////
////
//		$this->register_item_route();
//		$this->register_item_route( \WP_REST_Server::EDITABLE,
////			$args = [
////			'first_closed_checklist_in_editor' => [
////				'type' => 'boolean',
////				'description' => 'if user closed the list for the first time',
////				'required' => true,
////		] ]
//		);
//
//	}

	public function get_items( $request ) {
		return $this->get_checklist_data();
	}

	public function  create_item( $id, $request ) {
		$progress_data = $this->get_checklist_data();
		if( $progress_data[ 'first_closed_checklist_in_editor' ] === false ) {
			Plugin::$instance->modules_manager->get_modules( 'checklist' )->set_user_progress();
		}
		return [
			'data' => 'success',
		];
	}

	private function get_checklist_data(): array {
		$checklist_module = Plugin::$instance->modules_manager->get_modules( 'checklist' );
		$progress_data = $checklist_module->get_user_progress_from_db();

		return [
			'data' => $progress_data,
		];
	}
}
