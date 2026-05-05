<?php

namespace Elementor\Modules\GlobalClasses\ImportExportUtils;

use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Core\Kits\Documents\Kit;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import_Utils {
	const DEFAULT_CONFLICT_RESOLUTION = 'skip';

	const ERROR_NOT_ARRAY = 'not_array';
	const ERROR_MISSING_FIELDS = 'missing_fields';
	const ERROR_FILE_NOT_FOUND = 'file_not_found';
	const ERROR_INVALID_JSON = 'invalid_json';
	const ERROR_INVALID_PROPS = 'invalid_props';
	const ERROR_ID_MISMATCH = 'id_mismatch';
	const ERROR_LIMIT_REACHED = 'limit_reached';

	const EMPTY_RESULT = [
		'created' => [],
		'renamed' => [],
		'replaced' => [],
		'skipped' => [],
		'failed' => [],
	];

	public static function import_classes( string $classes_dir, array $options = [], ?Kit $kit = null ) {
		$order_file = rtrim( $classes_dir, '/' ) . '/order.json';

		if ( ! is_dir( $classes_dir ) || ! file_exists( $order_file ) ) {
			return self::EMPTY_RESULT;
		}

		$conflict_resolution = $options['conflict_resolution'] ?? self::DEFAULT_CONFLICT_RESOLUTION;
		$repository = Global_Classes_Repository::make( $kit );

		$imported_classes_order = json_decode( file_get_contents( $order_file ), true );

		if ( ! is_array( $imported_classes_order ) ) {
			throw new \Exception( 'Invalid file: order.json is not valid JSON.' );
		}

		if ( empty( $imported_classes_order ) ) {
			return self::EMPTY_RESULT;
		}

		global $wpdb;
		$wpdb->query( 'START TRANSACTION' );

		try {
			$result = self::do_import( $repository, $classes_dir, $imported_classes_order, $conflict_resolution );
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
		array $imported_classes_order,
		string $conflict_resolution
	): array {
		$added_classes_order = [];
		$added_classes_labels = [];
		$modified_classes = [];
		$deleted_classes = [];

		$previous_order = $repository->get_order();
		$order_set = array_flip( $previous_order );
		$style_parser = Style_Parser::make( Style_Schema::get() );
		$classes_dir = rtrim( $classes_dir, '/' );

		if ( 'override-all' === $conflict_resolution ) {
			$deleted_classes = $previous_order;
			$repository->delete_all();
			$previous_order = [];
			$order_set = [];
		}

		$label_to_id_map = self::build_label_to_id_map_from_labels( $repository->all_labels() );

		$result = self::EMPTY_RESULT;

		foreach ( $imported_classes_order as $import_entry ) {
			[ 'is_valid' => $is_valid, 'error' => $validation_error ] = self::validate_class_entry( $import_entry );
			if ( ! $is_valid ) {
				$result['failed'][] = [
					'import_entry' => $import_entry,
					'error' => $validation_error,
				];
				continue;
			}

			$action = self::resolve_item_action( $import_entry, $label_to_id_map, $conflict_resolution );

			if ( 'skip' === $action ) {
				$result['skipped'][] = [ 'import_entry' => $import_entry ];
				continue;
			}

			if ( 'replace' !== $action && count( $order_set ) >= Global_Classes_REST_API::MAX_ITEMS ) {
				$result['failed'][] = [
					'import_entry' => $import_entry,
					'error' => self::ERROR_LIMIT_REACHED,
				];
				continue;
			}

			$class_file = $classes_dir . '/' . $import_entry['id'] . '.json';
			if ( ! file_exists( $class_file ) ) {
				$result['failed'][] = [
					'import_entry' => $import_entry,
					'error' => self::ERROR_FILE_NOT_FOUND,
				];
				continue;
			}

			$raw_item = json_decode( file_get_contents( $class_file ), true );
			if ( ! is_array( $raw_item ) ) {
				$result['failed'][] = [
					'import_entry' => $import_entry,
					'error' => self::ERROR_INVALID_JSON,
				];
				continue;
			}

			[ 'is_valid' => $is_valid, 'error' => $sanitize_error, 'sanitized' => $sanitized_item ] = self::sanitize_item( $import_entry['id'], $raw_item, $style_parser );
			if ( ! $is_valid ) {
				$result['failed'][] = [
					'import_entry' => $import_entry,
					'error' => $sanitize_error,
				];
				continue;
			}

			if ( 'replace' === $action ) {
				$existing_id = $label_to_id_map[ strtolower( $import_entry['label'] ) ];
				self::replace_existing_class( $existing_id, $sanitized_item );

				$modified_classes[] = $existing_id;
				$result['replaced'][] = [
					'import_entry' => $import_entry,
					'result_entry' => [
						'id' => $existing_id,
						'label' => $import_entry['label'],
					],
				];
				continue;
			}

			if ( 'rename' === $action ) {
				$existing_labels = array_keys( $label_to_id_map );

				$new_label = ImportExportUtils::resolve_label_conflict( $import_entry['label'], $existing_labels );
				$sanitized_item['label'] = $new_label;

				$label_to_id_map[ strtolower( $new_label ) ] = $import_entry['id'];
			}

			$new_id = $sanitized_item['id'];

			if ( isset( $order_set[ $new_id ] ) ) {
				$new_id = self::generate_unique_id( $order_set );
				$sanitized_item['id'] = $new_id;
			}

			self::create_new_class( $sanitized_item );
			$order_set[ $new_id ] = true;
			$added_classes_order[] = $new_id;
			$added_classes_labels[ $new_id ] = $sanitized_item['label'];

			$result_entry = [
				'id' => $new_id,
				'label' => $sanitized_item['label'],
			];

			if ( 'rename' === $action ) {
				$result['renamed'][] = [
					'import_entry' => $import_entry,
					'result_entry' => $result_entry,
				];
			} else {
				$result['created'][] = [ 'import_entry' => $import_entry ];
			}
		}

		$has_changes = ! empty( $added_classes_order ) || ! empty( $modified_classes ) || ! empty( $deleted_classes );

		if ( $has_changes ) {
			$new_order = array_merge( $added_classes_order, $previous_order );
			$repository->update_order_and_labels( $new_order, $added_classes_labels );

			do_action( 'elementor/global_classes/update', Global_Classes_Repository::CONTEXT_FRONTEND, [
				'added' => $added_classes_order,
				'deleted' => $deleted_classes,
				'modified' => $modified_classes,
				'order' => count( $added_classes_order ) > 0 || count( $deleted_classes ) > 0,
			] );
		}

		return $result;
	}

	private static function create_new_class( array $sanitized_item ): void {
		$created = Global_Class_Post::create( $sanitized_item['id'], $sanitized_item['label'], $sanitized_item );

		if ( $created ) {
			clean_post_cache( $created->get_post_id() );
		} else {
			throw new \Exception( 'Failed to create new class: ' . $sanitized_item['id'] . ' with label: ' . $sanitized_item['label'] );
		}
	}

	private static function replace_existing_class( string $existing_id, array $sanitized_item ): void {
		$post = Global_Class_Post::find_by_class_id( $existing_id );

		if ( ! $post ) {
			throw new \Exception( 'Failed to find existing class: ' . $existing_id );
		}

		$post->update_data( $sanitized_item );
		clean_post_cache( $post->get_post_id() );
	}

	private static function validate_class_entry( $class_entry ): array {
		if ( ! is_array( $class_entry ) ) {
			return [
				'is_valid' => false,
				'error' => self::ERROR_NOT_ARRAY,
			];
		}

		$missing_fields = [];

		foreach ( [ 'id', 'label' ] as $field ) {
			if ( ! isset( $class_entry[ $field ] ) || ! is_string( $class_entry[ $field ] ) ) {
				$missing_fields[] = $field;
			}
		}

		if ( ! empty( $missing_fields ) ) {
			return [
				'is_valid' => false,
				'error' => self::ERROR_MISSING_FIELDS . ':' . implode( ',', $missing_fields ),
			];
		}

		return [
			'is_valid' => true,
			'error' => null,
		];
	}

	private static function resolve_item_action(
		array $class_entry,
		array $existing_label_to_id,
		string $conflict_resolution
	): string {
		$label_lower = strtolower( $class_entry['label'] );
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

	private static function sanitize_item( string $item_id, array $item, Style_Parser $style_parser ): array {
		$item_result = $style_parser->parse( $item );

		if ( ! $item_result->is_valid() ) {
			return [
				'is_valid' => false,
				'error' => self::ERROR_INVALID_PROPS,
				'sanitized' => null,
			];
		}

		$sanitized_item = $item_result->unwrap();

		if ( $item_id !== $sanitized_item['id'] ) {
			return [
				'is_valid' => false,
				'error' => self::ERROR_ID_MISMATCH,
				'sanitized' => null,
			];
		}

		return [
			'is_valid' => true,
			'error' => null,
			'sanitized' => $sanitized_item,
		];
	}

	private static function build_label_to_id_map_from_labels( array $id_to_label ): array {
		$map = [];

		foreach ( $id_to_label as $id => $label ) {
			$map[ strtolower( $label ) ] = $id;
		}

		return $map;
	}

	private static function generate_unique_id( array $order_set ): string {
		do {
			$id = 'g-' . substr( bin2hex( random_bytes( 4 ) ), 0, 7 );
		} while ( isset( $order_set[ $id ] ) );

		return $id;
	}
}
