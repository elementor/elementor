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
		$filtered_url = apply_filters( 'elementor/admin_menu_items/restrictions/custom_promotion', $promotion )['upgrade_url'] ?? '';

		if ( false !== $this->domain_is_on_elementor_dot_com( $filtered_url ) ) {
			$this->url = $filtered_url;
		}

		return esc_url( $this->url );
	}

	function domain_is_on_elementor_dot_com( $url ):bool {
		$url_components = parse_url( $url );
		if ( $url_components && isset( $url_components['host'] ) ) {
			$domain = $url_components['host'];

			$domainSegments = explode( '.', $domain );

			if ( count( $domainSegments ) >= 2 ) {
				$rootDomain = $domainSegments[ count( $domainSegments ) - 2] . '.' . $domainSegments[ count($domainSegments) - 1 ];
				return $rootDomain === 'elementor.com';
			}
		}

		return false;
	}

	public function render() {
		// Redirects from the module on `admin_init`.
		die;
	}
}
