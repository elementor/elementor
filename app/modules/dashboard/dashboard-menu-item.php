<?php

namespace Elementor\App\Modules\Dashboard;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Dashboard_Menu_Item implements Admin_Menu_Item_With_Page {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return null;
	}

	public function get_label() {
		return esc_html__( 'Dashboard', 'elementor' );
	}

	public function get_page_title() {
		return esc_html__( 'Dashboard', 'elementor' );
	}

	public function get_capability() {
		return 'edit_posts';
	}

	public function render() {
        var_dump('aaa');
		?>
			<div id="e-app"></div>
		<?php
	}
}
