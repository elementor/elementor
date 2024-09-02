<?php
namespace Elementor\Modules\Checklist\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Modules\Checklist\Steps\Step_Base;
use Elementor\Modules\Checklist\Steps_Manager;
use Elementor\Modules\Checklist\Module as Checklist_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Steps extends Endpoint_Base {

	public function get_name() : string {
		return 'steps';
	}

	public function get_format() : string {
		return 'checklist';
	}

	public function get_items( $request ) {
		return $this->get_checklist_data();
	}

	public function update_item( $id, $request ) {
		$checklist_module = Checklist_Module::instance();
		$allowed_changes = [
			Step_Base::MARKED_AS_COMPLETED_KEY => $request->get_param( Step_Base::MARKED_AS_COMPLETED_KEY ) ?? null,
			Step_Base::ABSOLUTE_COMPLETION_KEY => $request->get_param( Step_Base::ABSOLUTE_COMPLETION_KEY ) ?? null,
			Step_Base::IMMUTABLE_COMPLETION_KEY => $request->get_param( Step_Base::IMMUTABLE_COMPLETION_KEY ) ?? null,
		];

		$step = $checklist_module->get_steps_manager()->get_step_by_id( $id );

		if ( ! $step ) {
			return new \WP_Error( 'rest_invalid_step_id', 'Invalid step id', [ 'status' => 404 ] );
		}

		$step->update_step( $allowed_changes );
	}

	private function get_checklist_data(): array {
		$checklist_module = Checklist_Module::instance();
		$steps_data = $checklist_module->get_steps_manager()->get_steps_for_frontend();

		return [
			'data' => $steps_data,
		];
	}

	protected function register() {
		parent::register();

		$this->register_item_route();
		$this->register_item_route( \WP_REST_Server::EDITABLE, [
			'id_arg_name' => 'step_id',
			'id_arg_type_regex' => '[\w\-\_]+',
			'step_id' => [
				'type' => 'string',
				'description' => 'The step id.',
				'required' => true,
				'validate_callback' => function ( $step_id ) {
					return in_array( $step_id, Steps_Manager::get_step_ids() );
				},
			],
		] );
	}
}
