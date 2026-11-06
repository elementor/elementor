<?php

namespace Elementor\Modules\Agents\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Agents_Ready_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page {

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
		return esc_html__( 'Readiness Score', 'elementor' );
	}

	public function get_wp_menu_label(): string {
		return esc_html__( 'Agent Ready', 'elementor' );
	}

	public function get_position(): int {
		return self::POSITION_AFTER_MCP;
	}

	public function get_slug(): string {
		return Module::PAGE_ID;
	}

	public function get_page_title() {
		return $this->get_wp_menu_label();
	}

	public function render() {
		echo '<div class="wrap">';
		echo '<div id="' . esc_attr( Module::SCANNER_MOUNT_ID ) . '"></div>';
		echo '</div>';
	}
}
