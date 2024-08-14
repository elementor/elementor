<?php
namespace Elementor\Modules\Checklist\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Step_Status extends Endpoint {
	public function get_name(): string {
		return 'step-status';
	}

	public function get_format(): string {
		return 'checklist/step-status';
	}

	protected function register(): void {
		parent::register();

		$args = [
			'id_arg_type_regex' => '[\w]+',
		];

		$this->register_item_route( \WP_REST_Server::EDITABLE, $args );
		$this->register_item_route( \WP_REST_Server::READABLE, $args );
	}

	protected function get_item( $id, $request ): array {
		return [
			'status' => 'step available',
		];
	}

	protected function update_item($id, $request) {
		return parent::update_item($id, $request);
	}

	protected function create_item($id, $request) {
		update_option('elementor_checklist_step_status', [] );
	}
}
