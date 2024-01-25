<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Popups_Promotion_Item extends Base_Promotion_Item {
	public function get_parent_slug() {
		return Source_Local::ADMIN_MENU_SLUG;
	}

	public function get_name() {
		return 'popups';
	}


	public function get_label() {
		return esc_html__( 'Popups', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Popups', 'elementor' );
	}

	public function get_promotion_title() {
		return esc_html__( 'Get Popup Builder', 'elementor' );
	}

	public function get_promotion_description() {
		return esc_html__(
			'The Popup Builder lets you take advantage of all the amazing features in Elementor, so you can build beautiful & highly converting popups. Get Elementor Pro and start designing your popups today.',
			'elementor'
		);
	}

	/**
	 * @deprecated use get_promotion_description instead
	 * @return void
	 */
	public function render_promotion_description() {
		echo $this->get_promotion_description(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	public function get_cta_url() {
		return 'https://go.elementor.com/go-pro-popup-builder/';
	}
}
