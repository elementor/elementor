<?php
namespace Elementor\Modules\Debug;

use Elementor\System_Info\Main;

class Debug {
	const OPTION_NAME = 'elementor_debug_log';

	const MAX_LOGS_TO_SAVE = 10;

	const REPORT_NAME = 'debug';

	public function debug_log() {
		if ( empty( $_POST['data'] ) ) {
			return;
		}

		$log = get_option( self::OPTION_NAME, [] );

		foreach ( $_POST['data'] as $error ) {
			$last_error = end( $log );

			$compare_fields = [
				'message',
				'url',
				'line',
				'column',
			];

			if ( empty( $error['custom'] ) ) {
				$error['custom'] = [];
			}

			$all_fields_identical = false;

			if ( $last_error ) {
				$identical_fields = array_intersect( $last_error, $error );

				$required_identical_fields = array_intersect_key( array_flip( $compare_fields ), $identical_fields );

				$all_fields_identical = count( $compare_fields ) === count( $required_identical_fields );

				if ( $all_fields_identical ) {
					$error_custom_fields_count = count( $error['custom'] );

					if ( count( $last_error['custom'] ) !== $error_custom_fields_count ) {
						$all_fields_identical = false;
					} else {
						$identical_custom_fields = array_intersect( $error['custom'], $last_error['custom'] );

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

				$last_error['date'] = $error['date'];

				$log[ key( $log ) ] = $last_error;
			} else {
				$log[] = $error;
			}
		}

		if ( self::MAX_LOGS_TO_SAVE && self::MAX_LOGS_TO_SAVE < count( $log ) ) {
			$log = array_splice( $log, -10 );
		}

		update_option( self::OPTION_NAME, $log );
	}

	public function __construct() {
		add_action( 'wp_ajax_elementor_debug_log', [ $this, 'debug_log' ] );

		if ( is_admin() ) {
			$this->add_system_info_report();
		}
	}

	private function add_system_info_report() {
		Main::add_report( self::REPORT_NAME, [
			'file_name' => __DIR__ . '/' . 'debug-reporter.php',
			'class_name' => __NAMESPACE__ . '\Debug_Reporter',
		] );
	}
}
