<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Primitives;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Date_Time_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'date_time';
	}
}
