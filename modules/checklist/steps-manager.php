<?php

namespace Elementor\Modules\Checklist;

use Elementor\Modules\Checklist\Steps\Create_Pages;
use Elementor\Modules\Checklist\Steps\Step_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Steps_Manager {
	/** @var Step_Base[] $step_instances */
	private $step_instances = [];

	private Module $module;

	public function __construct( Module $module ) {
		$this->module = $module;
		$this->register_steps();
	}

	/**
	 * Gets formatted and ordered array of step ( step data, is_marked_done and is_completed )
	 *
	 * @return array
	 */
	public function get_steps_for_frontend() : array {
		$formatted_steps = [];

		foreach ( $this->step_instances as $step ) {
			$formatted_steps[] = $step->get_step_data();
		}

		return $formatted_steps;
	}

	/**
	 * Marks a step as done, returns true if the step was found and marked or false otherwise
	 *
	 * @param string $step_id
	 *
	 * @return bool
	 */
	public function mark_step_as_done( $step_id ) : bool {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				$step->mark_as_done();

				return true;
			}
		}

		return false;
	}

	/**
	 * Unmarks a step as done, returns true if the step was found and unmarked or false otherwise
	 *
	 * @param string $step_id
	 *
	 * @return bool
	 */
	public function unmark_step_as_done( $step_id ) : bool {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				$step->unmark_as_done();

				return true;
			}
		}

		return false;
	}

	/**
	 * Maybe marks a step as completed (depending on if source allows it), returns true if the step was found and marked or false otherwise
	 *
	 * @param $step_id
	 *
	 * @return bool
	 */
	public function maybe_mark_step_as_complete( $step_id ) : bool {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				$step->maybe_mark_as_completed();

				return true;
			}
		}

		return false;
	}

	public function get_step_by_id( $step_id ) : ?Step_Base {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				return $step;
			}
		}

		return null;
	}

	/**
	 * Getting the step instances array based on source's order
	 *
	 * @return void
	 */
	private function register_steps() : void {
		foreach ( $this->get_step_ids() as $step_id ) {
			$step_instance = $this->get_step_instance( $step_id );

			if ( $step_instance ) {
				$this->step_instances[] = $step_instance;
			}
		}
	}

	/**
	 * Using step data->id, instanciates and returns the step class or null if the class does not exist
	 *
	 * @param $step_data
	 *
	 * @return Step_Base|null
	 */
	private function get_step_instance( $step_id ) : ?Step_Base {
		$class_name = '\\Elementor\\Modules\\Checklist\\Steps\\' . $step_id;

		if ( ! class_exists( $class_name ) ) {
			return null;
		}

		/** @var Step_Base $step */
		return new $class_name( $this->module, $this->module->get_wordpress_adapter() );
	}

	/**
	 * Returns the steps config from source
	 *
	 * @return array
	 */
	private static function get_step_ids() : array {
		return [ Create_Pages::STEP_ID ];
	}
}
