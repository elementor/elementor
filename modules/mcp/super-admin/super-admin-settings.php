<?php

namespace Elementor\Modules\Mcp\Super_Admin;

use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Super_Admin_Settings {

	const FIELD_ID = 'super_admin_enabled';
	const OPTION = 'elementor_super_admin_enabled';
	const REQUIRED_CAPABILITY = 'manage_options';
	const ENABLED_VALUE = '1';

	public static function current_user_can_use(): bool {
		return current_user_can( self::REQUIRED_CAPABILITY );
	}

	public static function is_enabled(): bool {
		return self::ENABLED_VALUE === get_option( self::OPTION, '' );
	}

	public static function set_enabled( bool $enabled ): void {
		update_option( self::OPTION, $enabled ? self::ENABLED_VALUE : '' );
	}

	public function register_hooks(): void {
		add_action( 'elementor/admin/after_create_settings/' . Settings::PAGE_ID, [ $this, 'register_admin_settings' ], 100 );
	}

	public function register_admin_settings( Settings $settings ): void {
		$settings->add_field(
			Settings::TAB_ADVANCED,
			Settings::TAB_ADVANCED,
			self::FIELD_ID,
			[
				'label' => esc_html__( 'Super Admin for AI agents', 'elementor' ),
				'field_args' => [
					'type' => 'select',
					'std' => '',
					'options' => [
						'' => esc_html__( 'Disable', 'elementor' ),
						self::ENABLED_VALUE => esc_html__( 'Enable', 'elementor' ),
					],
					'desc' => esc_html__( 'When enabled, AI agents connected over MCP may run PHP code and read files on this server. For site administrators only.', 'elementor' ),
				],
			]
		);
	}
}
