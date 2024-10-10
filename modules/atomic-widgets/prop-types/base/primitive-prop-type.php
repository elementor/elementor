<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Primitive_Prop_Type extends Prop_Type {
	public static function get_type(): string {
		return 'primitive';
	}
}
