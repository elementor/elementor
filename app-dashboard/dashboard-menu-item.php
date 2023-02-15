<?php
namespace Elementor\App_Dashboard;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dashboard_Menu_Item implements Admin_Menu_Item_With_Page {

	public function is_visible() {
		return true;
	}

	public function get_parent_slug() {
		return '';
	}

	public function get_label() {
		return esc_html__( 'New Elementor', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function get_page_title() {
		return esc_html__( 'Elementor', 'elementor' );
	}

	public function render() {
		?>
			<div id="e-app-dashboard"></div>
		<?php
	}
}
