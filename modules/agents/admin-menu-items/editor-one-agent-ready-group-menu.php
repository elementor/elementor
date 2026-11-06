<?php

namespace Elementor\Modules\Agents\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Agent_Ready_Group_Menu implements Menu_Item_Third_Level_Interface, Admin_Menu_Item_With_Page {

	const SLUG = 'elementor-agent-ready';

	const POSITION_AFTER_MCP = 26;

	public function get_capability(): string {
		return 'manage_options';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_HOME_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_group_id(): string {
		return Menu_Config::AGENT_READY_GROUP_ID;
	}

	public function get_label(): string {
		return esc_html__( 'Agent Ready', 'elementor' );
	}

	public function get_position(): int {
		return self::POSITION_AFTER_MCP;
	}

	public function get_slug(): string {
		return self::SLUG;
	}

	public function get_icon(): string {
		return 'extension';
	}

	public function has_children(): bool {
		return true;
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function render() {
		wp_safe_redirect( admin_url( 'admin.php?page=' . Module::PAGE_ID ) );
		exit;
	}
}
