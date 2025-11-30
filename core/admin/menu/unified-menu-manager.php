<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_Has_Position;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Children;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Unified_Menu_Manager {

	const ELEMENTOR_MENU_SLUG = 'elementor';

	const EDITOR_GROUP_ID = 'elementor-editor';

	const TEMPLATES_GROUP_ID = 'elementor-editor-templates';

	const SETTINGS_GROUP_ID = 'elementor-editor-settings';

	private $items = [];

	private $children = [];

	private $legacy_slug_mapping = [];

	public function __construct() {
		$this->init_legacy_slug_mapping();
	}

	private function init_legacy_slug_mapping() {
		$this->legacy_slug_mapping = [
			Source_Local::ADMIN_MENU_SLUG => self::TEMPLATES_GROUP_ID,
		];
	}

	public function register( $item_slug, Admin_Menu_Item $item ) {
		$parent_slug = $item->get_parent_slug();

		if ( isset( $this->legacy_slug_mapping[ $parent_slug ] ) ) {
			$item = new Remapped_Menu_Item( $item, $this->legacy_slug_mapping[ $parent_slug ] );
			$parent_slug = $item->get_parent_slug();
		}

		if ( $this->is_third_level_item( $parent_slug ) ) {
			$this->register_third_level_item( $item_slug, $item, $parent_slug );
			return;
		}

		$this->items[ $item_slug ] = $item;
	}

	private function is_third_level_item( $parent_slug ) {
		return in_array( $parent_slug, [
			self::TEMPLATES_GROUP_ID,
			self::SETTINGS_GROUP_ID,
		], true );
	}

	private function register_third_level_item( $item_slug, Admin_Menu_Item $item, $group_id ) {
		if ( ! isset( $this->children[ $group_id ] ) ) {
			$this->children[ $group_id ] = [];
		}

		$this->children[ $group_id ][ $item_slug ] = $item;
	}

	public function unregister( $item_slug ) {
		unset( $this->items[ $item_slug ] );

		foreach ( $this->children as $group_id => $children ) {
			if ( isset( $children[ $item_slug ] ) ) {
				unset( $this->children[ $group_id ][ $item_slug ] );
			}
		}
	}

	public function get( $item_slug ) {
		if ( ! empty( $this->items[ $item_slug ] ) ) {
			return $this->items[ $item_slug ];
		}

		foreach ( $this->children as $children ) {
			if ( isset( $children[ $item_slug ] ) ) {
				return $children[ $item_slug ];
			}
		}

		return null;
	}

	public function get_all() {
		return $this->items;
	}

	public function get_children( $group_id ) {
		return $this->children[ $group_id ] ?? [];
	}

	public function get_all_children() {
		return $this->children;
	}

	public function register_actions() {
		add_action( 'admin_menu', function () {
			$this->register_wp_menus();
		}, 20 );

		add_action( 'admin_head', function () {
			$this->hide_invisible_menus();
			$this->render_flyout_menus();
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

		do_action( 'elementor/admin/menu/after_register', $this, $hooks );
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

		foreach ( $this->children as $children ) {
			foreach ( $children as $item_slug => $item ) {
				if ( ! $item->is_visible() ) {
					continue;
				}
			}
		}
	}

	private function render_flyout_menus() {
		global $submenu;

		if ( empty( $submenu[ self::ELEMENTOR_MENU_SLUG ] ) ) {
			return;
		}

		$flyout_groups = $this->get_flyout_groups();

		if ( empty( $flyout_groups ) ) {
			return;
		}

		?>
		<script type="text/javascript">
			(function() {
				var flyoutData = <?php echo wp_json_encode( $flyout_groups ); ?>;
				
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

					Object.keys(flyoutData).forEach(function(groupId) {
						var group = flyoutData[groupId];
						var parentItem = submenu.querySelector('a[href*="' + group.parent_slug + '"]');
						
						if (!parentItem) {
							return;
						}

						var parentLi = parentItem.closest('li');
						if (!parentLi) {
							return;
						}

						parentLi.classList.add('elementor-has-flyout');

						var flyoutUl = document.createElement('ul');
						flyoutUl.className = 'elementor-submenu-flyout';

						group.items.forEach(function(item) {
							var li = document.createElement('li');
							var a = document.createElement('a');
							a.href = item.url;
							a.textContent = item.label;
							li.appendChild(a);
							flyoutUl.appendChild(li);
						});

						parentLi.appendChild(flyoutUl);
					});
				});
			})();
		</script>
		<?php
	}

	private function get_flyout_groups() {
		$groups = [];

		foreach ( $this->children as $group_id => $children ) {
			if ( empty( $children ) ) {
				continue;
			}

			$parent_slug = $this->get_group_parent_slug( $group_id );
			$items = [];

			foreach ( $children as $item_slug => $item ) {
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
				];
			}

			if ( ! empty( $items ) ) {
				$groups[ $group_id ] = [
					'parent_slug' => $parent_slug,
					'items' => $items,
				];
			}
		}

		return $groups;
	}

	private function get_group_parent_slug( $group_id ) {
		$mapping = [
			self::TEMPLATES_GROUP_ID => 'elementor-templates',
			self::SETTINGS_GROUP_ID => 'elementor-settings',
		];

		return $mapping[ $group_id ] ?? $group_id;
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
		$this->legacy_slug_mapping[ $old_slug ] = $new_group_id;
	}

	public function get_legacy_slug_mapping() {
		return $this->legacy_slug_mapping;
	}
}

