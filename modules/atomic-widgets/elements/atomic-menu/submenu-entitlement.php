<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Submenu_Entitlement {
	const LICENSE_OPTION = '_elementor_pro_license_v2_data';
	const LICENSE_STATUS_EXPIRED = 'expired';

	// Single place to set the dedicated Elementor Go link once it is supplied.
	const UPGRADE_URL = '';

	public static function is_locked(): bool {
		$locked = self::is_locked_for( Utils::has_pro(), self::get_license_data() );

		/**
		 * Filters whether creating Menu Submenus is locked for the current site.
		 *
		 * @param bool $locked Whether new Submenus are locked.
		 */
		return (bool) apply_filters( 'elementor/atomic-widgets/menu/submenu/is_locked', $locked );
	}

	public static function get_upgrade_url(): string {
		/**
		 * Filters the upgrade URL of the locked Submenu popover.
		 *
		 * @param string $url The upgrade URL.
		 */
		return (string) apply_filters( 'elementor/atomic-widgets/menu/submenu/upgrade_url', self::UPGRADE_URL );
	}

	public static function get_promotion(): array {
		return [
			'title' => esc_html__( 'Mega Menu', 'elementor' ),
			'content' => esc_html__( 'Create rich navigation menus with custom layouts, images, and interactive content.', 'elementor' ),
			'ctaUrl' => self::get_upgrade_url(),
		];
	}

	public static function is_locked_for( bool $has_pro, array $license ): bool {
		if ( ! $has_pro || empty( $license ) ) {
			return true;
		}

		return empty( $license['success'] ) && self::LICENSE_STATUS_EXPIRED !== ( $license['error'] ?? '' );
	}

	private static function get_license_data(): array {
		$stored = get_option( self::LICENSE_OPTION );

		if ( ! is_array( $stored ) || ! isset( $stored['value'] ) ) {
			return [];
		}

		$data = json_decode( $stored['value'], true );

		return is_array( $data ) ? $data : [];
	}
}
