<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Go_Pro_Promotion_Item implements Admin_Menu_Item_With_Page {
	private $url = 'https://go.elementor.com/pro-admin-menu/';

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_label() {
		return esc_html__( 'Upgrade', 'elementor' );
	}

	public function get_page_title() {
		return '';
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function get_url() {
		$promotion['upgrade_url'] = $this->url;
		$filtered_url = apply_filters( 'elementor/adminmenuitems/restrictions/custom_promotion', $promotion )['upgrade_url'] ?? '';

		if ( strpos( $filtered_url, 'elementor.com' ) !== false ) {
			$this->url = $filtered_url;
		}

		return esc_url( $this->url );
	}

	public function render() {
		// Redirects from the module on `admin_init`.
		die;
	}
}
