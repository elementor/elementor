<?php

namespace Elementor\App\Modules\KitLibrary\AdminMenuItems;

use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Editor_One_Website_Templates_Menu implements Menu_Item_Interface {

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
		return esc_html__( 'Website Templates', 'elementor' );
	}

	public function get_position(): int {
		return 30;
	}

	public function get_slug(): string {
		$app = Plugin::$instance->app;

		if ( $app ) {
			$return_to = esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ) );
			return add_query_arg(
				[
					'return_to' => $return_to,
					'source' => 'wp_db_templates_menu',
				],
				$app->get_base_url()
			) . '#/kit-library';
		}

		return 'elementor-app#/kit-library';
	}

	public function get_group_id(): string {
		return Menu_Config::TEMPLATES_GROUP_ID;
	}
}
