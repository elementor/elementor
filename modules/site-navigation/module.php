<?php

namespace Elementor\Modules\SiteNavigation;

use Elementor\Modules\SiteNavigation\Data\Controller as Recent_Controller;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	/**
	 * Initialize the Container-Converter module.
	 *
	 * @return void
	 */
	public function __construct() {
		Plugin::$instance->data_manager_v2->register_controller( new Recent_Controller() );

	}

	/**
	 * Retrieve the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'site-navigation';
	}
}
