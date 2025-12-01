<?php

namespace Elementor\Modules\EditorOne\Classes;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Modules\EditorOne\Components\Admin_Menu_Handler;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Legacy_Submenu_Item implements Admin_Menu_Item {

	private $submenu_data;

	private $parent_slug;

	public function __construct( array $submenu_data, $parent_slug = null ) {
		$this->submenu_data = $submenu_data;
		$this->parent_slug = $parent_slug ?? Admin_Menu_Handler::ELEMENTOR_MENU_SLUG;
	}

	public function get_label() {
		return $this->submenu_data[0] ?? '';
	}

	public function get_capability() {
		return $this->submenu_data[1] ?? 'manage_options';
	}

	public function get_slug() {
		return $this->submenu_data[2] ?? '';
	}

	public function get_parent_slug() {
		return $this->parent_slug;
	}

	public function is_visible() {
		return true;
	}

	public function get_page_title() {
		return $this->submenu_data[3] ?? $this->get_label();
	}
}

