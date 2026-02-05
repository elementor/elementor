<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Utils\Promotions\Filtered_Promotions_Manager;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Popups_Menu extends Base_Promotion_Item implements Menu_Item_Interface {

	private array $promotion_data;

	public function __construct() {
		$this->promotion_data = [
			'title' => esc_html__( 'Get Popup Builder', 'elementor' ),
			'content' => esc_html__(
				'The Popup Builder lets you take advantage of all the amazing features in Elementor, so you can build beautiful & highly converting popups. Get Elementor Pro and start designing your popups today.',
				'elementor'
			),
			'action_button' => [
				'text' => esc_html__( 'Upgrade Now', 'elementor' ),
				'url' => 'https://go.elementor.com/go-pro-popup-builder/',
			],
		];

		$this->promotion_data = Filtered_Promotions_Manager::get_filtered_promotion_data( $this->promotion_data, 'elementor/templates/popup', 'action_button', 'url' );
	}

	public function get_position(): int {
		return 50;
	}

	public function get_slug(): string {
		return 'popup_templates';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function get_label(): string {
		return esc_html__( 'Popups', 'elementor' );
	}

	public function get_group_id(): string {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}

	public function get_name(): string {
		return 'popups';
	}

	public function get_page_title() {
		return esc_html__( 'Popups', 'elementor' );
	}

	public function get_promotion_title() {
		return $this->promotion_data['title'];
	}

	public function get_promotion_description() {
		return $this->promotion_data['content'];
	}

	public function get_cta_url() {
		return $this->promotion_data['action_button']['url'];
	}

	public function get_cta_text() {
		return $this->promotion_data['action_button']['text'];
	}
}
