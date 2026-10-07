<?php

namespace Elementor\Modules\Notifications;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Refresh {

	public static function register(): void {
		add_action( 'template_redirect', [ self::class, 'maybe_refresh' ] );
	}

	public static function maybe_refresh(): void {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}

		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}

		$notifications = self::get_notifications_instance();
		if ( ! $notifications ) {
			return;
		}

		$notifications->refresh_notifications();
	}

	private static function get_notifications_instance() {
		static $instance = false;

		if ( false !== $instance ) {
			return $instance;
		}

		$class = 'Elementor\\WPNotificationsPackage\\V120\\Notifications';
		if ( ! class_exists( $class ) ) {
			$instance = null;
			return $instance;
		}

		$instance = new $class( [
			'app_name' => 'elementor',
			'app_version' => ELEMENTOR_VERSION,
			'short_app_name' => 'elementor',
			'app_data' => [
				'plugin_basename' => defined( 'ELEMENTOR_PLUGIN_BASE' ) ? ELEMENTOR_PLUGIN_BASE : '',
			],
		] );

		return $instance;
	}
}
