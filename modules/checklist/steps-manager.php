<?php

namespace Elementor\Modules\Checklist;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Modules\Checklist\Steps\Step_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Steps_Manager {
	const CREATE_PAGES_STEP_ID = 'create_pages';
	/** @var Step_Base[] $step_instances */
	private $step_instances = [];

	private Module $module;

	private $steps_config;

	public function __construct( Module $module ) {
		$this->module = $module;
		$this->steps_config = $this->get_steps_config_from_source();
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
		$steps = $this->steps_config;

		foreach ( $steps as $step ) {
			$step_instance = $this->get_step_instance( $step );

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
	private function get_step_instance( $step_data ) : ?Step_Base {
		$class_name = '\\Elementor\\Modules\\Checklist\\Steps\\' . $step_data['id'];

		if ( ! class_exists( $class_name ) ) {
			return null;
		}

		/** @var Step_Base $step */
		return new $class_name( $step_data, $this->module );
	}

	/**
	 * Returns the steps config from source
	 *
	 * @return array
	 */
	private static function get_steps_config_from_source() : array {
		return [
			[
				'id' => self::CREATE_PAGES_STEP_ID,
				'title' => esc_html__( 'Create your first 3 pages', 'elementor' ),
				'description' => esc_html__( 'Jumpstart your creation with professional designs form the Template Library or start from scratch.', 'elementor' ),
				'learn_more_text' => esc_html__( 'Learn more', 'elementor' ),
				'learn_more_url' => esc_url( 'https://go.elementor.com/getting-started-with-elementor/' ),
				'cta_text' => esc_html__( 'Create a new page', 'elementor' ),
				'cta_url' => admin_url( 'post-new.php' ),
				'is_responsive_to_changes' => false,
				Step_Base::SHOULD_BE_COMPLETED_ONLY_ONCE => true,
			],
		];
	}
}
