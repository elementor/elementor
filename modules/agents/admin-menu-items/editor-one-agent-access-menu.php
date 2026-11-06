<?php

namespace Elementor\Modules\Agents\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Agent_Access_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page {

	const POSITION_AFTER_READINESS_SCORE = 27;

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
		return esc_html__( 'Agent Access', 'elementor' );
	}

	public function get_position(): int {
		return self::POSITION_AFTER_READINESS_SCORE;
	}

	public function get_slug(): string {
		return Module::AGENT_ACCESS_PAGE_ID;
	}

	public function get_page_title() {
		return $this->get_label();
	}

	public function render() {
		echo '<div class="wrap">';
		echo '<div id="' . esc_attr( Module::MOUNT_ID ) . '"></div>';
		echo '</div>';
	}
}
