<?php

namespace Elementor\Modules\Mcp\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\MCP\Composer\Admin\Page;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\Mcp\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Mcp_Menu implements Menu_Item_Third_Level_Interface, Admin_Menu_Item_With_Page {

	const REGISTER_PRIORITY_AFTER_SUBMISSIONS = 11;

	private Page $page;

	public function __construct() {
		$this->page = Page::instance();
	}

	public function get_capability(): string {
		return $this->page->get_capability();
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
	}

	public function is_visible(): bool {
		return Module::is_connector_page_active();
	}

	public function get_group_id(): string {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function get_label(): string {
		return $this->page->get_label();
	}

	public function get_position(): int {
		return 25;
	}

	public function get_slug(): string {
		return $this->page->get_slug();
	}

	public function get_icon(): string {
		return 'extension';
	}

	public function has_children(): bool {
		return false;
	}

	public function get_page_title() {
		return $this->page->get_page_title();
	}

	public function render() {
		$this->page->render();
	}
}
