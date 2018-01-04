<?php
namespace Elementor\Debug;

use Elementor\System_Info\Main;

/**
 * Elementor debug class.
 *
 * Elementor debug handler class is responsible for logging errors and
 * generating debug reports.
 *
 * @since 1.4.0
 */
class Debug {

	/**
	 * Debug option name in the database.
	 */
	const OPTION_NAME = 'elementor_debug_log';

	/**
	 * Maximum debug logs to save in the database.
	 */
	const MAX_LOGS_TO_SAVE = 10;

	/**
	 * Debug report name.
	 */
	const REPORT_NAME = 'debug';

	/**
	 * Debug log.
	 *
	 * Log Elementor errors and save them in the database.
	 *
	 * Fired by `wp_ajax_elementor_debug_log` action.
	 *
	 * @since 1.4.0
	 * @access public
	 */
	public function debug_log() {
		if ( empty( $_POST['data'] ) ) {
			return;
		}

		$log = get_option( self::OPTION_NAME, [] );

		foreach ( $_POST['data'] as $error ) {
			$last_error = end( $log );

			$compare_fields = [
				'type',
				'message',
				'url',
				'line',
				'column',
			];

			if ( empty( $error['customFields'] ) ) {
				$error['customFields'] = [];
			}

			$all_fields_identical = false;

			if ( $last_error ) {
				$compare_fields_as_keys = array_flip( $compare_fields );

				$error_requires_equality_fields = array_intersect_key( $error, $compare_fields_as_keys );

				$last_error_requires_equality_fields = array_intersect_key( $last_error, $compare_fields_as_keys );

				$identical_fields = array_intersect( $error_requires_equality_fields, $last_error_requires_equality_fields );

				$all_fields_identical = count( $compare_fields ) === count( $identical_fields );

				if ( $all_fields_identical ) {
					$error_custom_fields_count = count( $error['customFields'] );

					if ( count( $last_error['customFields'] ) !== $error_custom_fields_count ) {
						$all_fields_identical = false;
					} else {
						$identical_custom_fields = array_intersect( $error['customFields'], $last_error['customFields'] );

						$all_fields_identical = count( $identical_custom_fields ) === $error_custom_fields_count;
					}
				}
			}

			if ( $last_error && $all_fields_identical ) {
				if ( empty( $last_error['times'] ) ) {
					$last_error['times'] = 2;
				} else {
					$last_error['times']++;
				}

				$last_error['timestamp'] = $error['timestamp'];

				$log[ key( $log ) ] = $last_error;
			} else {
				$log[] = $error;
			}
		}

		if ( self::MAX_LOGS_TO_SAVE && self::MAX_LOGS_TO_SAVE < count( $log ) ) {
			$log = array_splice( $log, -self::MAX_LOGS_TO_SAVE );
		}

		update_option( self::OPTION_NAME, $log );
	}

	/**
	 * Add system info debug report.
	 *
	 * Create new system info debug report.
	 *
	 * @since 1.4.0
	 * @access private
	 */
	private function add_system_info_report() {
		Main::add_report(
			self::REPORT_NAME, [
				'file_name' => __DIR__ . '/' . 'debug-reporter.php',
				'class_name' => __NAMESPACE__ . '\Debug_Reporter',
			]
		);
	}

	/**
	 * Debug constructor.
	 *
	 * Initializing Elementor debug and logging errors.
	 *
	 * @since 1.4.0
	 * @access public
	 */
	public function __construct() {
		add_action( 'wp_ajax_elementor_debug_log', [ $this, 'debug_log' ] );

		if ( is_admin() ) {
			$this->add_system_info_report();
		}
	}
}
