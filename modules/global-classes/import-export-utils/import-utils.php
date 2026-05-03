<?php

namespace Elementor\Modules\GlobalClasses\ImportExportUtils;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Utils {

	const BATCH_SIZE = 120;

	/**
	 * Import classes from a directory containing individual class JSON files and an order.json.
	 *
	 * @param string $classes_dir Path to directory containing order.json and individual class files.
	 * @param array  $options {
	 *     @type string $conflict_resolution 'skip' | 'replace' (default: 'skip')
	 * }
	 *
	 * @return array|\WP_Error
	 */
	public static function import_classes( string $classes_dir, array $options = [ 'conflict_resolution' => 'skip' ] ) {
		$t_total = microtime( true );
		error_log( '[GC Import] Importing classes from: ' . $classes_dir );

		$order_file = rtrim( $classes_dir, '/' ) . '/order.json';

		if ( ! is_dir( $classes_dir ) || ! file_exists( $order_file ) ) {
			return [
				'imported' => [],
				'failed' => [],
				'conflicts' => [],
			];
		}

		$conflict_resolution = $options['conflict_resolution'] ?? 'skip';
		$repository = Global_Classes_Repository::make();

		$t = microtime( true );
		$existing = $repository->all()->get();
		error_log( '[GC Import][Timing] repository->all(): ' . round( ( microtime( true ) - $t ) * 1000, 2 ) . 'ms' );

		$existing_items = $existing['items'] ?? [];
		$existing_order = $existing['order'] ?? [];
		$existing_id_set = array_flip( $existing_order );
		$existing_label_to_id = self::build_label_to_id_map( $existing_items );
		unset( $existing );

		$order_data = json_decode( file_get_contents( $order_file ), true );

		if ( ! is_array( $order_data ) ) {
			return new \WP_Error(
				'invalid-global-classes-json',
				__( 'Invalid design system file: order.json is not valid JSON.', 'elementor' )
			);
		}

		$available_slots = 1000 - count( $existing_order );

		$t = microtime( true );
		$import_set = self::build_import_set( $order_data, $existing_label_to_id, $conflict_resolution, $available_slots );
		error_log( '[GC Import][Timing] build_import_set(): ' . round( ( microtime( true ) - $t ) * 1000, 2 ) . 'ms, count=' . count( $import_set ) );

		if ( empty( $import_set ) ) {
			return [
				'imported' => [],
				'failed' => [],
				'conflicts' => [],
			];
		}

		$t = microtime( true );
		$style_parser = Style_Parser::make( Style_Schema::get() );
		error_log( '[GC Import][Timing] Style_Parser::make(): ' . round( ( microtime( true ) - $t ) * 1000, 2 ) . 'ms' );

		$classes_dir = rtrim( $classes_dir, '/' );
		// $batch_count = 0;
		// $dirty = false;
		// $batch_items = [];
		// $batch_item_ids = [];
		// $order = $existing_order;

		$time_file_read = 0;
		$time_sanitize = 0;
		$time_add_class = 0;
		$count = 0;

		foreach ( $import_set as $item_id => $action ) {
			$class_file = $classes_dir . '/' . $item_id . '.json';

			if ( ! file_exists( $class_file ) ) {
				continue;
			}

			$t = microtime( true );
			$item = json_decode( file_get_contents( $class_file ), true );
			$time_file_read += microtime( true ) - $t;

			if ( ! is_array( $item ) ) {
				continue;
			}

			$t = microtime( true );
			$sanitized_item = self::sanitize_item( $item_id, $item, $style_parser );
			$time_sanitize += microtime( true ) - $t;

			if ( isset( $sanitized_item['error'] ) ) {
				continue;
			}

			// if ( 'replace' === $action ) {
			// 	$label_lower = strtolower( $item['label'] ?? '' );
			// 	$existing_id = $existing_label_to_id[ $label_lower ];
			// 	$item['id'] = $existing_id;
			// 	$existing_items[ $existing_id ] = $item;
			// } else {
				$new_id = $sanitized_item['id'];

				if ( isset( $existing_id_set[ $new_id ] ) ) {
					$new_id = self::generate_unique_id( $existing_id_set );
					$sanitized_item['id'] = $new_id;
				}

				$t = microtime( true );
				$repository->add_class( $new_id, $sanitized_item['label'], $sanitized_item );
				$time_add_class += microtime( true ) - $t;

				// $batch_items[ $new_id ] = $item;
				// $batch_item_ids[] = $new_id;
				// $order[] = $new_id;
				// $existing_id_set[ $new_id ] = true;
			// }

			$count++;

			if ( $count % 100 === 0 ) {
				error_log( '[GC Import][Timing] Progress: ' . $count . '/' . count( $import_set )
					. ' | file_read=' . round( $time_file_read * 1000, 2 ) . 'ms'
					. ' | sanitize=' . round( $time_sanitize * 1000, 2 ) . 'ms'
					. ' | add_class=' . round( $time_add_class * 1000, 2 ) . 'ms'
				);
			}

			// $batch_count++;
			// $dirty = true;

			// if ( $batch_count >= self::BATCH_SIZE ) {
			// 	error_log( '[GC Import] Putting batch, ids: ' . implode( ', ', $batch_item_ids ) );
			// 	$repository->put( $batch_items, $order );
			// 	$batch_count = 0;
			// 	$dirty = false;
			// 	// unset( $batch_items, $batch_order );
			// 	$batch_items = [];
			// 	$batch_item_ids = [];
			// }
		}

		// if ( $dirty ) {
		// 	$repository->put( $batch_items, $order );
		// }

		error_log( '[GC Import][Timing] === FINAL TOTALS ===' );
		error_log( '[GC Import][Timing] Classes processed: ' . $count );
		error_log( '[GC Import][Timing] file_read total: ' . round( $time_file_read * 1000, 2 ) . 'ms' );
		error_log( '[GC Import][Timing] sanitize total: ' . round( $time_sanitize * 1000, 2 ) . 'ms' );
		error_log( '[GC Import][Timing] add_class total: ' . round( $time_add_class * 1000, 2 ) . 'ms' );
		error_log( '[GC Import][Timing] TOTAL import_classes: ' . round( ( microtime( true ) - $t_total ) * 1000, 2 ) . 'ms' );

		return [
			'imported' => [],
			'failed' => [],
			'conflicts' => [],
		];
	}

	/**
	 * Pre-calculate which items to import based on order, labels, conflict resolution and available slots.
	 *
	 * @return array<string, string> Map of item_id => action ('new' or 'replace').
	 */
	private static function build_import_set(
		array $order_data,
		array $existing_label_to_id,
		string $conflict_resolution,
		int $available_slots
	): array {
		$import_set = [];
		$new_slots_used = 0;
		$is_replace = 'replace' === $conflict_resolution;

		foreach ( $order_data as $entry ) {
			if ( ! is_array( $entry ) || ! isset( $entry['id'], $entry['label'] ) ) {
				continue;
			}

			$label_lower = strtolower( $entry['label'] );
			$has_conflict = isset( $existing_label_to_id[ $label_lower ] );

			if ( $has_conflict && 'skip' === $conflict_resolution ) {
				continue;
			}

			if ( $has_conflict && $is_replace ) {
				$import_set[ $entry['id'] ] = 'replace';
				continue;
			}

			if ( $new_slots_used >= $available_slots ) {
				break;
			}

			$import_set[ $entry['id'] ] = 'new';
			$new_slots_used++;
		}

		return $import_set;
	}

	private static function build_label_to_id_map( array $items ): array {
		$map = [];

		foreach ( $items as $id => $item ) {
			if ( isset( $item['label'] ) ) {
				$map[ strtolower( $item['label'] ) ] = $id;
			}
		}

		return $map;
	}

	private static function generate_unique_id( array $existing_id_set ): string {
		do {
			$id = 'g-' . substr( bin2hex( random_bytes( 4 ) ), 0, 7 );
		} while ( isset( $existing_id_set[ $id ] ) );

		return $id;
	}

	private static function sanitize_item( string $item_id, array $item, Style_Parser $style_parser ) {
		$item_result = $style_parser->parse( $item );

		if ( ! $item_result->is_valid() ) {
			return [
				'error' => $item_result->errors()->all(),
			];
		}

		$sanitized_item = $item_result->unwrap();

		if ( $item_id !== $sanitized_item['id'] ) {
			return [
				'error' => 'ID mismatch',
			];
		}

		return $sanitized_item;
	}
}
