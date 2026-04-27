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
		$existing_id_set = array_flip( $existing_order );
		$existing_label_to_id = self::build_label_to_id_map( $existing['items'] ?? [] );
		unset( $existing, $repository );
		gc_collect_cycles();

		try {
			$file_order = self::read_order_from_file( $file_path );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'invalid-global-classes-json',
				__( 'Invalid design system file: global-classes.json is not valid JSON.', 'elementor' )
			);
		}

		$style_parser = Style_Parser::make( Style_Schema::get() );
		$file_order_set = array_flip( $file_order );

		try {
			$items_stream = Items::fromFile( $file_path, [
				'pointer' => '/items',
				'decoder' => new ExtJsonDecoder( true ),
			] );

			foreach ( $items_stream as $item_id => $item ) {
				if ( ! isset( $file_order_set[ $item_id ] ) ) {
					gc_collect_cycles();
					continue;
				}

				$sanitized_item = self::sanitize_item( $item_id, $item, $style_parser );
				unset( $item );

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
					// $repository->put( [ $existing_id => $sanitized_item ], $existing_order );
				} else {
					$new_id = $sanitized_item['id'];

					if ( isset( $existing_id_set[ $new_id ] ) ) {
						$new_id = self::generate_unique_id( $existing_id_set );
					}

					$sanitized_item['id'] = $new_id;
					$existing_order[] = $new_id;
					$existing_id_set[ $new_id ] = true;
					$existing_label_to_id[ $label_lower ] = $new_id;
					// $repository->put( [ $new_id => $sanitized_item ], $existing_order );
				}

				unset( $sanitized_item );
				gc_collect_cycles();
			}
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'invalid-global-classes-json',
				__( 'Invalid design system file: global-classes.json is not valid JSON.', 'elementor' )
			);
		}

		error_log( '[GC Import] After loop - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB' );
		unset( $items_stream, $style_parser, $file_order, $file_order_set );
		gc_collect_cycles();
		error_log( '[GC Import] After unset stream - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB' );
		unset( $existing_order, $existing_id_set, $existing_label_to_id, $repository );
		gc_collect_cycles();
		error_log( '[GC Import] After unset all - Memory: ' . round( memory_get_usage() / 1024 / 1024, 2 ) . 'MB, Peak: ' . round( memory_get_peak_usage() / 1024 / 1024, 2 ) . 'MB' );

		return [
			'imported' => [],
			'failed' => [],
			'conflicts' => [],
		];
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
