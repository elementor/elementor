<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Grid_Track_Size_Prop_Type extends Size_Prop_Type {
	public static function get_key(): string {
		return 'grid-track-size';
	}
}
