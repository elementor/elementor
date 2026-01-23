<?php

namespace Elementor\Modules\Promotions\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Submissions_Menu extends Base_Promotion_Template implements Menu_Item_Third_Level_Interface {

	public function get_position(): int {
		return 50;
	}

	public function get_slug(): string {
		return 'e-form-submissions';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function get_label(): string {
		return esc_html__( 'Submissions', 'elementor' );
	}

	public function get_group_id(): string {
		return Menu_Config::EDITOR_GROUP_ID;
	}

	public function get_icon(): string {
		return 'send';
	}

	public function has_children(): bool {
		return false;
	}

	public function get_name() {
		return 'submissions';
	}

	public function get_page_title() {
		return esc_html__( 'Submissions', 'elementor' );
	}

	public function get_promotion_title(): string {
		return sprintf(
			/* translators: %s: `<br>` tag. */
			esc_html__( 'Create Forms and Collect Leads %s with Elementor Pro', 'elementor' ),
			'<br>'
		);
	}

	protected function get_content_lines(): array {
		return [
			esc_html__( 'Create single or multi-step forms to engage and convert visitors', 'elementor' ),
			esc_html__( 'Use any field to collect the information you need', 'elementor' ),
			esc_html__( 'Integrate your favorite marketing software*', 'elementor' ),
			esc_html__( 'Collect lead submissions directly within your WordPress Admin to manage, analyze and perform bulk actions on the submitted lead*', 'elementor' ),
		];
	}

	protected function get_cta_url(): string {
		return 'https://go.elementor.com/go-pro-submissions/';
	}

	protected function get_video_url(): string {
		return 'https://www.youtube-nocookie.com/embed/LNfnwba9C-8?si=JLHk3UAexnvTfU1a';
	}

	protected function get_side_note(): string {
		return esc_html__( '* Requires an Advanced subscription or higher', 'elementor' );
	}
}
