<?php

namespace Elementor\Core\Common\Modules\Assistant\Categories;

use Elementor\Core\Common\Modules\Assistant\Base_Category;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site extends Base_Category {

	public function get_title() {
		return __( 'Site', 'elementor' );
	}

	public function get_category_items( array $options = [] ) {
		return [
			[
				'title' => __( 'WordPress Dashboard', 'elementor' ),
				'icon' => 'dashboard',
				'link' => admin_url(),
			],
			[
				'title' => __( 'Homepage', 'elementor' ),
				'link' => home_url(),
			],
			[
				'title' => __( 'WordPress Menus', 'elementor' ),
				'link' => admin_url( 'nav-menus.php' ),
			],
		];
	}
}
