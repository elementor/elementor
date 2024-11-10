<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Utils {
	public static function generate_id() {
		return 's-' . wp_rand( 1000000, 9999999 );
	}
}
