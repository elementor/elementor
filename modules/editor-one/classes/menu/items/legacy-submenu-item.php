<?php

namespace Elementor\Modules\EditorOne\Classes\Menu\Items;

use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Legacy submenu item for mapped items from Pro and other Elementor plugins.
 * These are NOT third-party items - they are Elementor's own menu items that
 * were registered via the legacy add_submenu_page() mechanism.
 */
class Legacy_Submenu_Item implements Menu_Item_Third_Level_Interface {

	private $submenu_data;

	private $parent_slug;

	private $position;

	public function __construct( array $submenu_data, ?string $parent_slug = null, ?int $position = 100 ) {
		$this->submenu_data = $submenu_data;
		$this->parent_slug = $parent_slug ?? Menu_Config::ELEMENTOR_MENU_SLUG;
		$this->position = $position;
	}

	public function get_label(): string {
		return $this->submenu_data[0] ?? '';
	}

	public function get_capability(): string {
		return $this->submenu_data[1] ?? 'manage_options';
	}

	public function get_slug(): string {
		return $this->submenu_data[2] ?? '';
	}

	public function get_parent_slug(): string {
		return $this->parent_slug;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_page_title(): string {
		return $this->submenu_data[3] ?? $this->get_label();
	}

	public function get_position(): int {
		return $this->position;
	}

	public function get_group_id(): string {
		return $this->submenu_data[4] ?? Menu_Config::EDITOR_GROUP_ID;
	}

	public function get_icon(): string {
		// Icon is stored in submenu_data[4] for legacy items, but that's also used for group_id.
		// Use attribute mapping for icon, or default to a generic icon.
		$item_slug = $this->get_slug();
		$icon = Menu_Config::get_attribute_mapping()[ $item_slug ]['icon'] ?? 'admin-generic';

		return $icon;
	}

	public function has_children(): bool {
		return false;
	}
}
