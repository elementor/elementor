<?php
namespace Elementor\Modules\EditorScreen;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Admin_Menu_App implements Admin_Menu_Item_With_Page {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return Settings::PAGE_ID;
	}

	public function get_label() {
		return esc_html__( 'Editor', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Editor', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function render() {
		echo '<div id="e-editor-screen"></div>';
	}
}
