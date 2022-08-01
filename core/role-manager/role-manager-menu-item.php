<?php
namespace Elementor\Core\RoleManager;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Role_Manager_Menu_Item implements Admin_Menu_Item {

	private $role_manager;

	public function __construct( Role_Manager $role_manager ) {
		$this->role_manager = $role_manager;
	}

	public function is_visible() {
		return true;
	}

	public function parent_slug() {
		return Settings::PAGE_ID;
	}

	public function label() {
		return esc_html__( 'Role Manager', 'elementor' );
	}

	public function page_title() {
		return esc_html__( 'Role Manager', 'elementor' );
	}

	public function position() {
		return 1;
	}

	public function capability() {
		return 'manage_options';
	}

	public function callback() {
		$this->role_manager->display_settings_page();
	}
}

