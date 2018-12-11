<?php

namespace Elementor\Core\Logger;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

/**
 * Elementor Log reporter.
 *
 * Elementor log reporter handler class is responsible for generating the
 * debug reports.
 *
 * @since 2.4.0
 */
class Log_Reporter extends Base_Reporter {

	public function get_title() {
		return 'Log';
	}

	public function get_fields() {
		return [
			'log_entries' => 'Log Entries',
		];
	}

	public function get_log_entries() {

		$log_string = 'No entries to display';

		/** @var \Elementor\Core\Logger\Manager $manager */
		$manager = Manager::instance();
		$logger = $manager->get_logger();
		$log_entries = $logger->get_formatted_log_entries();

		if ( ! empty( $log_entries ) ) {
			$log_string = '<br>' . implode( '<br>', $log_entries );
		}

		return [
			'value' => $log_string,
		];

	}
}
