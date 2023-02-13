<?php
namespace Elementor\App\Modules\Dashboard;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\App\Modules\Dashboard\Dashboard_Menu_Item;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	/**
	 * Module constructor.
	 */
	public function __construct() {
		add_filter( 'elementor/admin/menu/register', [ $this, 'register_admin_menu' ], 60 );
		add_action( 'admin_init', [ $this, 'admin_init' ], 0 );
	}

	public function register_admin_menu( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register( 'elementor-app&ver=3.10.2&is_dashboard=true#/dashboard', new Dashboard_Menu_Item() );
	}

	public function admin_init() {
		$this->enqueue_assets();
	}

	private function enqueue_assets() {
		wp_enqueue_script(
			'dashboard-admin',
			__DIR__ . './js/admin',
			[
				'react',
				'react-dom',
			],
			'1.0.0',
			true
		);
	}

	/**
	 * Get name.
	 *
	 * @access public
	 *
	 * @return string
	 */
	public function get_name() {
		return 'dashboard';
	}
}
