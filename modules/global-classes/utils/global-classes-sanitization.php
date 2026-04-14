<?php

namespace Elementor\Modules\GlobalClasses\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Sanitization {
	public static function order( array $items, array $order ): array {
		if ( empty( $items ) ) {
			return [];
		}

		$item_ids = array_keys( $items );
		$order = array_filter( $order, 'is_string' );
		$order = array_unique( $order );
		$order_existing = array_values( array_intersect( $order, $item_ids ) );
		$missing = array_diff( $item_ids, $order_existing );
		sort( $missing, SORT_STRING );

		return array_merge( $order_existing, $missing );
	}
}
