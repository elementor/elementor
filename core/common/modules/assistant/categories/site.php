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
			'homepage' => [
				'title' => __( 'Homepage', 'elementor' ),
				'link' => home_url(),
				'keywords' => [ 'Home', 'Page' ],
			],
			'wordpress-dashboard' => [
				'title' => __( 'Dashboard', 'elementor' ),
				'icon' => 'dashboard',
				'link' => admin_url(),
				'keywords' => [ 'Dashboard', 'WordPress' ],
			],
			'wordpress-menus' => [
				'title' => __( 'Menus', 'elementor' ),
				'link' => admin_url( 'nav-menus.php' ),
				'keywords' => [ 'Menu', 'WordPress' ],
			],
			'wordpress-customizer' => [
				'title' => __( 'Customizer', 'elementor' ),
				'link' => admin_url( 'customize.php' ),
				'keywords' => [ 'Customizer', 'WordPress' ],
			],
		];
	}
}
