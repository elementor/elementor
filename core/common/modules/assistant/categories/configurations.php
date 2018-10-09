<?php

namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\Plugin;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Configurations extends Base_Category {

	public function get_title() {
		return __( 'Configurations', 'elementor' );
	}

	public function get_category_items( array $options = [] ) {
		$tools_url = Tools::get_url();

		$items = [
			[
				'title' => __( 'Tools', 'elementor' ),
				'icon' => 'settings',
				'link' => $tools_url,
			],
		];

		foreach ( Plugin::$instance->tools->get_tabs() as $tab_name => $tab ) {
			if ( 'general' === $tab_name ) {
				continue;
			}

			$items[] = [
				'title' => $tab['label'],
				'icon' => 'settings',
				'link' => $tools_url . '#tab-' . $tab_name,
			];
		}

		$items[] = [
			'title' => __( 'Role Manager', 'elementor' ),
			'icon' => 'person',
			'link' => Role_Manager::get_url(),
		];

		return $items;
	}
}
