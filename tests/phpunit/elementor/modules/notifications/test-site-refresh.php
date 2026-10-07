<?php

namespace Elementor\Tests\Phpunit\Modules\Notifications;

use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Site_Refresh extends TestCase {

	public function test_module_registers_frontend_refresh() {
		// Arrange
		$module_source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/notifications/module.php'
		);
		$refresh_source = file_get_contents(
			dirname( __DIR__, 5 ) . '/modules/notifications/site-refresh.php'
		);

		// Act / Assert
		$this->assertStringContainsString( 'Site_Refresh::register();', $module_source );
		$this->assertStringContainsString(
			"add_action( 'template_redirect', [ self::class, 'maybe_refresh' ] );",
			$refresh_source
		);
		$this->assertStringContainsString(
			'if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {',
			$refresh_source
		);
		$this->assertStringContainsString(
			'Elementor\\WPNotificationsPackage\\V120\\Notifications',
			$refresh_source
		);
		$this->assertStringContainsString(
			'$notifications->refresh_notifications();',
			$refresh_source
		);
	}
}
