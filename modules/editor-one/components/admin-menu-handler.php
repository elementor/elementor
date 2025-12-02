<?php
declare( strict_types = 1 );

namespace Elementor\Modules\EditorOne\Components;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\EditorOne\Classes\Legacy_Submenu_Item;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\EditorOne\Classes\Remapped_Menu_Item;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Menu_Handler {

	private $level3_items = [];
	private $level4_items = [];
	private $theme_builder_url = null;

	public function __construct() {
		$this->register_actions();
	}

	private function register_actions(): void {
		add_action( 'admin_menu', [ $this, 'register_unified_submenus' ], 21 );
		add_action( 'elementor/admin/menu/register', [ $this, 'intercept_menu_registration' ], 5 );
		add_action( 'admin_menu', [ $this, 'intercept_legacy_submenus' ], 999 );
		add_action( 'admin_menu', [ $this, 'register_flyout_items_as_hidden_submenus' ], 1001 );
		add_action( 'admin_menu', [ $this, 'reorder_elementor_submenu' ], 1002 );
		add_action( 'admin_menu', [ $this, 'reposition_elementor_menu' ], 1003 );
		add_action( 'admin_head', [ $this, 'hide_flyout_items_from_wp_menu' ] );
		add_action( 'admin_head', [ $this, 'hide_legacy_templates_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_menu_assets' ] );
	}

	public function register_unified_submenus(): void {
		add_submenu_page(
			Menu_Config::ELEMENTOR_MENU_SLUG,
			esc_html__( 'Editor', 'elementor' ),
			esc_html__( 'Editor', 'elementor' ),
			'edit_posts',
			Menu_Config::EDITOR_MENU_SLUG,
			[ $this, 'render_editor_page' ]
		);

		add_submenu_page(
			Menu_Config::ELEMENTOR_MENU_SLUG,
			esc_html__( 'Theme Builder', 'elementor' ),
			esc_html__( 'Theme Builder', 'elementor' ),
			'edit_posts',
			'elementor-theme-builder',
			[ $this, 'redirect_to_theme_builder' ]
		);

		do_action( 'elementor/admin/menu/register_submenus', Menu_Config::ELEMENTOR_MENU_SLUG );
	}

	public function reorder_elementor_submenu(): void {
		global $submenu;

		if ( empty( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] ) ) {
			return;
		}

		$desired_order = [
			Menu_Config::ELEMENTOR_MENU_SLUG,
			Menu_Config::EDITOR_MENU_SLUG,
			'elementor-theme-builder',
			'e-form-submissions',
		];

		$ordered = [];
		$remaining = [];

		foreach ( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] as $item ) {
			$slug = $item[2] ?? '';
			$position = array_search( $slug, $desired_order, true );

			if ( false !== $position ) {
				$ordered[ $position ] = $item;
			} else {
				$remaining[] = $item;
			}
		}

		ksort( $ordered );
		$submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] = array_merge( array_values( $ordered ), $remaining );
	}

	public function reposition_elementor_menu(): void {
		global $menu;

		$elementor_menu_key = null;
		$elementor_menu_item = null;

		foreach ( $menu as $key => $item ) {
			if ( isset( $item[2] ) && Menu_Config::ELEMENTOR_MENU_SLUG === $item[2] ) {
				$elementor_menu_key = $key;
				$elementor_menu_item = $item;
				break;
			}
		}

		if ( null === $elementor_menu_key || null === $elementor_menu_item ) {
			return;
		}

		unset( $menu[ $elementor_menu_key ] );

		$menu['3'] = $elementor_menu_item;

		ksort( $menu );
	}

	public function render_editor_page(): void {
		$home_module = Plugin::$instance->modules_manager->get_modules( 'home' );
		if ( $home_module && $home_module->is_experiment_active() ) {
			Plugin::$instance->settings->display_home_screen();
		} else {
			Plugin::$instance->settings->display_settings_page();
		}
	}

	public function redirect_to_theme_builder(): void {
		$url = $this->get_theme_builder_url();
		?>
		<!DOCTYPE html>
		<html>
		<head>
			<meta http-equiv="refresh" content="0;url=<?php echo esc_url( $url ); ?>">
			<script type="text/javascript">
				window.location.href = <?php echo wp_json_encode( $url ); ?>;
			</script>
		</head>
		<body>
			<p>Redirecting to Theme Builder...</p>
		</body>
		</html>
		<?php
		exit;
	}

	private function get_theme_builder_url(): string {
		if ( null === $this->theme_builder_url ) {
			$pro_url = null;

			if ( Plugin::$instance->app ) {
				$pro_url = Plugin::$instance->app->get_settings( 'menu_url' );
			}

			if ( $pro_url ) {
				$default_url = $pro_url;
			} else {
				$default_url = admin_url( 'admin.php?page=elementor-app#site-editor/promotion' );
			}

			$this->theme_builder_url = apply_filters( 'elementor/admin_menu/theme_builder_url', $default_url );
		}

		return $this->theme_builder_url;
	}

	public function hide_legacy_templates_menu(): void {
		?>
		<style type="text/css">
			#menu-posts-elementor_library {
				display: none !important;
			}
		</style>
		<?php
	}

	public function intercept_menu_registration( $admin_menu_manager ): void {
		add_action( 'elementor/admin/menu/register', function( $manager ) {
			$this->process_registered_items( $manager );
		}, 999 );
	}

	private function process_registered_items( Admin_Menu_Manager $admin_menu_manager ): void {
		$items = $admin_menu_manager->get_all();
		$protected_slugs = Menu_Config::get_protected_submenu_slugs();
		$legacy_mapping = Menu_Config::get_legacy_slug_mapping();

		foreach ( $items as $item_slug => $item ) {
			if ( in_array( $item_slug, $protected_slugs, true ) ) {
				continue;
			}

			$parent_slug = $item->get_parent_slug();

			if ( isset( $legacy_mapping[ $parent_slug ] ) ) {
				$new_parent_slug = $legacy_mapping[ $parent_slug ];
				$wrapped_item = new Remapped_Menu_Item( $item, $new_parent_slug );

				if ( $this->is_level4_group( $new_parent_slug ) ) {
					$this->register_level4_item( $item_slug, $wrapped_item, $new_parent_slug );
					$admin_menu_manager->unregister( $item_slug );
				} elseif ( $this->is_level3_group( $new_parent_slug ) ) {
					$this->register_level3_item( $item_slug, $wrapped_item, $new_parent_slug );
					$admin_menu_manager->unregister( $item_slug );
				}
			}
		}
	}

	private function is_level4_group( string $parent_slug ): bool {
		return in_array( $parent_slug, [
			Menu_Config::TEMPLATES_GROUP_ID,
			Menu_Config::SETTINGS_GROUP_ID,
		], true );
	}

	private function is_level3_group( string $parent_slug ): bool {
		return in_array( $parent_slug, [
			Menu_Config::EDITOR_GROUP_ID,
			Menu_Config::EDITOR_MENU_SLUG,
		], true );
	}

	private function register_level3_item( string $item_slug, Admin_Menu_Item $item, string $group_id = Menu_Config::EDITOR_GROUP_ID ): void {
		if ( ! isset( $this->level3_items[ $group_id ] ) ) {
			$this->level3_items[ $group_id ] = [];
		}

		$this->level3_items[ $group_id ][ $item_slug ] = $item;
	}

	private function register_level4_item( string $item_slug, Admin_Menu_Item $item, string $group_id ): void {
		if ( ! isset( $this->level4_items[ $group_id ] ) ) {
			$this->level4_items[ $group_id ] = [];
		}

		$this->level4_items[ $group_id ][ $item_slug ] = $item;
	}

	public function register_flyout_items_as_hidden_submenus(): void {
		foreach ( $this->level3_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				$this->register_hidden_submenu( $item_slug, $item );
			}
		}

		foreach ( $this->level4_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				$this->register_hidden_submenu( $item_slug, $item );
			}
		}
	}

	private function register_hidden_submenu( string $item_slug, Admin_Menu_Item $item ) {
		$has_page = ( $item instanceof Admin_Menu_Item_With_Page );

		$page_title = $has_page ? $item->get_page_title() : '';
		$callback = $has_page ? [ $item, 'render' ] : '';

		$original_parent = $item instanceof Remapped_Menu_Item
			? $item->get_original_parent_slug()
			: $item->get_parent_slug();

		$parent_slug = $this->resolve_hidden_submenu_parent( $original_parent );

		return add_submenu_page(
			$parent_slug,
			$page_title,
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback
		);
	}

	private function resolve_hidden_submenu_parent( string $parent_slug ): string {
		if ( in_array( $parent_slug, [ Menu_Config::EDITOR_GROUP_ID, Menu_Config::EDITOR_MENU_SLUG ], true ) ) {
			return Menu_Config::ELEMENTOR_MENU_SLUG;
		}

		if ( in_array( $parent_slug, [ Menu_Config::TEMPLATES_GROUP_ID, Menu_Config::LEGACY_TEMPLATES_SLUG ], true ) ) {
			return Menu_Config::ELEMENTOR_MENU_SLUG;
		}

		if ( Menu_Config::SETTINGS_GROUP_ID === $parent_slug ) {
			return Menu_Config::ELEMENTOR_MENU_SLUG;
		}

		return $parent_slug;
	}

	public function hide_flyout_items_from_wp_menu(): void {
		foreach ( $this->level3_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				$original_parent = $item instanceof Remapped_Menu_Item
					? $item->get_original_parent_slug()
					: $item->get_parent_slug();

				$parent_slug = $this->resolve_hidden_submenu_parent( $original_parent );
				remove_submenu_page( $parent_slug, $item_slug );
			}
		}

		foreach ( $this->level4_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				$original_parent = $item instanceof Remapped_Menu_Item
					? $item->get_original_parent_slug()
					: $item->get_parent_slug();

				$parent_slug = $this->resolve_hidden_submenu_parent( $original_parent );
				remove_submenu_page( $parent_slug, $item_slug );
			}
		}

		$items_to_hide_from_wp_menu = Menu_Config::get_items_to_hide_from_wp_menu();
		foreach ( $items_to_hide_from_wp_menu as $item_slug ) {
			remove_submenu_page( Menu_Config::ELEMENTOR_MENU_SLUG, $item_slug );
		}
	}

	public function intercept_legacy_submenus(): void {
		$this->intercept_elementor_menu_legacy_items();
		$this->intercept_templates_menu_legacy_items();
	}

	private function intercept_elementor_menu_legacy_items(): void {
		global $submenu;

		if ( empty( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] ) ) {
			return;
		}

		$items_to_intercept = [];
		$protected_slugs = Menu_Config::get_protected_submenu_slugs();
		$level4_group_mapping = Menu_Config::get_level4_group_mapping();

		foreach ( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ] as $index => $submenu_item ) {
			$item_slug = $submenu_item[2] ?? '';

			if ( empty( $item_slug ) ) {
				continue;
			}

			if ( in_array( $item_slug, $protected_slugs, true ) ) {
				continue;
			}

			if ( $this->is_item_already_registered( $item_slug ) ) {
				continue;
			}

			$items_to_intercept[ $index ] = $submenu_item;
		}

		foreach ( $items_to_intercept as $index => $submenu_item ) {
			$item_slug = $submenu_item[2];
			$legacy_item = new Legacy_Submenu_Item( $submenu_item );

			if ( isset( $level4_group_mapping[ $item_slug ] ) ) {
				$this->register_level4_item( $item_slug, $legacy_item, $level4_group_mapping[ $item_slug ] );
			} else {
				$this->register_level3_item( $item_slug, $legacy_item, Menu_Config::EDITOR_GROUP_ID );
			}

			unset( $submenu[ Menu_Config::ELEMENTOR_MENU_SLUG ][ $index ] );
		}
	}

	private function intercept_templates_menu_legacy_items(): void {
		global $submenu;

		if ( empty( $submenu[ Menu_Config::LEGACY_TEMPLATES_SLUG ] ) ) {
			return;
		}

		$items_to_intercept = [];
		$protected_templates_slugs = Menu_Config::get_protected_templates_submenu_slugs();

		foreach ( $submenu[ Menu_Config::LEGACY_TEMPLATES_SLUG ] as $index => $submenu_item ) {
			$item_slug = $submenu_item[2] ?? '';

			if ( empty( $item_slug ) ) {
				continue;
			}

			if ( in_array( $item_slug, $protected_templates_slugs, true ) ) {
				continue;
			}

			if ( $this->is_item_already_registered( $item_slug ) ) {
				unset( $submenu[ Menu_Config::LEGACY_TEMPLATES_SLUG ][ $index ] );
				continue;
			}

			$items_to_intercept[ $index ] = $submenu_item;
		}

		foreach ( $items_to_intercept as $index => $submenu_item ) {
			$item_slug = $submenu_item[2];
			$legacy_item = new Legacy_Submenu_Item( $submenu_item, Menu_Config::LEGACY_TEMPLATES_SLUG );

			$this->register_level4_item( $item_slug, $legacy_item, Menu_Config::TEMPLATES_GROUP_ID );

			unset( $submenu[ Menu_Config::LEGACY_TEMPLATES_SLUG ][ $index ] );
		}
	}

	private function is_item_already_registered( string $item_slug ): bool {
		foreach ( $this->level3_items as $group_items ) {
			if ( isset( $group_items[ $item_slug ] ) ) {
				return true;
			}
		}

		foreach ( $this->level4_items as $group_items ) {
			if ( isset( $group_items[ $item_slug ] ) ) {
				return true;
			}
		}

		return false;
	}

	public function enqueue_admin_menu_assets(): void {
		wp_enqueue_style(
			'elementor-admin-menu',
			ELEMENTOR_URL . 'modules/editor-one/assets/css/admin-menu.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'elementor-admin-menu',
			ELEMENTOR_URL . 'modules/editor-one/assets/js/admin-menu.js',
			[],
			ELEMENTOR_VERSION,
			true
		);

		add_filter( 'script_loader_tag', function( $tag, $handle ) {
			if ( 'elementor-admin-menu' === $handle ) {
				return str_replace( ' src', ' type="module" src', $tag );
			}
			return $tag;
		}, 10, 2 );

		wp_localize_script(
			'elementor-admin-menu',
			'elementorAdminMenuConfig',
			[
				'editorFlyout' => $this->get_editor_flyout_data(),
				'level4Flyouts' => $this->get_level4_flyout_data(),
			]
		);
	}

	private function get_editor_flyout_data(): array {
		$items = Menu_Config::get_editor_flyout_items();

		$items = apply_filters( 'elementor/admin_menu/editor_flyout_items', $items );

		usort( $items, function( $a, $b ) {
			$priority_a = $a['priority'] ?? 100;
			$priority_b = $b['priority'] ?? 100;
			return $priority_a - $priority_b;
		} );

		return [
			'parent_slug' => Menu_Config::EDITOR_MENU_SLUG,
			'items' => $items,
		];
	}

	private function get_level4_flyout_data(): array {
		$groups = Menu_Config::get_level4_flyout_groups( $this->get_theme_builder_url() );

		$groups = $this->merge_level4_legacy_items( $groups );

		$groups = apply_filters( 'elementor/admin_menu/level4_flyout_groups', $groups );

		foreach ( $groups as $group_id => $group ) {
			if ( ! empty( $group['items'] ) ) {
				usort( $groups[ $group_id ]['items'], function( $a, $b ) {
					$priority_a = $a['priority'] ?? 100;
					$priority_b = $b['priority'] ?? 100;
					return $priority_a - $priority_b;
				} );
			}
		}

		return $groups;
	}

	private function merge_level4_legacy_items( array $groups ): array {
		$excluded_level4_slugs = Menu_Config::get_excluded_level4_slugs();
		$excluded_level4_labels = Menu_Config::get_excluded_level4_labels();

		foreach ( $this->level4_items as $group_id => $items ) {
			if ( ! isset( $groups[ $group_id ] ) ) {
				$groups[ $group_id ] = [ 'items' => [] ];
			}

			$existing_labels = array_map( function( $item ) {
				return strtolower( $item['label'] );
			}, $groups[ $group_id ]['items'] );

			foreach ( $items as $item_slug => $item ) {
				if ( ! $item->is_visible() ) {
					continue;
				}

				if ( ! current_user_can( $item->get_capability() ) ) {
					continue;
				}

				if ( in_array( $item_slug, $excluded_level4_slugs, true ) ) {
					continue;
				}

				$label = $item->get_label();
				$label_lower = strtolower( $label );

				if ( in_array( $label_lower, $excluded_level4_labels, true ) ) {
					continue;
				}

				if ( in_array( $label_lower, $existing_labels, true ) ) {
					continue;
				}

				$groups[ $group_id ]['items'][] = [
					'slug' => $item_slug,
					'label' => $label,
					'url' => $this->get_item_url( $item_slug, $item ),
					'priority' => 100,
				];

				$existing_labels[] = $label_lower;
			}
		}

		return $groups;
	}

	private function get_item_url( string $item_slug, Admin_Menu_Item $item ): string {
		if ( 0 === strpos( $item_slug, 'edit.php' ) || 0 === strpos( $item_slug, 'post-new.php' ) ) {
			return admin_url( $item_slug );
		}

		if ( 0 === strpos( $item_slug, 'admin.php' ) ) {
			return admin_url( $item_slug );
		}

		if ( 0 === strpos( $item_slug, 'http' ) ) {
			return $item_slug;
		}

		return admin_url( 'admin.php?page=' . $item_slug );
	}
}
