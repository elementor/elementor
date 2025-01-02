<?php
namespace Elementor\Core\Common\Modules\Finder\Categories;

use Elementor\Core\Common\Modules\Finder\Base_Category;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Site Category
 *
 * Provides general site items.
 */
class Site extends Base_Category {

	/**
	 * Get title.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @return string
	 */
	public function get_title() {
		return esc_html__( 'Site', 'elementor' );
	}

	public function get_id() {
		return 'site';
	}

	/**
	 * Get category items.
	 *
	 * @since 2.3.0
	 * @access public
	 *
	 * @param array $options
	 *
	 * @return array
	 */
	public function get_category_items( array $options = array() ) {
		return array(
			'homepage' => array(
				'title' => esc_html__( 'Homepage', 'elementor' ),
				'url' => home_url(),
				'icon' => 'home-heart',
				'keywords' => array( 'home', 'page' ),
			),
			'wordpress-dashboard' => array(
				'title' => esc_html__( 'Dashboard', 'elementor' ),
				'icon' => 'dashboard',
				'url' => admin_url(),
				'keywords' => array( 'dashboard', 'wordpress' ),
			),
			'wordpress-menus' => array(
				'title' => esc_html__( 'Menus', 'elementor' ),
				'icon' => 'wordpress',
				'url' => admin_url( 'nav-menus.php' ),
				'keywords' => array( 'menu', 'wordpress' ),
			),
			'wordpress-themes' => array(
				'title' => esc_html__( 'Themes', 'elementor' ),
				'icon' => 'wordpress',
				'url' => admin_url( 'themes.php' ),
				'keywords' => array( 'themes', 'wordpress' ),
			),
			'wordpress-customizer' => array(
				'title' => esc_html__( 'Customizer', 'elementor' ),
				'icon' => 'wordpress',
				'url' => admin_url( 'customize.php' ),
				'keywords' => array( 'customizer', 'wordpress' ),
			),
			'wordpress-plugins' => array(
				'title' => esc_html__( 'Plugins', 'elementor' ),
				'icon' => 'wordpress',
				'url' => admin_url( 'plugins.php' ),
				'keywords' => array( 'plugins', 'wordpress' ),
			),
			'wordpress-users' => array(
				'title' => esc_html__( 'Users', 'elementor' ),
				'icon' => 'wordpress',
				'url' => admin_url( 'users.php' ),
				'keywords' => array( 'users', 'profile', 'wordpress' ),
			),
		);
	}
}
