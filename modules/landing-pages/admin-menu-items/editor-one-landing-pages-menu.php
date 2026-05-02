<?php

namespace Elementor\Modules\LandingPages\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Modules\LandingPages\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Landing_Pages_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page {

	private $module;
	private $menu_item;

	public function __construct( Module $module ) {
		$this->module = $module;
		$this->initialize_menu_item();
	}

	private function initialize_menu_item() {
		$menu_args = $this->module->get_menu_args();
		$slug = $menu_args['menu_slug'];
		$function = $menu_args['function'];

		if ( is_callable( $function ) ) {
			$this->menu_item = new Landing_Pages_Empty_View_Menu_Item( $function );
		} else {
			$this->menu_item = new Landing_Pages_Menu_Item();
		}
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
		return esc_html__( 'Landing Pages', 'elementor' );
	}

	public function get_position(): int {
		return 20;
	}

	public function get_slug(): string {
		$menu_args = $this->module->get_menu_args();
		return $menu_args['menu_slug'];
	}

	public function get_group_id(): string {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}

	public function get_page_title(): string {
		return $this->get_label();
	}

	public function render() {
		if ( $this->menu_item instanceof Admin_Menu_Item_With_Page ) {
			$this->menu_item->render();
		} else {
			wp_safe_redirect( admin_url( Module::ADMIN_PAGE_SLUG ) );
			exit;
		}
	}
}
