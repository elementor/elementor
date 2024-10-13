<?php
namespace Elementor;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widget_Common_Optimized extends Widget_Common_Base {

	const WRAPPER_SELECTOR = '{{WRAPPER}}';

	public function get_name() {
		return 'common-optimized';
	}
}
