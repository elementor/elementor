<?php
namespace Elementor\App_Dashboard\Modules\Dashboard;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	/**
	 * Module constructor.
	 */
	public function __construct() {
		add_action( 'admin_init', [ $this, 'admin_init' ], 0 );
	}

	public function admin_init() {
		$this->enqueue_assets();
	}

	private function enqueue_assets() {
		wp_enqueue_style(
			'app-dashboard',
			$this->get_css_assets_url( 'modules/app-dashboard/module' ),
			[],
			ELEMENTOR_VERSION
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
