<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Escaped_Html_Prop_Type extends Html_Prop_Type {
	public static function get_key(): string {
		return 'escaped-html';
	}
}
