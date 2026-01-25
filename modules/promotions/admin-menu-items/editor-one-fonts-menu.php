<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Fonts_Menu extends Base_Promotion_Template implements Menu_Item_Interface {

	public function get_position(): int {
		return 10;
	}

	public function get_slug(): string {
		return 'elementor_custom_fonts';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function get_label(): string {
		return esc_html__( 'Fonts', 'elementor' );
	}

	public function get_group_id(): string {
		return Menu_Config::CUSTOM_ELEMENTS_GROUP_ID;
	}

	public function get_name() {
		return 'custom_fonts';
	}

	public function get_page_title() {
		return esc_html__( 'Custom Fonts', 'elementor' );
	}

	protected function get_promotion_title(): string {
		return esc_html__( 'Stay on brand with a Custom Font', 'elementor' );
	}

	protected function get_content_lines(): array {
		return [
			esc_html__( 'Upload any font to keep your website true to your brand', 'elementor' ),
			sprintf(
				/* translators: %s: br */
				esc_html__( 'Remain GDPR compliant with Custom Fonts that let you disable %s Google Fonts from your website', 'elementor' ),
				'<br />'
			),
		];
	}

	protected function get_cta_url(): string {
		return 'https://go.elementor.com/go-pro-custom-fonts/';
	}

	protected function get_video_url(): string {
		return 'https://www.youtube-nocookie.com/embed/j_guJkm28eY?si=cdd2TInwuGDTtCGD';
	}
}
