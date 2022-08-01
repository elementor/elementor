<?php
namespace Elementor\Includes\Settings\MenuItems;

use Elementor\Plugin;
use Elementor\Settings;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Get_Help_Menu_Item implements \Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item {
	const URL = 'https://go.elementor.com/docs-admin-menu/';

	public function is_visible() {
		return true;
	}

	public function parent_slug() {
		return Settings::PAGE_ID;
	}

	public function label() {
		return esc_html__( 'Get Help', 'elementor' );

	}

	public function page_title() {
		return '';
	}

	public function position() {
		return null;
	}

	public function capability() {
		return 'manage_options';
	}

	public function callback() {
		// Redirects from the settings page on `admin_init`.
		die;
	}
}
