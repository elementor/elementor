<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Dialect;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Omit_Dialect_Adapter extends Base_Dialect_Adapter {
	public static function to_schema( Adapter_Context $ctx ) {
		return Dialect_Utils::omit();
	}
}
