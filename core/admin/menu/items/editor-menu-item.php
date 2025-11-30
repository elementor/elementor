<?php

namespace Elementor\Core\Admin\Menu\Items;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Children;
use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Admin\Menu\Unified_Menu_Manager;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_Menu_Item implements Admin_Menu_Item_With_Children, Admin_Menu_Item_With_Page {

	const PAGE_ID = 'elementor-editor';

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Unified_Menu_Manager::ELEMENTOR_MENU_SLUG;
	}

	public function get_label() {
		return esc_html__( 'Editor', 'elementor' );
	}

	public function get_capability() {
		return 'edit_posts';
	}

	public function get_page_title() {
		return esc_html__( 'Elementor Editor', 'elementor' );
	}

	public function get_children_group_id() {
		return Unified_Menu_Manager::EDITOR_GROUP_ID;
	}

	public function render() {
		$this->display_editor_dashboard();
	}

	private function display_editor_dashboard() {
		?>
		<div class="wrap elementor-editor-dashboard">
			<h1><?php echo esc_html( $this->get_page_title() ); ?></h1>
			<p><?php esc_html_e( 'Welcome to the Elementor Editor. Use the submenus to access Templates and Settings.', 'elementor' ); ?></p>
		</div>
		<?php
	}
}

