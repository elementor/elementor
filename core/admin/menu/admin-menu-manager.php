<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Children;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Admin_Menu_Manager {

	const ELEMENTOR_MENU_SLUG = 'elementor';

	const EDITOR_MENU_SLUG = 'elementor-editor';

	const TEMPLATES_GROUP_ID = 'elementor-editor-templates';

	const SETTINGS_GROUP_ID = 'elementor-editor-settings';

	const EDITOR_GROUP_ID = 'elementor-editor-items';

	const LEGACY_TEMPLATES_SLUG = 'edit.php?post_type=elementor_library';

	private $items = [];

	private $level3_items = [];

	private $level4_items = [];

	private $legacy_slug_mapping = null;

	private function get_legacy_slug_mapping() {
		if ( null === $this->legacy_slug_mapping ) {
			$this->legacy_slug_mapping = [
				self::LEGACY_TEMPLATES_SLUG => self::TEMPLATES_GROUP_ID,
				self::ELEMENTOR_MENU_SLUG => self::EDITOR_GROUP_ID,
			];
		}

		return $this->legacy_slug_mapping;
	}

	public function register( $item_slug, Admin_Menu_Item $item ) {
		$parent_slug = $item->get_parent_slug();
		$legacy_mapping = $this->get_legacy_slug_mapping();

		if ( isset( $legacy_mapping[ $parent_slug ] ) ) {
			$new_parent_slug = $legacy_mapping[ $parent_slug ];
			$item = new Remapped_Menu_Item( $item, $new_parent_slug );
			$parent_slug = $new_parent_slug;
		}

		if ( $this->is_level4_group( $parent_slug ) ) {
			$this->register_level4_item( $item_slug, $item, $parent_slug );
			return;
		}

		if ( $this->is_level3_group( $parent_slug ) ) {
			$this->register_level3_item( $item_slug, $item, $parent_slug );
			return;
		}

		$this->items[ $item_slug ] = $item;
	}

	private function is_level4_group( $parent_slug ) {
		return in_array( $parent_slug, [
			self::TEMPLATES_GROUP_ID,
			self::SETTINGS_GROUP_ID,
		], true );
	}

	private function is_level3_group( $parent_slug ) {
		return in_array( $parent_slug, [
			self::EDITOR_GROUP_ID,
			self::EDITOR_MENU_SLUG,
		], true );
	}

	private function register_level3_item( $item_slug, Admin_Menu_Item $item, $group_id ) {
		$normalized_group = self::EDITOR_GROUP_ID;
		
		if ( ! isset( $this->level3_items[ $normalized_group ] ) ) {
			$this->level3_items[ $normalized_group ] = [];
		}

		$this->level3_items[ $normalized_group ][ $item_slug ] = $item;
	}

	private function register_level4_item( $item_slug, Admin_Menu_Item $item, $group_id ) {
		if ( ! isset( $this->level4_items[ $group_id ] ) ) {
			$this->level4_items[ $group_id ] = [];
		}

		$this->level4_items[ $group_id ][ $item_slug ] = $item;
	}

	public function unregister( $item_slug ) {
		unset( $this->items[ $item_slug ] );

		foreach ( $this->level3_items as $group_id => $items ) {
			if ( isset( $items[ $item_slug ] ) ) {
				unset( $this->level3_items[ $group_id ][ $item_slug ] );
			}
		}

		foreach ( $this->level4_items as $group_id => $items ) {
			if ( isset( $items[ $item_slug ] ) ) {
				unset( $this->level4_items[ $group_id ][ $item_slug ] );
			}
		}
	}

	public function get( $item_slug ) {
		if ( ! empty( $this->items[ $item_slug ] ) ) {
			return $this->items[ $item_slug ];
		}

		foreach ( $this->level3_items as $items ) {
			if ( isset( $items[ $item_slug ] ) ) {
				return $items[ $item_slug ];
			}
		}

		foreach ( $this->level4_items as $items ) {
			if ( isset( $items[ $item_slug ] ) ) {
				return $items[ $item_slug ];
			}
		}

		return null;
	}

	public function get_all() {
		return $this->items;
	}

	public function get_level3_items( $group_id = null ) {
		if ( null !== $group_id ) {
			return $this->level3_items[ $group_id ] ?? [];
		}

		return $this->level3_items;
	}

	public function get_level4_items( $group_id = null ) {
		if ( null !== $group_id ) {
			return $this->level4_items[ $group_id ] ?? [];
		}

		return $this->level4_items;
	}

	public function register_actions() {
		add_action( 'admin_menu', function () {
			$this->register_wp_menus();
		}, 20 );

		add_action( 'admin_menu', function () {
			$this->intercept_legacy_submenus();
		}, 999 );

		add_action( 'admin_head', function () {
			$this->hide_invisible_menus();
			$this->render_flyout_menus();
		} );

		add_action( 'admin_enqueue_scripts', function () {
			$this->enqueue_admin_menu_assets();
		} );
	}

	private function register_wp_menus() {
		do_action( 'elementor/admin/menu/register', $this );

		$hooks = [];

		foreach ( $this->get_all() as $item_slug => $item ) {
			$is_top_level = empty( $item->get_parent_slug() );

			if ( $is_top_level ) {
				$hooks[ $item_slug ] = $this->register_top_level_menu( $item_slug, $item );
			} else {
				$hooks[ $item_slug ] = $this->register_sub_menu( $item_slug, $item );
			}
		}

		$this->register_flyout_items_as_hidden_submenus( $hooks );

		do_action( 'elementor/admin/menu/after_register', $this, $hooks );
	}

	private function register_flyout_items_as_hidden_submenus( array &$hooks ) {
		foreach ( $this->level3_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				$hooks[ $item_slug ] = $this->register_hidden_submenu( $item_slug, $item );
			}
		}

		foreach ( $this->level4_items as $group_items ) {
			foreach ( $group_items as $item_slug => $item ) {
				$hooks[ $item_slug ] = $this->register_hidden_submenu( $item_slug, $item );
			}
		}
	}

	private function register_hidden_submenu( $item_slug, Admin_Menu_Item $item ) {
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

	private function resolve_hidden_submenu_parent( $parent_slug ) {
		if ( in_array( $parent_slug, [ self::EDITOR_GROUP_ID, self::EDITOR_MENU_SLUG ], true ) ) {
			return self::ELEMENTOR_MENU_SLUG;
		}

		if ( in_array( $parent_slug, [ self::TEMPLATES_GROUP_ID, self::LEGACY_TEMPLATES_SLUG ], true ) ) {
			return self::ELEMENTOR_MENU_SLUG;
		}

		if ( $parent_slug === self::SETTINGS_GROUP_ID ) {
			return self::ELEMENTOR_MENU_SLUG;
		}

		return $parent_slug;
	}

	private function register_top_level_menu( $item_slug, Admin_Menu_Item $item ) {
		$has_page = ( $item instanceof Admin_Menu_Item_With_Page );
		$has_position = ( $item instanceof Admin_Menu_Item_Has_Position );

		$page_title = $has_page ? $item->get_page_title() : '';
		$callback = $has_page ? [ $item, 'render' ] : '';
		$position = $has_position ? $item->get_position() : null;

		return add_menu_page(
			$page_title,
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback,
			'',
			$position
		);
	}

	private function register_sub_menu( $item_slug, Admin_Menu_Item $item ) {
		$has_page = ( $item instanceof Admin_Menu_Item_With_Page );

		$page_title = $has_page ? $item->get_page_title() : '';
		$callback = $has_page ? [ $item, 'render' ] : '';

		return add_submenu_page(
			$item->get_parent_slug(),
			$page_title,
			$item->get_label(),
			$item->get_capability(),
			$item_slug,
			$callback
		);
	}

	private function hide_invisible_menus() {
		foreach ( $this->get_all() as $item_slug => $item ) {
			if ( $item->is_visible() ) {
				continue;
			}

			$is_top_level = empty( $item->get_parent_slug() );

			if ( $is_top_level ) {
				remove_menu_page( $item_slug );
			} else {
				remove_submenu_page( $item->get_parent_slug(), $item_slug );
			}
		}

		$this->hide_flyout_items_from_wp_menu();
	}

	private function hide_flyout_items_from_wp_menu() {
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
	}

	private function intercept_legacy_submenus() {
		$this->intercept_elementor_menu_legacy_items();
		$this->intercept_templates_menu_legacy_items();
	}

	private function intercept_elementor_menu_legacy_items() {
		global $submenu;

		if ( empty( $submenu[ self::ELEMENTOR_MENU_SLUG ] ) ) {
			return;
		}

		$items_to_intercept = [];
		$protected_slugs = $this->get_protected_submenu_slugs();

		foreach ( $submenu[ self::ELEMENTOR_MENU_SLUG ] as $index => $submenu_item ) {
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

			$this->register_level3_item( $item_slug, $legacy_item, self::EDITOR_GROUP_ID );

			unset( $submenu[ self::ELEMENTOR_MENU_SLUG ][ $index ] );
		}
	}

	private function intercept_templates_menu_legacy_items() {
		global $submenu;

		if ( empty( $submenu[ self::LEGACY_TEMPLATES_SLUG ] ) ) {
			return;
		}

		$items_to_intercept = [];
		$protected_templates_slugs = $this->get_protected_templates_submenu_slugs();

		foreach ( $submenu[ self::LEGACY_TEMPLATES_SLUG ] as $index => $submenu_item ) {
			$item_slug = $submenu_item[2] ?? '';

			if ( empty( $item_slug ) ) {
				continue;
			}

			if ( in_array( $item_slug, $protected_templates_slugs, true ) ) {
				continue;
			}

			if ( $this->is_item_already_registered( $item_slug ) ) {
				unset( $submenu[ self::LEGACY_TEMPLATES_SLUG ][ $index ] );
				continue;
			}

			$items_to_intercept[ $index ] = $submenu_item;
		}

		foreach ( $items_to_intercept as $index => $submenu_item ) {
			$item_slug = $submenu_item[2];
			$legacy_item = new Legacy_Submenu_Item( $submenu_item, self::LEGACY_TEMPLATES_SLUG );

			$this->register_level4_item( $item_slug, $legacy_item, self::TEMPLATES_GROUP_ID );

			unset( $submenu[ self::LEGACY_TEMPLATES_SLUG ][ $index ] );
		}
	}

	private function get_protected_submenu_slugs() {
		return [
			self::ELEMENTOR_MENU_SLUG,
			self::EDITOR_MENU_SLUG,
			'elementor-settings',
			'go_knowledge_base_site',
		];
	}

	private function get_protected_templates_submenu_slugs() {
		return [
			self::LEGACY_TEMPLATES_SLUG,
			'post-new.php?post_type=elementor_library',
			'edit-tags.php?taxonomy=elementor_library_category&amp;post_type=elementor_library',
		];
	}

	private function is_item_already_registered( $item_slug ) {
		if ( isset( $this->items[ $item_slug ] ) ) {
			return true;
		}

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

	private function enqueue_admin_menu_assets() {
		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

		wp_enqueue_script(
			'elementor-admin-menu',
			ELEMENTOR_ASSETS_URL . 'js/admin-menu' . $suffix . '.js',
			[ 'jquery' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	private function render_flyout_menus() {
		$editor_flyout = $this->get_editor_flyout_data();
		$level4_flyouts = $this->get_level4_flyout_data();

		?>
		<script type="text/javascript">
			(function() {
				var editorFlyout = <?php echo wp_json_encode( $editor_flyout ); ?>;
				var level4Flyouts = <?php echo wp_json_encode( $level4_flyouts ); ?>;
				
				document.addEventListener('DOMContentLoaded', function() {
					var elementorMenu = document.querySelector('#adminmenu a[href="admin.php?page=elementor"]');
					if (!elementorMenu) {
						elementorMenu = document.querySelector('#adminmenu .toplevel_page_elementor');
					}
					
					if (!elementorMenu) {
						return;
					}

					var menuItem = elementorMenu.closest('li.menu-top');
					if (!menuItem) {
						return;
					}

					var submenu = menuItem.querySelector('.wp-submenu');
					if (!submenu) {
						return;
					}

					var editorItem = submenu.querySelector('a[href*="elementor-editor"]');
					if (editorItem && editorFlyout.items && editorFlyout.items.length > 0) {
						var editorLi = editorItem.closest('li');
						if (editorLi) {
							editorLi.classList.add('elementor-has-flyout');
							
							var editorFlyoutUl = document.createElement('ul');
							editorFlyoutUl.className = 'elementor-submenu-flyout elementor-level-3';
							
							editorFlyout.items.forEach(function(item) {
								var li = document.createElement('li');
								li.setAttribute('data-group-id', item.group_id || '');
								
								var a = document.createElement('a');
								a.href = item.url;
								a.textContent = item.label;
								
								if (item.group_id && level4Flyouts[item.group_id]) {
									li.classList.add('elementor-has-flyout');
									
									var level4Ul = document.createElement('ul');
									level4Ul.className = 'elementor-submenu-flyout elementor-level-4';
									
									level4Flyouts[item.group_id].items.forEach(function(subItem) {
										var subLi = document.createElement('li');
										var subA = document.createElement('a');
										subA.href = subItem.url;
										subA.textContent = subItem.label;
										subLi.appendChild(subA);
										level4Ul.appendChild(subLi);
									});
									
									li.appendChild(a);
									li.appendChild(level4Ul);
								} else {
									li.appendChild(a);
								}
								
								editorFlyoutUl.appendChild(li);
							});
							
							editorLi.appendChild(editorFlyoutUl);
						}
					}
				});
			})();
		</script>
		<?php
	}

	private function get_editor_flyout_data() {
		$items = [];

		$items[] = [
			'slug' => 'elementor-templates',
			'label' => esc_html__( 'Templates', 'elementor' ),
			'url' => admin_url( 'edit.php?post_type=elementor_library&tabs_group=library' ),
			'group_id' => self::TEMPLATES_GROUP_ID,
		];

		$items[] = [
			'slug' => 'elementor-settings',
			'label' => esc_html__( 'Settings', 'elementor' ),
			'url' => admin_url( 'admin.php?page=elementor-settings' ),
			'group_id' => self::SETTINGS_GROUP_ID,
		];

		$level3_items = $this->level3_items[ self::EDITOR_GROUP_ID ] ?? [];
		foreach ( $level3_items as $item_slug => $item ) {
			if ( ! $item->is_visible() ) {
				continue;
			}

			if ( ! current_user_can( $item->get_capability() ) ) {
				continue;
			}

			$items[] = [
				'slug' => $item_slug,
				'label' => $item->get_label(),
				'url' => $this->get_item_url( $item_slug, $item ),
				'group_id' => '',
			];
		}

		return [
			'parent_slug' => self::EDITOR_MENU_SLUG,
			'items' => $items,
		];
	}

	private function get_level4_flyout_data() {
		$groups = [];

		foreach ( $this->level4_items as $group_id => $items ) {
			if ( empty( $items ) ) {
				continue;
			}

			$flyout_items = [];

			foreach ( $items as $item_slug => $item ) {
				if ( ! $item->is_visible() ) {
					continue;
				}

				if ( ! current_user_can( $item->get_capability() ) ) {
					continue;
				}

				$flyout_items[] = [
					'slug' => $item_slug,
					'label' => $item->get_label(),
					'url' => $this->get_item_url( $item_slug, $item ),
				];
			}

			if ( ! empty( $flyout_items ) ) {
				$groups[ $group_id ] = [
					'items' => $flyout_items,
				];
			}
		}

		return $groups;
	}

	private function get_item_url( $item_slug, Admin_Menu_Item $item ) {
		if ( strpos( $item_slug, 'edit.php' ) === 0 || strpos( $item_slug, 'post-new.php' ) === 0 ) {
			return admin_url( $item_slug );
		}

		if ( strpos( $item_slug, 'admin.php' ) === 0 ) {
			return admin_url( $item_slug );
		}

		if ( strpos( $item_slug, 'http' ) === 0 ) {
			return $item_slug;
		}

		return admin_url( 'admin.php?page=' . $item_slug );
	}

	public function add_legacy_slug_mapping( $old_slug, $new_group_id ) {
		$mapping = $this->get_legacy_slug_mapping();
		$this->legacy_slug_mapping[ $old_slug ] = $new_group_id;
	}

	public function get_all_legacy_slug_mappings() {
		return $this->get_legacy_slug_mapping();
	}
}
