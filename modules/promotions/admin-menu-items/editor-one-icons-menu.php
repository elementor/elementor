<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Icons_Menu extends Base_Promotion_Template implements Menu_Item_Interface {

	public function get_position(): int {
		return 20;
	}

	public function get_slug(): string {
		return 'elementor_custom_icons';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function get_label(): string {
		return esc_html__( 'Icons', 'elementor' );
	}

	public function get_group_id(): string {
		return Menu_Config::CUSTOM_ELEMENTS_GROUP_ID;
	}

	public function get_name() {
		return 'custom_icons';
	}

	public function get_page_title() {
		return esc_html__( 'Custom Icons', 'elementor' );
	}

	protected function get_promotion_title(): string {
		return sprintf(
			/* translators: %s: `<br>` tag. */
			esc_html__( 'Enjoy creative freedom %s with Custom Icons', 'elementor' ),
			'<br />'
		);
	}

	protected function get_content_lines(): array {
		return [
			sprintf(
				/* translators: %s: `<br>` tag. */
				esc_html__( 'Expand your icon library beyond FontAwesome and add icon %s libraries of your choice', 'elementor' ),
				'<br />'
			),
			esc_html__( 'Add any icon, anywhere on your website', 'elementor' ),
		];
	}

	protected function get_cta_url(): string {
		return 'https://go.elementor.com/go-pro-custom-icons/';
	}

	protected function get_video_url(): string {
		return 'https://www.youtube-nocookie.com/embed/PsowinxDWfM?si=SV9Z3TLz3_XEy5C6';
	}
}
