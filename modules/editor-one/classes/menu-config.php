<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Menu_Config {
	const ELEMENTOR_MENU_SLUG = 'elementor';
	const ELEMENTOR_HOME_MENU_SLUG = 'elementor-home';
	const EDITOR_MENU_SLUG = 'elementor-editor';
	const TEMPLATES_GROUP_ID = 'elementor-editor-templates';
	const SETTINGS_GROUP_ID = 'elementor-editor-settings';
	const EDITOR_GROUP_ID = 'elementor-editor-items';
	const CUSTOM_ELEMENTS_GROUP_ID = 'elementor-editor-custom-elements';
	const SYSTEM_GROUP_ID = 'elementor-editor-system';
	const THIRD_PARTY_GROUP_ID = 'elementor-editor-third-party';
	const LEGACY_TEMPLATES_SLUG = 'edit.php?post_type=elementor_library';
	const CAPABILITY_EDIT_POSTS = 'edit_posts';
	const CAPABILITY_MANAGE_OPTIONS = 'manage_options';
	const MENU_POSITION = 58.5;
	public static function get_excluded_level4_slugs(): array {
		// add new which is automatically added to templates and categories
		$default_slugs = [
			'edit-tags.php?taxonomy=elementor_library_category&amp;post_type=elementor_library',
		];

		return apply_filters( 'elementor/editor-one/menu/excluded_level4_slugs', $default_slugs );
	}

	public static function get_excluded_level3_slugs(): array {
		// elementor pro slugs
		$default_slugs = [
			'elementor-theme-builder',
			'elementor-pro-notes-proxy',
			self::EDITOR_MENU_SLUG,
		];

		return apply_filters( 'elementor/editor-one/menu/excluded_level3_slugs', $default_slugs );
	}

	public static function get_legacy_slug_mapping(): array {
		$default_mapping = [
			self::LEGACY_TEMPLATES_SLUG => self::TEMPLATES_GROUP_ID,
		];

		return apply_filters( 'elementor/editor-one/menu/legacy_slug_mapping', $default_mapping );
	}

	public static function is_elementor_home_menu_available(): bool {
		return class_exists( '\ElementorOne\Loader' );
	}

	public static function get_legacy_pro_mapping(): array {
		$default_mapping = [
			'elementor-license' => [ 'group' => self::SYSTEM_GROUP_ID ],
			'e-form-submissions' => [ 'group' => self::EDITOR_GROUP_ID ],
			'edit.php?post_type=elementor_font' => [
				'group' => self::CUSTOM_ELEMENTS_GROUP_ID,
				'label' => __( 'Fonts', 'elementor' ),
			],
			'edit.php?post_type=elementor_icons' => [
				'group' => self::CUSTOM_ELEMENTS_GROUP_ID,
				'label' => __( 'Icons', 'elementor' ),
			],
			'edit.php?post_type=elementor_snippet' => [
				'group' => self::CUSTOM_ELEMENTS_GROUP_ID,
				'label' => __( 'Code', 'elementor' ),
			],
			'e-custom-fonts' => [
				'group' => self::CUSTOM_ELEMENTS_GROUP_ID,
				'label' => __( 'Fonts', 'elementor' ),
			],
			'e-custom-icons' => [
				'group' => self::CUSTOM_ELEMENTS_GROUP_ID,
				'label' => __( 'Icons', 'elementor' ),
			],
			'e-custom-code' => [
				'group' => self::CUSTOM_ELEMENTS_GROUP_ID,
				'label' => __( 'Code', 'elementor' ),
			],
		];

		return apply_filters( 'elementor/editor-one/menu/legacy_pro_mapping', $default_mapping );
	}

	public static function get_attribute_mapping(): array {
		$default_mapping = [
			'e-form-submissions' => [
				'position' => 50,
				'icon' => 'send',
			],
		];

		return apply_filters( 'elementor/editor-one/menu/position_mapping', $default_mapping );
	}

	public static function get_custom_code_url(): string {
		$pro_custom_code_cpt = 'elementor_snippet';

		if ( post_type_exists( $pro_custom_code_cpt ) ) {
			$default_url = admin_url( 'edit.php?post_type=' . $pro_custom_code_cpt );
		} else {
			$default_url = admin_url( 'admin.php?page=elementor_custom_code' );
		}

		return apply_filters( 'elementor/editor-one/menu/custom_code_url', $default_url );
	}

	public static function get_elementor_home_url(): string {
		return admin_url( 'admin.php?page=' . self::ELEMENTOR_MENU_SLUG );
	}

	public static function get_elementor_post_types(): array {
		$default_values = [
			'elementor_icons' => [
				'menu_slug' => 'elementor-custom-elements',
				'child_slug' => 'edit.php?post_type=elementor_icons',
			],
			'elementor_font' => [
				'menu_slug' => 'elementor-custom-elements',
				'child_slug' => 'edit.php?post_type=elementor_font',
			],
			'elementor_snippet' => [
				'menu_slug' => 'elementor-custom-elements',
				'child_slug' => 'edit.php?post_type=elementor_snippet',
			],
		];

		return apply_filters( 'elementor/editor-one/menu/elementor_post_types', $default_values );
	}
}
