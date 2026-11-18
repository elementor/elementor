<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu;

use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Submenu_Entitlement {
	const SUBMENU_TYPE = 'e-menu-submenu';

	// Single place to change the Elementor Go link of the locked Submenu popover.
	const UPGRADE_URL = 'https://go.elementor.com/go-pro-atomic-mega-menu/';

	public static function is_locked(): bool {
		return self::is_locked_for(
			Utils::has_pro(),
			Utils::is_license_active(),
			Utils::is_license_expired(),
			null !== Plugin::$instance->elements_manager->get_element_types( self::SUBMENU_TYPE )
		);
	}

	public static function is_locked_for( bool $has_pro, bool $license_active, bool $license_expired, bool $submenu_registered ): bool {
		if ( ! $has_pro || ! $submenu_registered ) {
			return true;
		}

		return ! $license_active && ! $license_expired;
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
			'title' => __( 'Mega Menu', 'elementor' ),
			'content' => __( 'Create rich navigation menus with custom layouts, images, and interactive content.', 'elementor' ),
			'ctaUrl' => self::get_upgrade_url(),
		];
	}
}
