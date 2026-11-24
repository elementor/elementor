<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Menu\Atomic_Menu\Atomic_Menu;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Atomic_Pro_Promotion_Element_Base;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Submenu_Entitlement {
	// Single place to change the Elementor Go link of the locked Submenu popover.
	const UPGRADE_URL = 'https://go.elementor.com/go-pro-atomic-mega-menu/';

	public static function is_locked(): bool {
		$is_locked = self::is_locked_for( Utils::has_pro(), self::has_pro_submenu_type() );

		/**
		 * Filters whether the Submenu is locked. Pro owns the license and tier rules.
		 *
		 * @param bool $is_locked Whether the Submenu is locked.
		 */
		return (bool) apply_filters( 'elementor/atomic-widgets/menu/submenu/is_locked', $is_locked );
	}

	/**
	 * The Core placeholder is registered with Pro installed too, so only a type that replaced it counts.
	 */
	public static function has_pro_submenu_type(): bool {
		$submenu = Plugin::$instance->elements_manager->get_element_types( Atomic_Menu::ELEMENT_TYPE_SUBMENU );

		return null !== $submenu && ! ( $submenu instanceof Atomic_Pro_Promotion_Element_Base );
	}

	public static function is_locked_for( bool $has_pro, bool $submenu_registered ): bool {
		return ! $has_pro || ! $submenu_registered;
	}

	public static function get_upgrade_url(): string {
		/**
		 * Filters the upgrade URL of the locked Submenu popover.
		 *
		 * @param string $url The upgrade URL.
		 */
		return esc_url_raw( (string) apply_filters( 'elementor/atomic-widgets/menu/submenu/upgrade_url', self::UPGRADE_URL ) );
	}

	public static function get_promotion(): array {
		return [
			'title' => __( 'Mega Menu', 'elementor' ),
			'content' => __( 'Create rich navigation menus with custom layouts, images, and interactive content.', 'elementor' ),
			'ctaUrl' => self::get_upgrade_url(),
		];
	}
}
