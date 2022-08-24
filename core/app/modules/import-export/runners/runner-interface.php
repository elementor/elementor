<?php

namespace Elementor\Core\App\Modules\ImportExport\Runners;

interface Runner_Interface {

	/**
	 * Get the name of the runners, used to identify the runner.
	 * The name should be unique, unless you want to run over existing runner.
	 *
	 * @return string
	 */
	public static function get_name() : string;
}
