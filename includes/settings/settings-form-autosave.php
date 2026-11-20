<?php
namespace Elementor;

use Elementor\Core\RoleManager\Role_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Settings_Form_Autosave {

	private const ALLOWED_OPTION_PAGES = [
		Settings::PAGE_ID,
		Tools::PAGE_ID,
		Role_Manager::PAGE_ID,
	];

	public static function register_hooks(): void {
		add_action( 'wp_ajax_elementor_admin_settings_autosave', [ self::class, 'handle_request' ] );
	}

	public static function handle_request(): void {
		$option_page = isset( $_POST['option_page'] ) ? sanitize_text_field( wp_unslash( $_POST['option_page'] ) ) : '';

		if ( ! in_array( $option_page, self::ALLOWED_OPTION_PAGES, true ) ) {
			wp_send_json_error(
				[ 'message' => esc_html__( 'Invalid settings page.', 'elementor' ) ],
				400
			);
		}

		$capability = apply_filters( "option_page_capability_{$option_page}", 'manage_options' );

		if ( ! current_user_can( $capability ) ) {
			wp_send_json_error(
				[ 'message' => esc_html__( 'You are not allowed to save these settings.', 'elementor' ) ],
				403
			);
		}

		check_ajax_referer( $option_page . '-options' );

		$settings_page = self::get_settings_page_for_option_page( $option_page );

		if ( ! $settings_page ) {
			wp_send_json_error(
				[ 'message' => esc_html__( 'Settings page is not available.', 'elementor' ) ],
				400
			);
		}

		$settings_page->register_settings_fields();

		self::persist_whitelisted_options_from_post( $option_page );

		wp_send_json_success( [ 'message' => esc_html__( 'Changes saved.', 'elementor' ) ] );
	}

	private static function get_settings_page_for_option_page( string $option_page ): ?Settings_Page {
		$plugin = Plugin::$instance;

		switch ( $option_page ) {
			case Settings::PAGE_ID:
				return $plugin->settings;
			case Tools::PAGE_ID:
				return $plugin->tools;
			case Role_Manager::PAGE_ID:
				return $plugin->role_manager;
			default:
				return null;
		}
	}

	private static function persist_whitelisted_options_from_post( string $option_page ): void {
		global $new_whitelist_options, $wp_registered_settings;

		if ( empty( $new_whitelist_options[ $option_page ] ) ) {
			wp_send_json_error(
				[ 'message' => esc_html__( 'No options are registered for this page.', 'elementor' ) ],
				400
			);
		}

		foreach ( (array) $new_whitelist_options[ $option_page ] as $option ) {
			$option = trim( (string) $option );

			if ( '' === $option ) {
				continue;
			}

			$value = null;

			if ( isset( $_POST[ $option ] ) ) {
				$value = wp_unslash( $_POST[ $option ] );

				if ( ! is_array( $value ) ) {
					$value = trim( (string) $value );
				}
			}

			if ( isset( $wp_registered_settings[ $option ]['sanitize_callback'] ) && is_callable( $wp_registered_settings[ $option ]['sanitize_callback'] ) ) {
				$value = call_user_func( $wp_registered_settings[ $option ]['sanitize_callback'], $value );
			}

			update_option( $option, $value );
		}
	}
}