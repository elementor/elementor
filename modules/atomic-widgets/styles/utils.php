<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Utils {
	public static function generate_id( string $prefix = '', $existing_ids = [] ): string {
		$existing_ids = array_flip( $existing_ids );

		$id = $prefix . wp_rand( 1000000, 9999999 );

		while ( isset( $existing_ids[ $id ] ) ) {
			$id = $prefix . wp_rand( 1000000, 9999999 );
		}

		return $id;
	}
}
