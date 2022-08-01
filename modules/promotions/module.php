<?php

namespace Elementor\Modules\Promotions;

use Elementor\Core\Admin\Menu\Admin_Menu;
use Elementor\Core\Base\Module as Base_Module;
use Elementor\Modules\Promotions\MenuItems\Custom_Code_Promotion_Item;
use Elementor\Modules\Promotions\MenuItems\Custom_Fonts_Promotion_Item;
use Elementor\Modules\Promotions\MenuItems\Custom_Icons_Promotion_Item;
use Elementor\Modules\Promotions\MenuItems\Form_Submissions_Promotion_Item;
use Elementor\Modules\Promotions\MenuItems\Go_Pro_Promotion_Item;
use Elementor\Modules\Promotions\MenuItems\Popups_Promotion_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Base_Module {

	public function get_name() {
		return 'promotions';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'admin_init', function () {
			$this->handle_external_redirects();
		} );

		add_action( 'elementor/admin/menu/register', function ( Admin_Menu $admin_menu ) {
			$this->register_menu_items( $admin_menu );
		} );
	}

	private function handle_external_redirects() {
		if ( empty( $_GET['page'] ) ) {
			return;
		}

		if ( 'go_elementor_pro' === $_GET['page'] ) {
			wp_redirect( Go_Pro_Promotion_Item::URL );
			die;
		}
	}

	private function register_menu_items( Admin_Menu $admin_menu ) {
		$admin_menu->register( 'e-form-submissions', new Form_Submissions_Promotion_Item() );
		$admin_menu->register( 'elementor_custom_fonts', new Custom_Fonts_Promotion_Item() );
		$admin_menu->register( 'elementor_custom_icons', new Custom_Icons_Promotion_Item() );
		$admin_menu->register( 'elementor_custom_custom_code', new Custom_Code_Promotion_Item() );
		$admin_menu->register( 'go_elementor_pro', new Go_Pro_Promotion_Item() );
		$admin_menu->register( 'popup_templates', new Popups_Promotion_Item() );
	}
}
