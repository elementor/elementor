<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Float number for V3 NUMBER controls. Its own key keeps it off the shared V4 number plain
 * resolver, which casts to int and would drop decimals (e.g. a Counter ending at 4.5).
 */
class V3_Number_Prop_Type extends Number_Prop_Type {

	public static function get_key(): string {
		return 'v3-number';
	}

	public static function make() {
		return ( new static() )->float();
	}
}
