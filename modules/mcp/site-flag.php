<?php

namespace Elementor\Modules\Mcp;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Flag {

	const OPTION_NAME = 'elementor_mcp_used';
	const BODY_CLASS = 'elementor-mcp';

	public static function mark(): void {
		if ( self::is_set() ) {
			return;
		}

		add_option( self::OPTION_NAME, '1', '', true );
	}

	public static function is_set(): bool {
		$alloptions = wp_load_alloptions();

		return ! empty( $alloptions[ self::OPTION_NAME ] );
	}
}
