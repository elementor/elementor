<?php

namespace Elementor\Core\Common\Modules\Connect\AdminMenuItems;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;
use Elementor\Core\Common\Modules\Connect\Apps\Base_App;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Connect_Menu implements Menu_Item_Interface, Admin_Menu_Item_With_Page {

	public function get_capability() {
		return 'edit_posts';
	}

	public function get_parent_slug() {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible() {
		return false;
	}

	public function get_label() {
		return esc_html__( 'Connect', 'elementor' );
	}

	public function get_position() {
		return 999;
	}

	public function get_slug() {
		return 'elementor-connect';
	}

	public function get_group_id() {
		return Menu_Config::SYSTEM_GROUP_ID;
	}

	public function get_page_title() {
		return esc_html__( 'Connect', 'elementor' );
	}

	public function render() {
		$apps = Plugin::$instance->common->get_component( 'connect' )->get_apps();
		?>
		<style>
			.elementor-connect-app-wrapper{
				margin-bottom: 50px;
				overflow: hidden;
			}
		</style>
		<div class="wrap">
			<?php

			/** @var Base_App $app */
			foreach ( $apps as $app ) {
				echo '<div class="elementor-connect-app-wrapper">';
				$app->render_admin_widget();
				echo '</div>';
			}

			?>
		</div><!-- /.wrap -->
		<?php
	}
}

