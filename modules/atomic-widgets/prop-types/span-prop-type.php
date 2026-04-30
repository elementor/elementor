<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Span_Prop_Type extends Number_Prop_Type {
	public static function get_key(): string {
		return 'span';
	}
}
