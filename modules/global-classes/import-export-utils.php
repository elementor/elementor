<?php

namespace Elementor\Modules\GlobalClasses;

use ElementorDeps\JsonMachine\Items;
use ElementorDeps\JsonMachine\JsonDecoder\ExtJsonDecoder;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Export_Utils {

	const CHUNK_SIZE = 100;

	/**
	 * @param string $file_path
	 * @param array  $options {
	 *     @type string $conflict_resolution 'skip' | 'replace' (default: 'skip')
	 * }
	 *
	 * @return array|\WP_Error
	 */
	public static function import_classes( string $file_path, array $options = [ 'conflict_resolution' => 'skip' ] ) {
        memory_reset_peak_usage();
        error_log( '[GC Import] Before import_classes - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
		if ( ! file_exists( $file_path ) ) {
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
		$existing_label_to_id = self::build_label_to_id_map( $existing['items'] ?? [] );
		unset( $existing );

		try {
			$file_order = self::read_order_from_file( $file_path );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'invalid-global-classes-json',
				__( 'Invalid design system file: global-classes.json is not valid JSON.', 'elementor' )
			);
		}

		$chunks = array_chunk( $file_order, self::CHUNK_SIZE );
		$style_parser = Style_Parser::make( Style_Schema::get() );

		foreach ( $chunks as $chunk_index => $chunk ) {
            error_log( '[GC Import] Before chunk ' . $chunk_index . ' - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
			try {
				$batch = self::read_items_batch( $file_path, $chunk, $style_parser );
			} catch ( \Exception $e ) {
				return new \WP_Error(
					'invalid-global-classes-json',
					__( 'Invalid design system file: global-classes.json is not valid JSON.', 'elementor' )
				);
			}

			$items_to_put = [];

			foreach ( $chunk as $item_id ) {
				if ( ! isset( $batch[ $item_id ] ) ) {
					continue;
				}

				$item = $batch[ $item_id ];

				$sanitized_item = self::sanitize_item( $item_id, $item, $style_parser );

				if ( isset( $sanitized_item['error'] ) ) {
					continue;
				}

				$label_lower = strtolower( $sanitized_item['label'] ?? '' );
				$has_conflict = isset( $existing_label_to_id[ $label_lower ] );

				if ( $has_conflict && 'skip' === $conflict_resolution ) {
					continue;
				}

				if ( $has_conflict && 'replace' === $conflict_resolution ) {
					$existing_id = $existing_label_to_id[ $label_lower ];
					$sanitized_item['id'] = $existing_id;
					$items_to_put[ $existing_id ] = $sanitized_item;

					continue;
				}

				$imported_item_id = $sanitized_item['id'];
				$new_id = $imported_item_id;
				$is_id_exists = in_array( $imported_item_id, $existing_order, true );

				if ( $is_id_exists ) {
					$new_id = self::generate_unique_id( $existing_order );
				}

				$sanitized_item['id'] = $new_id;
				$items_to_put[ $new_id ] = $sanitized_item;
				$existing_order[] = $new_id;
				$existing_label_to_id[ $label_lower ] = $new_id;
			}

			// $repository->put( $items_to_put, $existing_order );
			unset( $batch, $items_to_put );
            gc_collect_cycles();
            error_log( '[GC Import] After chunk ' . $chunk_index . ' - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
		}

        error_log( '[GC Import] After all chunks - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );
		return [
			'imported' => [],
			'failed' => [],
			'conflicts' => [],
		];
	}

	private static function read_items_batch( string $file_path, array $chunk, Style_Parser $style_parser ): array {
		$chunk_keys = array_flip( $chunk );
		$batch = [];

		$items_stream = Items::fromFile( $file_path, [
			'pointer' => '/items',
			'decoder' => new ExtJsonDecoder( true ),
		] );

		foreach ( $items_stream as $item_id => $item ) {
			if ( ! isset( $chunk_keys[ $item_id ] ) ) {
				gc_collect_cycles();
				continue;
			}

			$batch[ $item_id ] = $item;

			if ( count( $batch ) === count( $chunk_keys ) ) {
				break;
			}
		}

		return $batch;
	}

	private static function read_order_from_file( string $file_path ): array {
		$order = [];

		foreach ( Items::fromFile( $file_path, [ 'pointer' => '/order' ] ) as $id ) {
			if ( is_string( $id ) ) {
				$order[] = $id;
			}
		}

		return $order;
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

	private static function generate_unique_id( array $existing_ids ): string {
		return Utils::generate_id( 'g-', $existing_ids );
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
