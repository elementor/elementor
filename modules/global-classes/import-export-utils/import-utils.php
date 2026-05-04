<?php

namespace Elementor\Modules\GlobalClasses\ImportExportUtils;

use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Utils {
	const DEFAULT_CONFLICT_RESOLUTION = 'skip';

	public static function import_classes( string $classes_dir, array $options = [] ) {
		$order_file = rtrim( $classes_dir, '/' ) . '/order.json';

		if ( ! is_dir( $classes_dir ) || ! file_exists( $order_file ) ) {
			return [
				'imported' => [],
				'failed' => [],
				'conflicts' => [],
			];
		}

		$conflict_resolution = $options['conflict_resolution'] ?? self::DEFAULT_CONFLICT_RESOLUTION;
		$repository = Global_Classes_Repository::make();

		$order_data = json_decode( file_get_contents( $order_file ), true );

		if ( ! is_array( $order_data ) ) {
			return new \WP_Error(
				'invalid-global-classes-json',
				__( 'Invalid design system file: order.json is not valid JSON.', 'elementor' )
			);
		}

		global $wpdb;
		$wpdb->query( 'START TRANSACTION' );

		try {
			$result = self::do_import( $repository, $classes_dir, $order_data, $conflict_resolution );
			$wpdb->query( 'COMMIT' );

			return $result;
		} catch ( \Throwable $e ) {
			$wpdb->query( 'ROLLBACK' );
			throw $e;
		}
	}

	private static function do_import(
		Global_Classes_Repository $repository,
		string $classes_dir,
		array $order_data,
		string $conflict_resolution
	): array {
		if ( 'override-all' === $conflict_resolution ) {
			$repository->delete_all();
		}

		$existing_order = $repository->get_order();
		$existing_id_set = array_flip( $existing_order );
		$existing_label_to_id = self::build_label_to_id_map_from_labels( $repository->all_labels() );

		$style_parser = Style_Parser::make( Style_Schema::get() );
		$classes_dir = rtrim( $classes_dir, '/' );

		$classes_count = count( $existing_order );
		$order = $existing_order;
		$new_labels = [];
		$replaced_ids = [];

		foreach ( $order_data as $entry ) {
			if ( ! is_array( $entry ) || ! isset( $entry['id'], $entry['label'] ) ) {
				continue;
			}

			$item_action = self::resolve_item_action( $entry, $existing_label_to_id, $conflict_resolution );

			if ( 'skip' === $item_action ) {
				continue;
			}

			if ( 'new' === $item_action || 'rename' === $item_action ) {
				if ( $classes_count >= Global_Classes_REST_API::MAX_ITEMS ) {
					break;
				}
			}

			$class_file = $classes_dir . '/' . $entry['id'] . '.json';

			if ( ! file_exists( $class_file ) ) {
				continue;
			}

			$item = json_decode( file_get_contents( $class_file ), true );

			if ( ! is_array( $item ) ) {
				continue;
			}

			$sanitized_item = self::sanitize_item( $entry['id'], $item, $style_parser );

			if ( isset( $sanitized_item['error'] ) ) {
				continue;
			}

			if ( 'replace' === $item_action ) {
				$existing_id = $existing_label_to_id[ strtolower( $entry['label'] ) ];
				self::replace_existing_class( $existing_id, $sanitized_item );
				$replaced_ids[] = $existing_id;
				continue;
			}

			if ( 'rename' === $item_action ) {
				$existing_labels_flat = array_keys( $existing_label_to_id );
				$new_label = ImportExportUtils::resolve_label_conflict( $entry['label'], $existing_labels_flat );
				$sanitized_item['label'] = $new_label;
				$existing_label_to_id[ strtolower( $new_label ) ] = $entry['id'];
			}

			$new_id = $sanitized_item['id'];

			if ( isset( $existing_id_set[ $new_id ] ) ) {
				$new_id = self::generate_unique_id( $existing_id_set );
				$sanitized_item['id'] = $new_id;
			}

			$existing_id_set[ $new_id ] = true;

			$created = Global_Class_Post::create( $new_id, $sanitized_item['label'], $sanitized_item );

			if ( $created ) {
				clean_post_cache( $created->get_post_id() );
				$order[] = $new_id;
				$new_labels[ $new_id ] = $sanitized_item['label'];
				$classes_count++;
			}
		}

		$has_changes = ! empty( $new_labels ) || ! empty( $replaced_ids );

		if ( $has_changes ) {
			$repository->update_order_and_labels( $order, $new_labels );

			do_action( 'elementor/global_classes/update', Global_Classes_Repository::CONTEXT_FRONTEND, [
				'added' => array_keys( $new_labels ),
				'deleted' => [],
				'modified' => $replaced_ids,
				'order' => true,
			] );
		}

		return [
			'imported' => [],
			'failed' => [],
			'conflicts' => [],
		];
	}

	private static function resolve_item_action(
		array $entry,
		array $existing_label_to_id,
		string $conflict_resolution
	): string {
		$label_lower = strtolower( $entry['label'] );
		$has_conflict = isset( $existing_label_to_id[ $label_lower ] );

		if ( ! $has_conflict ) {
			return 'new';
		}

		switch ( $conflict_resolution ) {
			case 'skip':
				return 'skip';
			case 'replace':
				return 'replace';
			case 'merge':
				return 'rename';
			default:
				return self::DEFAULT_CONFLICT_RESOLUTION;
		}
	}

	private static function replace_existing_class( string $existing_id, array $sanitized_item ): void {
		$post = Global_Class_Post::find_by_class_id( $existing_id );

		if ( ! $post ) {
			return;
		}

		$data = [
			'type' => $sanitized_item['type'] ?? 'class',
			'variants' => $sanitized_item['variants'] ?? [],
		];

		if ( array_key_exists( 'sync_to_v3', $sanitized_item ) ) {
			$data['sync_to_v3'] = (bool) $sanitized_item['sync_to_v3'];
		}

		$post->update_data( $data );
		clean_post_cache( $post->get_post_id() );
	}

	private static function build_label_to_id_map_from_labels( array $id_to_label ): array {
		$map = [];

		foreach ( $id_to_label as $id => $label ) {
			$map[ strtolower( $label ) ] = $id;
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
