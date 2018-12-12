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

	const MAX_ENTRIES = 20;

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
		$log_entries = $logger->get_formatted_log_entries( self::MAX_ENTRIES, true );

		if ( ! empty( $log_entries ) ) {
			$log_string = '';
			foreach ( $log_entries as $key => $log_entry ) {
				$log_string .= '<table><thead><th>' . $key . '</th></thead><tbody>' . $log_entry . '</tbody></table>';
			}
		}

		return [
			'value' => $log_string,
		];

	}
}
