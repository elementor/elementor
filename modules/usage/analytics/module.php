<?php
namespace Elementor\Modules\Usage\Analytics;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	/**
	 * @return string
	 */
	public function get_name() {
		return 'analytics';
	}

	public function __construct() {

	}
}
