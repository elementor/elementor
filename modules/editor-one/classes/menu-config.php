<?php
declare( strict_types = 1 );

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
		$items = [];

		$items[] = [
			'slug' => 'elementor-home',
			'label' => esc_html__( 'Home', 'elementor' ),
			'url' => admin_url( 'admin.php?page=elementor' ),
			'icon' => 'home',
			'group_id' => '',
			'priority' => 10,
		];

		$items[] = [
			'slug' => 'elementor-settings',
			'label' => esc_html__( 'Settings', 'elementor' ),
			'url' => admin_url( 'admin.php?page=elementor-settings' ),
			'icon' => 'settings',
			'group_id' => '',
			'priority' => 20,
		];

		$items[] = [
			'slug' => 'elementor-tools',
			'label' => esc_html__( 'Tools', 'elementor' ),
			'url' => admin_url( 'admin.php?page=elementor-tools' ),
			'icon' => 'tool',
			'group_id' => '',
			'priority' => 30,
		];

		$items[] = [
			'slug' => 'elementor-role-manager',
			'label' => esc_html__( 'Role Manager', 'elementor' ),
			'url' => admin_url( 'admin.php?page=elementor-role-manager' ),
			'icon' => 'users',
			'group_id' => '',
			'priority' => 40,
		];

		$items[] = [
			'slug' => 'e-form-submissions',
			'label' => esc_html__( 'Submissions', 'elementor' ),
			'url' => admin_url( 'admin.php?page=e-form-submissions' ),
			'icon' => 'send',
			'group_id' => '',
			'priority' => 50,
		];

		$items[] = [
			'slug' => 'elementor-templates',
			'label' => esc_html__( 'Templates', 'elementor' ),
			'url' => admin_url( 'edit.php?post_type=elementor_library&tabs_group=library' ),
			'icon' => 'folder',
			'group_id' => self::TEMPLATES_GROUP_ID,
			'priority' => 60,
		];

		$items[] = [
			'slug' => 'elementor-custom-elements',
			'label' => esc_html__( 'Custom Elements', 'elementor' ),
			'url' => admin_url( 'admin.php?page=elementor_custom_fonts' ),
			'icon' => 'adjustments',
			'group_id' => self::CUSTOM_ELEMENTS_GROUP_ID,
			'priority' => 70,
		];

		$items[] = [
			'slug' => 'elementor-system',
			'label' => esc_html__( 'System', 'elementor' ),
			'url' => admin_url( 'admin.php?page=elementor-system-info' ),
			'icon' => 'info-circle',
			'group_id' => self::SYSTEM_GROUP_ID,
			'priority' => 80,
		];

		return $items;
	}

	public static function get_level4_flyout_groups( string $theme_builder_url ): array {
		$groups = [];

		$groups[ self::TEMPLATES_GROUP_ID ] = [
			'items' => [
				[
					'slug' => 'saved-templates',
					'label' => esc_html__( 'Saved Templates', 'elementor' ),
					'url' => admin_url( 'edit.php?post_type=elementor_library&tabs_group=library' ),
					'priority' => 10,
				],
				[
					'slug' => 'theme-builder',
					'label' => esc_html__( 'Theme Builder', 'elementor' ),
					'url' => $theme_builder_url,
					'priority' => 20,
				],
				[
					'slug' => 'website-templates',
					'label' => esc_html__( 'Website Templates', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor-app#site-editor/templates/pages' ),
					'priority' => 30,
				],
				[
					'slug' => 'floating-elements',
					'label' => esc_html__( 'Floating Elements', 'elementor' ),
					'url' => admin_url( 'edit.php?post_type=elementor_library&tabs_group=library&elementor_library_type=floating-buttons' ),
					'priority' => 40,
				],
				[
					'slug' => 'popups',
					'label' => esc_html__( 'Popups', 'elementor' ),
					'url' => admin_url( 'edit.php?post_type=elementor_library&tabs_group=library&elementor_library_type=popup' ),
					'priority' => 50,
				],
			],
		];

		$groups[ self::CUSTOM_ELEMENTS_GROUP_ID ] = [
			'items' => [
				[
					'slug' => 'custom-fonts',
					'label' => esc_html__( 'Fonts', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor_custom_fonts' ),
					'priority' => 10,
				],
				[
					'slug' => 'custom-icons',
					'label' => esc_html__( 'Icons', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor_custom_icons' ),
					'priority' => 20,
				],
				[
					'slug' => 'custom-code',
					'label' => esc_html__( 'Code', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor_custom_code' ),
					'priority' => 30,
				],
			],
		];

		$groups[ self::SYSTEM_GROUP_ID ] = [
			'items' => [
				[
					'slug' => 'system-info',
					'label' => esc_html__( 'System Info', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor-system-info' ),
					'priority' => 10,
				],
				[
					'slug' => 'element-manager',
					'label' => esc_html__( 'Elements Manager', 'elementor' ),
					'url' => admin_url( 'admin.php?page=elementor-element-manager' ),
					'priority' => 20,
				],
			],
		];

		return $groups;
	}

	public static function get_items_to_hide_from_wp_menu(): array {
		return [
			'elementor-settings',
			'go_knowledge_base_site',
			'elementor-getting-started',
		];
	}

	public static function get_protected_submenu_slugs(): array {
		$default_slugs = [
			self::ELEMENTOR_MENU_SLUG,
			self::EDITOR_MENU_SLUG,
			'elementor-settings',
			'elementor-theme-builder',
			'e-form-submissions',
			'go_knowledge_base_site',
			'elementor-connect',
			'elementor-app',
			'elementor-getting-started',
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
		$default_slugs = [
			'edit.php?post_type=elementor_library',
			'post-new.php?post_type=elementor_library',
			'edit-tags.php?taxonomy=elementor_library_category&amp;post_type=elementor_library',
			'edit-tags.php?taxonomy=elementor_library_category&post_type=elementor_library',
			'edit.php?post_type=elementor_library#add_new',
			'elementor-app',
			'e-popups',
			'e-floating-buttons',
		];

		return apply_filters( 'elementor/admin_menu/excluded_level4_slugs', $default_slugs );
	}

	public static function get_excluded_level4_labels(): array {
		$default_labels = [
			'add new',
			'categories',
		];

		return apply_filters( 'elementor/admin_menu/excluded_level4_labels', $default_labels );
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
}
