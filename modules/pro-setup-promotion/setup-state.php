<?php

namespace Elementor\Modules\ProSetupPromotion;

use Elementor\Core\Common\Modules\Connect\Apps\Base_App;
use Elementor\Core\Common\Modules\Connect\Module as ConnectModule;
use Elementor\Modules\ProInstall\Connect;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Setup_State {

	private const PRO_PLUGIN_FILE = 'elementor-pro/elementor-pro.php';

	private const DOWNLOAD_LINK_ELIGIBILITY_TRANSIENT_PREFIX = 'elementor_pro_setup_download_eligible_';

	private const DOWNLOAD_LINK_ELIGIBILITY_TTL = HOUR_IN_SECONDS;

	public const STATE_HIDDEN = 'hidden';
	public const STATE_INSTALL = 'install';
	public const STATE_ACTIVATE = 'activate';
	public const STATE_CONNECT = 'connect';

	public static function resolve(): string {
		$state = self::resolve_without_filters();

		/**
		 * Filter the resolved setup step before capability enforcement.
		 * Must not expose install/activate/connect to users who lack the required caps.
		 *
		 * @param string $state One of Setup_State::STATE_* constants.
		 */
		$state = apply_filters( 'elementor/pro_setup_promotion/setup_state', $state );

		return self::enforce_capabilities_for_state( $state );
	}

	public static function is_pro_installed_and_inactive_in_wordpress(): bool {
		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$installed_plugins = get_plugins();

		if ( ! isset( $installed_plugins[ self::PRO_PLUGIN_FILE ] ) ) {
			return false;
		}

		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return ! is_plugin_active( self::PRO_PLUGIN_FILE );
	}

	private static function enforce_capabilities_for_state( string $state ): string {
		if ( self::STATE_HIDDEN === $state ) {
			return $state;
		}

		if ( self::STATE_INSTALL === $state && ! current_user_can( 'install_plugins' ) ) {
			return self::STATE_HIDDEN;
		}

		if ( self::STATE_ACTIVATE === $state && ! current_user_can( 'activate_plugins' ) ) {
			return self::STATE_HIDDEN;
		}

		if ( self::STATE_CONNECT === $state && ! self::can_manage_license_connection() ) {
			return self::STATE_HIDDEN;
		}

		return $state;
	}

	private static function resolve_without_filters(): string {
		if ( ! Editor_Assets::is_enabled() ) {
			return self::STATE_HIDDEN;
		}

		if ( Dismissal::is_within_cooldown() ) {
			return self::STATE_HIDDEN;
		}

		if ( Utils::is_license_expired() ) {
			return self::STATE_HIDDEN;
		}

		if ( Utils::has_pro() && Utils::is_license_active() ) {
			return self::STATE_HIDDEN;
		}

		if ( Utils::has_pro() && ! Utils::is_license_active() ) {
			return self::can_manage_license_connection() ? self::STATE_CONNECT : self::STATE_HIDDEN;
		}

		if ( self::is_pro_installed_and_inactive_in_wordpress() ) {
			return current_user_can( 'activate_plugins' ) ? self::STATE_ACTIVATE : self::STATE_HIDDEN;
		}

		if ( self::is_pro_plugin_marked_active() ) {
			return self::can_manage_license_connection() ? self::STATE_CONNECT : self::STATE_HIDDEN;
		}

		if ( Utils::has_pro() ) {
			return self::STATE_HIDDEN;
		}

		if ( ! self::has_eligible_pro_subscription() ) {
			return self::STATE_HIDDEN;
		}

		return current_user_can( 'install_plugins' ) ? self::STATE_INSTALL : self::STATE_HIDDEN;
	}

	public static function get_editor_config(): ?array {
		$state = self::resolve();

		return self::build_editor_config_for_state( $state );
	}

	public static function get_editor_config_after_plugin_change(): ?array {
		$state = self::resolve_after_plugin_change();

		return self::build_editor_config_for_state( $state );
	}

	private static function resolve_after_plugin_change(): string {
		$state = self::resolve_without_filters_after_plugin_change();

		$state = apply_filters( 'elementor/pro_setup_promotion/setup_state', $state );

		return self::enforce_capabilities_for_state( $state );
	}

	private static function resolve_without_filters_after_plugin_change(): string {
		if ( ! Editor_Assets::is_enabled() ) {
			return self::STATE_HIDDEN;
		}

		if ( Dismissal::is_within_cooldown() ) {
			return self::STATE_HIDDEN;
		}

		if ( Utils::is_license_expired() ) {
			return self::STATE_HIDDEN;
		}

		if ( Utils::has_pro() && Utils::is_license_active() ) {
			return self::STATE_HIDDEN;
		}

		if ( ( Utils::has_pro() || self::is_pro_plugin_marked_active() ) && ! Utils::is_license_active() ) {
			return self::can_manage_license_connection() ? self::STATE_CONNECT : self::STATE_HIDDEN;
		}

		return self::resolve_without_filters();
	}

	private static function build_editor_config_for_state( string $state ): ?array {
		if ( self::STATE_HIDDEN === $state ) {
			return null;
		}

		$assets = Editor_Assets::get_assets_data();
		$config = [
			'state' => $state,
			'banner' => [
				'title' => self::read_string( $assets, 'banner_title', __( 'Your Elementor Pro is ready', 'elementor' ) ),
				'description' => self::read_string( $assets, 'banner_description', __( 'Complete the setup to start creating with all the Pro features included in your subscription.', 'elementor' ) ),
			],
			'popover' => self::get_popover_copy( $state, $assets ),
		];

		if ( self::STATE_CONNECT === $state ) {
			$config['connectUrl'] = self::get_connect_url();
		}

		return $config;
	}

	private static function is_pro_plugin_marked_active(): bool {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return is_plugin_active( self::PRO_PLUGIN_FILE );
	}

	private static function get_popover_copy( string $state, array $assets ): array {
		$defaults = [
			self::STATE_INSTALL => [
				'title' => __( 'Start using Elementor Pro', 'elementor' ),
				'description' => __( 'You already have a Pro subscription. Install and activate the plugin to use Pro features on this site.', 'elementor' ),
				'ctaLabel' => __( 'Install & Activate', 'elementor' ),
			],
			self::STATE_ACTIVATE => [
				'title' => __( 'Activate Elementor Pro', 'elementor' ),
				'description' => __( 'Elementor Pro is installed on this site. Activate the plugin to continue setting it up.', 'elementor' ),
				'ctaLabel' => __( 'Activate Pro', 'elementor' ),
			],
			self::STATE_CONNECT => [
				'title' => __( 'Connect your Pro subscription', 'elementor' ),
				'description' => __( 'Elementor Pro is installed and active. Connect your subscription to start using Pro features on this site.', 'elementor' ),
				'ctaLabel' => __( 'Connect & Activate', 'elementor' ),
			],
		];

		$copy = $defaults[ $state ] ?? $defaults[ self::STATE_INSTALL ];

		return [
			'title' => self::read_state_string( $assets, 'popover_title', $state, $copy['title'] ),
			'description' => self::read_state_string( $assets, 'popover_description', $state, $copy['description'] ),
			'ctaLabel' => self::read_state_string( $assets, 'cta_label', $state, $copy['ctaLabel'] ),
		];
	}

	private static function read_state_string( array $assets, string $field, string $state, string $fallback ): string {
		$state_key = $field . '_' . $state;

		if ( ! empty( $assets[ $state_key ] ) && is_string( $assets[ $state_key ] ) ) {
			return $assets[ $state_key ];
		}

		if ( self::STATE_INSTALL === $state ) {
			return self::read_string( $assets, $field, $fallback );
		}

		return $fallback;
	}

	private static function has_eligible_pro_subscription(): bool {
		$user_id = get_current_user_id();

		if ( $user_id > 0 ) {
			$cached = get_transient( self::DOWNLOAD_LINK_ELIGIBILITY_TRANSIENT_PREFIX . $user_id );

			if ( false !== $cached ) {
				return (bool) $cached;
			}
		}

		$connect = Plugin::$instance->common->get_component( 'connect' );

		if ( ! $connect ) {
			return false;
		}

		/** @var Connect|null $pro_install_app */
		$pro_install_app = $connect->get_app( 'pro-install' );

		if ( ! $pro_install_app || ! $pro_install_app->is_connected() ) {
			return false;
		}

		$download_link = $pro_install_app->get_download_link();
		$is_eligible = ! empty( $download_link );

		if ( $user_id > 0 && $is_eligible ) {
			set_transient(
				self::DOWNLOAD_LINK_ELIGIBILITY_TRANSIENT_PREFIX . $user_id,
				1,
				self::DOWNLOAD_LINK_ELIGIBILITY_TTL
			);
		}

		return $is_eligible;
	}

	private static function can_manage_license_connection(): bool {
		return current_user_can( 'manage_options' );
	}

	private static function get_connect_url(): string {
		$connect = Plugin::$instance->common->get_component( 'connect' );

		if ( ! $connect ) {
			return '';
		}

		$app = self::get_pro_setup_connect_app( $connect );

		if ( ! $app ) {
			return '';
		}

		$connect_action = self::resolve_pro_setup_connect_action( $app );

		return $app->get_admin_url( $connect_action, [
			'utm_source' => 'editor-app',
			'utm_medium' => 'wp-dash',
			'utm_campaign' => 'pro-setup-panel',
			'utm_content' => 'connect-cta',
			'source' => 'generic',
			'mode' => 'popup',
		] );
	}

	private static function get_pro_setup_connect_app( ConnectModule $connect ) {
		if ( Utils::has_pro() ) {
			return $connect->get_app( 'activate' );
		}

		return $connect->get_app( 'activate' ) ?? $connect->get_app( 'library' );
	}

	private static function resolve_pro_setup_connect_action( Base_App $app ): string {
		if ( 'activate' !== $app->get_slug() || ! Utils::has_pro() || Utils::is_license_active() ) {
			return 'authorize';
		}

		if ( $app->is_connected() ) {
			return 'activate_pro';
		}

		return 'authorize';
	}

	private static function read_string( array $assets, string $key, string $fallback ): string {
		if ( empty( $assets[ $key ] ) || ! is_string( $assets[ $key ] ) ) {
			return $fallback;
		}

		return $assets[ $key ];
	}
}
