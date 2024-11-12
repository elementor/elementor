<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Utils {
	public static function generate_id( string $prefix = '', $existing_ids = [] ): string {
		do {
			$id = $prefix . wp_rand( 1000000, 9999999 );
		} while ( in_array( $id, $existing_ids, true ) );

		return $id;
	}
}
