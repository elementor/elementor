<?php

namespace Elementor\Modules\GlobalClasses;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Data {
	public static function sanitize_order( array $items, array $order ): array {
		if ( empty( $items ) ) {
			return [
				'items' => $items,
				'order' => [],
			];
		}

		$item_ids = array_keys( $items );
		$order = array_unique( $order );
		$order_existing = array_values( array_intersect( $order, $item_ids ) );
		$missing = array_diff( $item_ids, $order_existing );
		sort( $missing, SORT_STRING );

		return [
			'items' => $items,
			'order' => array_merge( $order_existing, $missing ),
		];
	}
}
