<?php

namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Configurations extends Base_Category {

	public function get_title() {
		return __( 'Configurations', 'elementor' );
	}

	public function get_category_items( array $options = [] ) {
		return [
			[
				'title' => __( 'Role Manager', 'elementor' ),
				'icon' => 'person',
				'link' => Role_Manager::get_url(),
			],
			[
				'title' => __( 'Maintenance Mode', 'elementor' ),
				'icon' => 'time-line',
				'link' => Tools::get_url() . '#tab-maintenance_mode',
			],
		];
	}
}
