<?php

namespace Elementor\Modules\Checklist;

use Elementor\Modules\Checklist\Steps\Step_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Steps_Manager {
	/** @var Step_Base[] $step_instances */
	private $step_instances = [];

	private Module $module;

	private $steps_config;

	public function __construct( Module $module ) {
		$this->module = $module;
		$this->steps_config = $this->get_steps_config_from_source();
		$this->register_steps();
	}

	public function get_progress_for_frontend() : array {
		$formatted_steps = [];

		foreach ( $this->step_instances as $step ) {
			$formatted_steps[] = $this->module->get_step_progress( $step->get_id() );
		}

		return $formatted_steps;
	}

	public function mark_step_as_done( $step_id ) : void {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				$step->mark_as_done();

				return;
			}
		}
	}

	public function unmark_step_as_done( $step_id ) : void {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				$step->unmark_as_done();

				return;
			}
		}
	}

	private function register_steps() : void {
		$steps = $this->steps_config;

		foreach ( $steps as $step ) {
			$step_instance = $this->get_step_instance( $step );

			if ( ! $step_instance ) {
				continue;
			}

			$this->step_instances[] = $step_instance;
		}
	}

	private function get_step_instance( $step_data ) : ?Step_Base {
		$class_name = '\\Elementor\\Modules\\App\\Steps\\' . $step_data['id'];

		if ( ! class_exists( $class_name ) ) {
			return null;
		}

		/** @var Step_Base $step */
		return new $class_name( $step_data, $this->module );
	}

	private static function get_steps_config_from_source() : array {
		return [
			[
				'id' => 'create_pages',
				'title' => esc_html__( 'Create your first 3 pages', 'elementor' ),
				'description' => esc_html__( 'Jumpstart your creation with professional designs form the Template Library or start from scratch.', 'elementor' ),
				'learn_more_text' => esc_html__( 'Learn more', 'elementor' ),
				'learn_more_url' => esc_url( 'https://go.elementor.com/getting-started-with-elementor/' ),
				'cta_text' => esc_html__( 'Create a new page', 'elementor' ),
				'cta_url' => admin_url( 'post-new.php' ),
				'is_responsive_to_changes' => false,
			],
		];
	}
}
