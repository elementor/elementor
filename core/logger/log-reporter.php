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
		/** @var \Elementor\Core\Logger\Manager $manager */
		$manager = Manager::instance();
		$logger = $manager->get_logger();
		$log = $logger->get_log();

		if ( empty( $log ) ) {
			$log_string = 'No entries to display';
		} else {
			$log_string = '<br>';

			foreach ( $log as $index => $item ) {
				$log_string .= $item->format() . '<br>';
			}
		}

		return [
			'value' => $log_string,
		];

	}
}
