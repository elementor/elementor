<?php

namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Snapshot_Utils {
	public static function normalize_string_ids( array $ids ): array {
		return Template_Library_Import_Export_Utils::normalize_string_ids( $ids );
	}

	public static function filter_items_by_ids( array $items, array $ids ): array {
		$filtered_items = [];

		foreach ( $ids as $id ) {
			if ( isset( $items[ $id ] ) ) {
				$filtered_items[ $id ] = $items[ $id ];
			}
		}

		return $filtered_items;
	}

	public static function build_filtered_order( array $order, array $items ): array {
		$filtered_order = [];

		foreach ( $order as $id ) {
			if ( isset( $items[ $id ] ) ) {
				$filtered_order[] = $id;
			}
		}

		foreach ( array_keys( $items ) as $id ) {
			if ( ! in_array( $id, $filtered_order, true ) ) {
				$filtered_order[] = $id;
			}
		}

		return $filtered_order;
	}
}
