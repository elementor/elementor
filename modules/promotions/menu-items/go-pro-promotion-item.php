<?php

namespace Elementor\Modules\Promotions\MenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Renderable_Admin_Menu_Item;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Go_Pro_Promotion_Item implements Renderable_Admin_Menu_Item {
	const URL = 'https://go.elementor.com/pro-admin-menu/';

	public function is_visible() {
		return true;
	}

	public function parent_slug() {
		return Settings::PAGE_ID;
	}

	public function label() {
		return '<span class="dashicons dashicons-star-filled" style="font-size: 17px"></span> ' . esc_html__( 'Upgrade', 'elementor' );
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
		// Redirects from the module on `admin_init`.
		die;
	}
}
