<?php

namespace Elementor\Modules\EditorOne\Classes\Menu\Items;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Third_Party_Menu_Item;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Third_Level_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Third_Party_Menu_Item_Adapter implements Menu_Item_Third_Level_Interface {

	private Third_Party_Menu_Item $third_party_item;

	public function __construct( Third_Party_Menu_Item $third_party_item ) {
		$this->third_party_item = $third_party_item;
	}

	public function get_capability(): string {
		return $this->third_party_item->get_capability();
	}

	public function get_label(): string {
		return $this->third_party_item->get_label();
	}

	public function get_parent_slug(): string {
		return 'elementor-home';
	}

	public function is_visible(): bool {
		return $this->third_party_item->is_visible();
	}

	public function get_position(): int {
		return 100;
	}

	public function get_slug(): string {
		return $this->third_party_item->get_id();
	}

	public function get_group_id(): string {
		return '';
	}

	public function get_icon(): string {
		return $this->third_party_item->get_icon();
	}

	public function has_children(): bool {
		return false;
	}

	public function get_page_title(): string {
		return $this->get_label();
	}

	public function get_target_url(): string {
		return $this->third_party_item->get_target_url();
	}

	public function get_owner(): string {
		return $this->third_party_item->get_owner();
	}
}
