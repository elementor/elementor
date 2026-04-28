<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Export_Utils {

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
		memory_reset_peak_usage();
        error_log( '[GC Import] Before import_classes - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
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
		$existing = $repository->all()->get();
		$existing_order = $existing['order'] ?? [];
		$existing_id_set = array_flip( $existing_order );
		$existing_label_to_id = self::build_label_to_id_map( $existing['items'] ?? [] );
		// unset( $existing, $repository );
		gc_collect_cycles();

		$order_data = json_decode( file_get_contents( $order_file ), true );

		if ( ! is_array( $order_data ) ) {
			return new \WP_Error(
				'invalid-global-classes-json',
				__( 'Invalid design system file: order.json is not valid JSON.', 'elementor' )
			);
		}

		// $available_slots = Global_Classes_REST_API::MAX_ITEMS - count( $existing_order );
		$available_slots = 2000 - count( $existing_order );
		$is_replace = 'replace' === $conflict_resolution;
		$import_set = self::build_import_set( $order_data, $existing_label_to_id, $conflict_resolution, $available_slots );

		error_log( '[GC Import] Import set: ' . json_encode( $import_set ) );
		error_log( '[GC Import] Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
		if ( empty( $import_set ) ) {
			return [
				'imported' => [],
				'failed' => [],
				'conflicts' => [],
			];
		}

		$style_parser = Style_Parser::make( Style_Schema::get() );
		$classes_dir = rtrim( $classes_dir, '/' );

		// $new_items = [];
		// $new_order = [];
		foreach ( $import_set as $item_id => $action ) {
			$class_file = $classes_dir . '/' . $item_id . '.json';

			if ( ! file_exists( $class_file ) ) {
				continue;
			}

			$item = json_decode( file_get_contents( $class_file ), true );

			if ( ! is_array( $item ) ) {
				continue;
			}

			$sanitized_item = self::sanitize_item( $item_id, $item, $style_parser );
			
			// $sanitized_item = $item;
			unset( $item );

			if ( isset( $sanitized_item['error'] ) ) {
				continue;
			}

			if ( 'replace' === $action ) {
				$label_lower = strtolower( $sanitized_item['label'] ?? '' );
				$existing_id = $existing_label_to_id[ $label_lower ];
				$sanitized_item['id'] = $existing_id;
				// $repository->put( [ $existing_id => $sanitized_item ], $existing_order );
				error_log( '[GC Import] Replacing class: ' . $sanitized_item['label'] . ' with ID: ' . $existing_id );
				error_log( '[GC Import] Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
			} else {
				$new_id = $sanitized_item['id'];

				if ( isset( $existing_id_set[ $new_id ] ) ) {
					$new_id = self::generate_unique_id( $existing_id_set );
				}

				$sanitized_item['id'] = $new_id;
				// $new_order[] = $new_id;
				// $new_items[ $new_id ] = $sanitized_item;
				$existing_id_set[ $new_id ] = true;
				// $repository->put( [ $new_id => $sanitized_item ], $existing_order );
				error_log( '[GC Import] Adding new class: ' . $sanitized_item['label'] . ' with ID: ' . $new_id );
				error_log( '[GC Import] Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
			}

			// unset( $sanitized_item );
		}

		// $repository->put( $new_items, $new_order );

		error_log( '[GC Import] After import_classes - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
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
