<?php
declare( strict_types = 1 );

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Top_Bar_Handler {

	private Menu_Data_Provider $menu_data_provider;

	public function __construct() {
		$this->menu_data_provider = Menu_Data_Provider::instance();
		$this->register_actions();
	}

	private function register_actions(): void {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_top_bar_assets' ] );
		add_action( 'in_admin_header', [ $this, 'render_top_bar_container' ], 5 );
		add_filter( 'admin_body_class', [ $this, 'add_body_class' ] );
		add_filter( 'elementor/admin-top-bar/is-active', [ $this, 'disable_old_top_bar' ] );
	}

	public function disable_old_top_bar( bool $is_active ): bool {
		if ( $this->menu_data_provider->is_elementor_editor_page() ) {
			return false;
		}

		return $is_active;
	}

	public function add_body_class( string $classes ): string {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return $classes;
		}

		return $classes . ' e-has-top-bar';
	}

	public function enqueue_top_bar_assets(): void {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return;
		}

		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_style(
			'elementor-top-bar',
			ELEMENTOR_URL . 'modules/editor-one/assets/css/top-bar.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'e-top-bar',
			ELEMENTOR_ASSETS_URL . 'js/e-top-bar' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
				'elementor-v2-icons',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			'e-top-bar',
			'elementorTopBarConfig',
			$this->get_top_bar_config()
		);

		wp_set_script_translations( 'e-top-bar', 'elementor' );
	}

	public function render_top_bar_container(): void {
		if ( ! $this->menu_data_provider->is_elementor_editor_page() ) {
			return;
		}

		echo '<div id="e-editor-top-bar"></div>';
	}

	private function get_top_bar_config(): array {
		return [
			'isRTL' => is_rtl(),
			'title' => esc_html__( 'Website builder', 'elementor' ),
			'accountUrl' => 'https://go.elementor.com/wp-dash-admin-bar-account/',
			'accountText' => esc_html__( 'My Account', 'elementor' ),
			'tipsUrl' => 'https://go.elementor.com/wp-dash-top-bar-academy/',
			'helpUrl' => 'https://go.elementor.com/wp-dash-top-bar-help/',
			'hasUnreadNotifications' => $this->has_unread_notifications(),
		];
	}

	private function has_unread_notifications(): bool {
		$notifications_settings = get_option( 'elementor_notifications', [] );

		return ! empty( $notifications_settings['is_unread'] );
	}
}
