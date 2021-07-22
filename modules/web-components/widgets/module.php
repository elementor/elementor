<?php
namespace ElementorPro\Modules\CallToAction;

use ElementorPro\Base\Module_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends Module_Base {

	public function get_widgets() {
		return [
			'Component_E_Heading',
		];
	}

	public function get_name() {
		return 'e-heading';
	}
}
