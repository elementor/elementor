<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Remapped_Menu_Item implements Admin_Menu_Item_With_Page {

	private $original_item;

	private $new_parent_slug;

	public function __construct( Admin_Menu_Item $original_item, $new_parent_slug ) {
		$this->original_item = $original_item;
		$this->new_parent_slug = $new_parent_slug;
	}

	public function get_capability() {
		return $this->original_item->get_capability();
	}

	public function get_label() {
		return $this->original_item->get_label();
	}

	public function get_parent_slug() {
		return $this->new_parent_slug;
	}

	public function is_visible() {
		return $this->original_item->is_visible();
	}

	public function get_page_title() {
		if ( $this->original_item instanceof Admin_Menu_Item_With_Page ) {
			return $this->original_item->get_page_title();
		}

		return $this->get_label();
	}

	public function render() {
		if ( $this->original_item instanceof Admin_Menu_Item_With_Page ) {
			$this->original_item->render();
		}
	}

	public function get_original_item() {
		return $this->original_item;
	}

	public function get_original_parent_slug() {
		return $this->original_item->get_parent_slug();
	}
}

