<?php

namespace Elementor\Modules\Checklist\Steps;

use Elementor\Modules\Checklist\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Step_Base {
	const MARKED_AS_DONE_KEY = 'is_marked_done';
	const COMPLETED_KEY = 'is_completed';

	protected $step_data;

	/** @var Module $module */
	protected $module;

	public function __construct( $step_data, /** @var Module $module */ $module ) {
		$this->step_data = $step_data;
		$this->module = $module;
	}

	public function get_id() : string {
		return $this->step_data['id'];
	}

	public function mark_as_done() : void {
		$this->module->update_step_progress( $this->get_id(), self::MARKED_AS_DONE_KEY, true, true );
	}

	public function unmark_as_done() : void {
		$this->module->update_step_progress( $this->get_id(), self::MARKED_AS_DONE_KEY, false, true );
	}

	protected function is_completed() : bool {
		return $this->module->get_step_progress( $this->get_id() )[ self::COMPLETED_KEY ];
	}
}
