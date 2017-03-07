<?php
namespace Elementor\Debugger;

class Debugger {
	const OPTION_NAME = 'elementor_debugger_log';
	const MAX_LOGS_TO_SAVE = 10;

	public function debugger_log() {
		if ( empty( $_POST['_nonce'] ) || ! wp_verify_nonce( $_POST['_nonce'], 'elementor-editing' ) ) {
			die;
		}

		if ( empty( $_POST['data'] ) ) {
			return;
		}

		$data = json_decode( stripslashes( $_POST['data'] ), true );

		$log = get_option( self::OPTION_NAME, [] );

		$log = array_merge( $log, $data );

		if ( self::MAX_LOGS_TO_SAVE && self::MAX_LOGS_TO_SAVE < count( $log ) ) {
			$log = array_splice( $log, -10 );
		}

		update_option( self::OPTION_NAME, $log );
	}

	public function allowed_reports( $reports ) {
		$reports['debugger'] = [];

		return $reports;
	}

	public function __construct() {
		add_action( 'wp_ajax_elementor_debugger_log', [ $this, 'debugger_log' ] );
		add_action( 'elementor/system_info/allowed_reports', [ $this, 'allowed_reports' ] );
	}
}
