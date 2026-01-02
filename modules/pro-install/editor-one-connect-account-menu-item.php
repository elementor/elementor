<?php

namespace Elementor\Modules\ProInstall;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Connect_Account_Menu_Item implements Menu_Item_Interface {

	private $connect;
	private $script_config;

	public function __construct( Connect $connect, array $script_config ) {
		$this->connect = $connect;
		$this->script_config = $script_config;
	}

	public function get_capability(): string {
		return 'manage_options';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_label(): string {
		return esc_html__( 'Connect Account', 'elementor' );
	}

	public function get_page_title(): string {
		return esc_html__( 'Connect Settings', 'elementor' );
	}

	public function get_position(): int {
		return 1000;
	}

	public function get_slug(): string {
		return 'elementor-connect-account';
	}

	public function get_icon(): string {
		return 'sync';
	}

	public function get_group_id(): string {
		return Menu_Config::SYSTEM_GROUP_ID;
	}

	public function has_children(): bool {
		return false;
	}

	public function render() {
		$page_url = admin_url( 'admin.php?page=elementor-connect-account' );
		$renderer = new Connect_Page_Renderer( $this->connect, $page_url, $this->script_config );
		$renderer->render();
	}
}
