<?php

namespace Elementor\Modules\Checklist\Steps;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Checklist\Module as Checklist_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Step_Base {

	/**
	 * @var string
	 * This is the key to be set to true if the step can be completed, and still be considered completed even if the user later did something to the should have it marked as not completed
	 */
	const IS_COMPLETION_IMMUTABLE = 'is_completion_immutable';
	const MARKED_AS_COMPLETED_KEY = 'is_marked_completed';
	const IMMUTABLE_COMPLETION_KEY = 'is_completed';

	protected array $user_progress;
	protected Wordpress_Adapter_Interface $wordpress_adapter;
	protected Checklist_Module $module;

	/**
	 * Returns a steps current completion status
	 *
	 * @return bool
	 */
	abstract protected function is_absolute_completed() : bool;

	/**
	 * @return string
	 */
	abstract public function get_id() : string;

	/**
	 * @return string
	 */
	abstract public function get_title() : string;

	/**
	 * @return string
	 */
	abstract public function get_description() : string;

	/**
	 * For instance; 'Create 3 pages'
	 * @return string
	 */
	abstract public function get_cta_text() : string;

	/**
	 * @return string
	 */
	abstract public function get_cta_url() : string;

	/**
	 * @return bool
	 */
	abstract public function get_is_completion_immutable() : bool;

	/**
	 * Step_Base constructor.
	 *
	 * @param Checklist_Module $module
	 * @param ?Wordpress_Adapter_Interface $wordpress_adapter

	 * @return void
	 */
	public function __construct( Checklist_Module $module, ?Wordpress_Adapter_Interface $wordpress_adapter = null ) {
		$this->module = $module;
		$this->wordpress_adapter = $wordpress_adapter ?? new Wordpress_Adapter();
		$this->user_progress = $module->get_step_progress( $this->get_id() ) ?? $this->get_step_initial_progress();
	}

	public function get_learn_more_text() : string {
		return esc_html__( 'Learn more', 'elementor' );
	}

	public function get_learn_more_url() : string {
		return 'https://go.elementor.com/getting-started-with-elementor/';
	}

	/**
	 * Marking a step as completed based on user's desire
	 *
	 * @return void
	 */
	public function mark_as_completed() : void {
		$this->user_progress[ self::MARKED_AS_COMPLETED_KEY ] = true;
		$this->set_step_progress();
	}

	/**
	 * Unmarking a step as completed based on user's desire
	 *
	 * @return void
	 */
	public function unmark_as_completed() : void {
		$this->user_progress[ self::MARKED_AS_COMPLETED_KEY ] = false;
		$this->set_step_progress();
	}

	/**
	 * Marking a step as completed if it was completed once, and it's suffice to marketing's requirements
	 *
	 * @return void
	 */
	public function maybe_mark_as_completed() : void {
		$is_immutable_completed = $this->user_progress[ self::IMMUTABLE_COMPLETION_KEY ] ?? false;

		if ( ! $is_immutable_completed && $this->get_is_completion_immutable() && $this->is_absolute_completed() ) {
			$this->user_progress[ self::IMMUTABLE_COMPLETION_KEY ] = true;
			$this->set_step_progress();
		}
	}

	/**
	 * Returns the step marked as completed value
	 *
	 * @return bool
	 */
	public function is_marked_as_completed() : bool {
		return $this->user_progress[ self::MARKED_AS_COMPLETED_KEY ];
	}

	/**
	 * Returns the step completed value
	 *
	 * @return bool
	 */
	public function is_immutable_completed() : bool {
		return $this->user_progress[ self::IMMUTABLE_COMPLETION_KEY ];
	}

	/**
	 * Sets and returns the initial progress of the step
	 *
	 * @return array
	 */
	public function get_step_initial_progress() : array {
		$initial_progress = [
			self::MARKED_AS_COMPLETED_KEY => false,
			self::IMMUTABLE_COMPLETION_KEY => false,
		];

		$this->module->set_step_progress( $this->get_id(), $initial_progress );

		return $initial_progress;
	}

	/**
	 * Sets the step progress
	 *
	 * @return void
	 */
	private function set_step_progress() : void {
		$this->module->set_step_progress( $this->get_id(), $this->user_progress );
	}
}
