<?php

namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\Tools as ElementorTools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Tools extends Base_Category {

	public function get_title() {
		return __( 'Tools', 'elementor' );
	}

	public function get_category_items( array $options = [] ) {
		$tools_url = ElementorTools::get_url();

		$items = [
			[
				'title' => __( 'Tools', 'elementor' ),
				'icon' => 'settings',
				'link' => $tools_url,
			],
			[
				'title' => __( 'Replace URL', 'elementor' ),
				'icon' => 'settings',
				'link' => $tools_url . '#tab-replace_url',
			],
			[
				'title' => __( 'Version Control', 'elementor' ),
				'icon' => 'settings',
				'link' => $tools_url . '#tab-versions',
			],
			[
				'title' => __( 'Maintenance Mode', 'elementor' ),
				'icon' => 'settings',
				'link' => $tools_url . '#tab-maintenance_mode',
			],
		];

		$items[] = [
			'title' => __( 'Role Manager', 'elementor' ),
			'icon' => 'person',
			'link' => Role_Manager::get_url(),
		];

		return $items;
	}
}
