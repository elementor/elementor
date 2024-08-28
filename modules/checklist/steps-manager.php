<?php

namespace Elementor\Modules\Checklist;

use Elementor\Modules\Checklist\Steps\Create_Pages;
use Elementor\Modules\Checklist\Steps\Setup_Header;
use Elementor\Modules\Checklist\Steps\Step_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Steps_Manager {
	/** @var Step_Base[] $step_instances */
	private array $step_instances = [];

	private Checklist_Module_Interface $module;
	private static $step_ids = [ Create_Pages::STEP_ID, Setup_Header::STEP_ID ];

	public function __construct( Checklist_Module_Interface $module ) {
		$this->module = $module;
		$this->register_steps();
	}

	/**
	 * Gets formatted and ordered array of step ( step data, is_marked_completed and is_completed )
	 *
	 * @return array
	 */
	public function get_steps_for_frontend() : array {
		$formatted_steps = [];

		foreach ( self::$step_ids as $step_id ) {
			$instance = $this->step_instances[ $step_id ];
			$is_marked_as_completed = $instance->is_marked_as_completed();

			$step = [
				'should_allow_undo' => $is_marked_as_completed,
				'is_completed' => $instance->is_immutable_completed() || $instance->is_marked_as_completed() || $instance->is_absolute_completed(),
				'config' => $this->get_step_config( $step_id ),
			];

			$formatted_steps[] = $step;
		}

		return $formatted_steps;
	}

	/**
	 * Marks a step as completed, returns true if the step was found and marked or false otherwise
	 *
	 * @param string $step_id
	 *
	 * @return void
	 */
	public function mark_step_as_completed( string $step_id ) : void {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				$step->mark_as_completed();

				return;
			}
		}
	}

	/**
	 * Unmarks a step as completed, returns true if the step was found and unmarked or false otherwise
	 *
	 * @param string $step_id
	 *
	 * @return void
	 */
	public function unmark_step_as_completed( string $step_id ) : void {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				$step->unmark_as_completed();

				return;
			}
		}
	}

	/**
	 * Maybe marks a step as completed (depending on if source allows it), returns true if the step was found and marked or false otherwise
	 *
	 * @param $step_id
	 *
	 * @return void
	 */
	public function maybe_set_step_as_immutable_completed( string $step_id ) : void {
		foreach ( $this->step_instances as $step ) {
			if ( $step->get_id() === $step_id ) {
				$step->maybe_mark_as_completed();

				return;
			}
		}
	}

	public function get_step_by_id( string $step_id ) : ?Step_Base {
		return $this->step_instances[ $step_id ] ?? null;
	}

	/**
	 * @return array
	 */
	public function get_step_config( $step_id ) : array {
		$step_instance = $this->step_instances[ $step_id ];

		return $step_instance
			? [
				'id' => $step_instance->get_id(),
				'title' => $step_instance->get_title(),
				'description' => $step_instance->get_description(),
				'learn_more_text' => $step_instance->get_learn_more_text(),
				'learn_more_url' => $step_instance->get_learn_more_url(),
				Step_Base::IS_COMPLETION_IMMUTABLE => $step_instance->get_is_completion_immutable(),
				'cta_text' => $step_instance->get_cta_text(),
				'cta_url' => $step_instance->get_cta_url(),
				'image_src' => $step_instance->get_image_src(),
				'required_license' => $step_instance->get_license(),
				'is_locked' => $step_instance->get_is_locked(),
				'promotion_url' => $step_instance->get_promotion_link(),
			]
			: [];
	}

	/**
	 * Getting the step instances array based on source's order
	 *
	 * @return void
	 */
	private function register_steps() : void {
		foreach ( self::$step_ids as $step_id ) {
			$step_instance = $this->get_step_instance( $step_id );

			if ( $step_instance && ! isset( $this->step_instances[ $step_id ] ) ) {
				$this->step_instances[ $step_id ] = $step_instance;
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
	private function get_step_instance( string $step_id ) : ?Step_Base {
		$class_name = '\\Elementor\\Modules\\Checklist\\Steps\\' . $step_id;

		if ( ! class_exists( $class_name ) ) {
			return null;
		}

		/** @var Step_Base $step */
		return new $class_name( $this->module, $this->module->get_wordpress_adapter() );
	}
}
