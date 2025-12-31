<?php

namespace Elementor\App\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\App\App;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Theme_Builder_Menu implements Menu_Item_Interface {

	public function get_capability(): string {
		return 'manage_options';
	}

	public function get_parent_slug(): string {
		return Menu_Config::ELEMENTOR_MENU_SLUG;
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_label(): string {
		return esc_html__( 'Theme builder', 'elementor' );
	}

	public function get_position(): int {
		return 20;
	}

	public function get_slug(): string {
        $return_to = $_SERVER['REQUEST_URI'];
        
        return add_query_arg( 
            [
                'return_to' => urlencode( $return_to ),
            ],
            \Elementor\Plugin::instance()->app->get_base_url()
        ) . '#/site-editor/promotion';
    }

	public function get_group_id(): string {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}
}
