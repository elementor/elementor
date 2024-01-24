<?php
namespace Elementor\Modules\Notifications;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'notification-center';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/admin_top_bar/before_enqueue_scripts', function() {
			if ( ! current_user_can( 'manage_options' ) ) {
				return;
			}

			wp_enqueue_script(
				'e-admin-notifications',
				$this->get_js_assets_url( 'admin-notifications' ),
				[
					'elementor-v2-ui',
					'elementor-v2-icons',
					'elementor-v2-query',
					'wp-i18n',
				],
				ELEMENTOR_VERSION,
				true
			);

			wp_localize_script(
				'e-admin-notifications',
				'elementorNotifications',
				$this->get_app_js_config()
			);
		}, 5 /* Before Elementor's admin enqueue scripts */ );

		add_action( 'elementor/editor/after_enqueue_scripts', function() {
			wp_enqueue_script(
				'e-editor-notifications',
				$this->get_js_assets_url( 'editor-notifications' ),
				[
					'elementor-editor',
					'elementor-v2-ui',
					'elementor-v2-icons',
					'elementor-v2-query',
					'wp-i18n',
				],
				ELEMENTOR_VERSION,
				true
			);

			wp_localize_script(
				'e-editor-notifications',
				'elementorNotifications',
				$this->get_app_js_config()
			);
		} );

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}

	private function get_app_js_config() : array {
		return [
			'is_unread' => Options::has_unread_notifications(),
		];
	}

	public function register_ajax_actions( $ajax ) {
		$ajax->register_ajax_action( 'notifications_get', [ $this, 'ajax_get_notifications' ] );
	}

	public function ajax_get_notifications() {
		$notifications = API::get_notifications_by_conditions( true );

		Options::mark_notification_read( $notifications );

		return $notifications;
	}
}
