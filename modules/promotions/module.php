<?php

namespace Elementor\Modules\Promotions;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\Module as Base_Module;
use Elementor\Modules\Promotions\AdminMenuItems\Custom_Code_Promotion_Item;
use Elementor\Modules\Promotions\AdminMenuItems\Custom_Fonts_Promotion_Item;
use Elementor\Modules\Promotions\AdminMenuItems\Custom_Icons_Promotion_Item;
use Elementor\Modules\Promotions\AdminMenuItems\Form_Submissions_Promotion_Item;
use Elementor\Modules\Promotions\AdminMenuItems\Go_Pro_Promotion_Item;
use Elementor\Modules\Promotions\AdminMenuItems\Popups_Promotion_Item;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Base_Module {

	const ADMIN_MENU_PRIORITY = 100;

	const ADMIN_MENU_PROMOTIONS_PRIORITY = 120;

	public static function is_active() {
		return ! Utils::has_pro();
	}

	public function get_name() {
		return 'promotions';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'admin_init', function () {
			$this->handle_external_redirects();
		} );

		add_action( 'elementor/admin/menu/register', function ( Admin_Menu_Manager $admin_menu ) {
			$this->register_menu_items( $admin_menu );
		}, static::ADMIN_MENU_PRIORITY );

		add_action( 'elementor/admin/menu/register', function ( Admin_Menu_Manager $admin_menu ) {
			$this->register_promotion_menu_item( $admin_menu );
		}, static::ADMIN_MENU_PROMOTIONS_PRIORITY );
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

	private function register_menu_items( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register( 'e-form-submissions', new Form_Submissions_Promotion_Item() );
		$admin_menu->register( 'elementor_custom_fonts', new Custom_Fonts_Promotion_Item() );
		$admin_menu->register( 'elementor_custom_icons', new Custom_Icons_Promotion_Item() );
		$admin_menu->register( 'elementor_custom_code', new Custom_Code_Promotion_Item() );
		$admin_menu->register( 'popup_templates', new Popups_Promotion_Item() );
	}

	private function register_promotion_menu_item( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register( 'go_elementor_pro', new Go_Pro_Promotion_Item() );
	}
}
