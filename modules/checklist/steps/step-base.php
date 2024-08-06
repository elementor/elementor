<?php

namespace Elementor\Modules\Checklist\Steps;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Modules\Checklist\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Step_Base {
	const MARKED_AS_DONE_KEY = 'is_marked_done';
	const COMPLETED_KEY = 'is_completed';
	const SHOULD_BE_COMPLETED_ONLY_ONCE = 'is_completed_once';

	protected $step_data;
	protected $user_progress;
	protected Wordpress_Adapter $wordpress_adapter;

	/** @var Module $module */
	protected $module;

	/**
	 * Returns a steps current completion status
	 *
	 * @return bool
	 */
	abstract protected function get_completion_absolute_status();

	/**
	 * Step_Base constructor.
	 *
	 * @param array $step_data
	 * @param Module $module

	 * @return void
	 */
	public function __construct( $step_data, $module ) {
		$this->step_data = $step_data;
		$this->module = $module;
		$this->wordpress_adapter = $module->get_wordpress_adapter();
		$this->user_progress = $module->get_step_progress( $this->get_id() ) ?? $this->get_step_initial_progress();
	}

	/**
	 * @return string
	 */
	public function get_id() : string {
		return $this->step_data['id'];
	}

	/**
	 * Marking a step as done based on user's desire
	 *
	 * @return void
	 */
	public function mark_as_done() : void {
		$this->user_progress[ self::MARKED_AS_DONE_KEY ] = true;
		$this->set_step_progress( true );
	}

	/**
	 * Unmarking a step as done based on user's desire
	 *
	 * @return void
	 */
	public function unmark_as_done() : void {
		$this->user_progress[ self::MARKED_AS_DONE_KEY ] = false;
		$this->set_step_progress( true );
	}

	/**
	 * Marking a step as completed if it was completed once and it's suffice to marketing's requirements
	 *
	 * @return void
	 */
	public function maybe_mark_as_completed() : void {
		if ( $this->step_data[ self::SHOULD_BE_COMPLETED_ONLY_ONCE ] && $this->get_completion_absolute_status() ) {
			$this->user_progress[ self::COMPLETED_KEY ] = true;
			$this->set_step_progress( true );
		}
	}

	/**
	 * Returns the step data as well as is_marked_done and is_completed (not absolutely completed, but considered completed)
	 *
	 * @return array
	 */
	public function get_step_data() {
		return [
			'data' => $this->get_step,
			self::MARKED_AS_DONE_KEY => $this->is_marked_as_done(),
			self::COMPLETED_KEY => $this->is_marked_as_done() || $this->is_completed() || $this->get_completion_absolute_status(),
		];
	}

	/**
	 * Returns the step marked as done value
	 *
	 * @return bool
	 */
	public function is_marked_as_done() : bool {
		return $this->user_progress[ self::MARKED_AS_DONE_KEY ];
	}

	/**
	 * Returns the step completed value
	 *
	 * @return bool
	 */
	public function is_completed() : bool {
		return $this->user_progress[ self::COMPLETED_KEY ];
	}

	/**
	 * Sets and returns the initial progress of the step
	 *
	 * @return array
	 */
	public function get_step_initial_progress() {
		$initial_progress = [
			self::MARKED_AS_DONE_KEY => false,
			self::COMPLETED_KEY => false,
		];

		$this->module->set_step_progress( $this->get_id(), $initial_progress, true );

		return $initial_progress;
	}

	/**
	 * Sets the step progress
	 *
	 * @param bool $should_update_db to update locally only or globally in the db as well
	 *
	 * @return void
	 */
	private function set_step_progress( $should_update_db = false ) {
		$this->module->set_step_progress( $this->get_id(), $this->user_progress, $should_update_db );
	}
}
