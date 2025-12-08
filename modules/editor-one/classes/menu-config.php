<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Menu_Config {

	const ELEMENTOR_MENU_SLUG = 'elementor';
	const EDITOR_MENU_SLUG = 'elementor-editor';
	const TEMPLATES_GROUP_ID = 'elementor-editor-templates';
	const SETTINGS_GROUP_ID = 'elementor-editor-settings';
	const EDITOR_GROUP_ID = 'elementor-editor-items';
	const CUSTOM_ELEMENTS_GROUP_ID = 'elementor-editor-custom-elements';
	const SYSTEM_GROUP_ID = 'elementor-editor-system';
	const LEGACY_TEMPLATES_SLUG = 'edit.php?post_type=elementor_library';

	public static function get_editor_flyout_items(): array {
		return [];
	}

	public static function get_level4_flyout_groups( string $theme_builder_url ): array {
		$groups = [];

		$groups[ self::TEMPLATES_GROUP_ID ] = [
			'items' => [],
		];

		$groups[ self::CUSTOM_ELEMENTS_GROUP_ID ] = [
			'items' => [],
		];

		$groups[ self::SYSTEM_GROUP_ID ] = [
			'items' => [],
		];

		return $groups;
	}

	public static function get_items_to_hide_from_wp_menu(): array {
		return apply_filters( 'elementor/admin_menu/items_to_hide_from_wp_menu', [] );
	}

	public static function get_protected_submenu_slugs(): array {
		$default_slugs = [
			self::ELEMENTOR_MENU_SLUG,
			self::EDITOR_MENU_SLUG,
		];

		return apply_filters( 'elementor/admin_menu/protected_submenu_slugs', $default_slugs );
	}

	public static function get_protected_templates_submenu_slugs(): array {
		return [
			self::LEGACY_TEMPLATES_SLUG,
			'post-new.php?post_type=elementor_library',
			'edit-tags.php?taxonomy=elementor_library_category&amp;post_type=elementor_library',
			'elementor-app',
		];
	}

	public static function get_excluded_level4_slugs(): array {
		$default_slugs = [];

		return apply_filters( 'elementor/admin_menu/excluded_level4_slugs', $default_slugs );
	}

	public static function get_excluded_level3_slugs(): array {
		$default_slugs = [
			'elementor-theme-builder'
		];

		return apply_filters( 'elementor/admin_menu/excluded_level3_slugs', $default_slugs );
	}

	public static function get_legacy_slug_mapping(): array {
		$default_mapping = [
			self::LEGACY_TEMPLATES_SLUG => self::TEMPLATES_GROUP_ID,
			self::ELEMENTOR_MENU_SLUG => self::EDITOR_GROUP_ID,
		];

		return apply_filters( 'elementor/admin_menu/legacy_slug_mapping', $default_mapping );
	}

	public static function get_level4_group_mapping(): array {
		$default_mapping = [
			'elementor-license' => self::SYSTEM_GROUP_ID,
		];

		return apply_filters( 'elementor/admin_menu/level4_group_mapping', $default_mapping );
	}

	public static function get_custom_code_url(): string {
		$pro_custom_code_cpt = 'elementor_snippet';

		if ( post_type_exists( $pro_custom_code_cpt ) ) {
			$default_url = admin_url( 'edit.php?post_type=' . $pro_custom_code_cpt );
		} else {
			$default_url = admin_url( 'admin.php?page=elementor_custom_code' );
		}

		return apply_filters( 'elementor/admin_menu/custom_code_url', $default_url );
	}
}
