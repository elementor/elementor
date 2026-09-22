<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Icons_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Font_Awesome_7_Icon_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Icon_Library_Editor_Config {
	const FILTER_TYPE_ALL = 'all';

	const FILTER_TYPE_GROUP = 'group';

	const FILTER_TYPE_ITEM = 'item';

	const SKIPPED_TAB_NAMES = [ 'all', 'recommended', 'GoPro' ];

	public static function get(): array {
		$config = Font_Awesome_7_Icon_Resolver::get_editor_config();
		$config['filter'] = self::get_filter_items();

		return $config;
	}

	private static function get_filter_items(): array {
		$items = [
			[
				'type' => self::FILTER_TYPE_ALL,
				'label' => esc_html__( 'All icons', 'elementor' ),
				'icon' => 'list',
			],
			[
				'type' => self::FILTER_TYPE_ITEM,
				'value' => 'fa-regular',
				'label' => esc_html__( 'Font Awesome - Regular', 'elementor' ),
				'icon' => 'star',
			],
			[
				'type' => self::FILTER_TYPE_ITEM,
				'value' => 'fa-solid',
				'label' => esc_html__( 'Font Awesome - Solid', 'elementor' ),
				'icon' => 'star-filled',
			],
			[
				'type' => self::FILTER_TYPE_ITEM,
				'value' => 'fa-brands',
				'label' => esc_html__( 'Font Awesome - Brands', 'elementor' ),
				'icon' => 'library',
			],
		];

		$custom_items = self::get_additional_library_filter_items();

		if ( empty( $custom_items ) ) {
			return $items;
		}

		$items[] = [
			'type' => self::FILTER_TYPE_GROUP,
			'label' => esc_html__( 'My libraries', 'elementor' ),
		];

		return array_merge( $items, $custom_items );
	}

	private static function get_additional_library_filter_items(): array {
		$items = [];

		foreach ( Icons_Manager::get_icon_manager_tabs() as $name => $tab ) {
			if ( ! self::is_additional_library_tab( $name, $tab ) ) {
				continue;
			}

			$items[] = [
				'type' => self::FILTER_TYPE_ITEM,
				'value' => $tab['name'],
				'label' => $tab['label'],
				'icon' => 'library',
			];
		}

		return $items;
	}

	private static function is_additional_library_tab( $name, $tab ): bool {
		if ( ! is_array( $tab ) ) {
			return false;
		}

		if ( ! empty( $tab['native'] ) ) {
			return false;
		}

		if ( in_array( $name, self::SKIPPED_TAB_NAMES, true ) ) {
			return false;
		}

		if ( empty( $tab['name'] ) || ! is_string( $tab['name'] ) ) {
			return false;
		}

		if ( empty( $tab['label'] ) || ! is_string( $tab['label'] ) ) {
			return false;
		}

		return true;
	}
}
