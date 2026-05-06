<?php

namespace Elementor\Modules\GlobalClasses\ImportExportUtils;

use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Core\Kits\Documents\Kit;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Legacy_Import_Utils {
	public static function import_classes( string $global_classes_file, string $conflict_resolution, ?Kit $kit_for_reading = null ): array {
		$global_classes = ImportExportUtils::read_json_file( $global_classes_file );

		if ( ! $kit_for_reading || ! $global_classes ) {
			return Import_Utils::EMPTY_RESULT;
		}

		$global_classes_result = Global_Classes_Parser::make()->parse( $global_classes );

		if ( ! $global_classes_result->is_valid() ) {
			throw new \Exception( 'Invalid global classes file: ' . esc_html( $global_classes_result->errors()->to_string() ) );
		}

		$imported_classes = $global_classes_result->unwrap();
		$repository_for_reading = Global_Classes_Repository::make( $kit_for_reading );
		$repository_for_writing = Global_Classes_Repository::make();

		if ( 'override-all' === $conflict_resolution ) {
			$repository_for_writing->delete_all();

			$repository_for_writing->put(
				$imported_classes['items'],
				$imported_classes['order']
			);

			$result = Import_Utils::EMPTY_RESULT;

			foreach ( $imported_classes['order'] as $id ) {
				if ( ! isset( $imported_classes['items'][ $id ] ) ) {
					continue;
				}

				$item = $imported_classes['items'][ $id ];
				$entry = [
					'id' => $id,
					'label' => $item['label'] ?? $id,
				];
				$result['created'][] = [
					'import_entry' => $entry,
					'result_entry' => $entry,
				];
			}

			return $result;
		}

		$existing_labels = $repository_for_reading->all_labels();
		$existing_order = $repository_for_reading->get_order();
		$existing_ids_set = array_flip( $existing_order );
		$existing_label_keys = array_values( array_map( 'strtolower', $existing_labels ) );

		$imported_items = $imported_classes['items'] ?? [];
		$imported_order = $imported_classes['order'] ?? [];

		$items_to_add = [];
		$added_order = [];
		$result = Import_Utils::EMPTY_RESULT;

		foreach ( $imported_order as $imported_id ) {
			if ( ! isset( $imported_items[ $imported_id ] ) ) {
				continue;
			}

			$imported_class = $imported_items[ $imported_id ];

			$new_id = $imported_id;
			if ( isset( $existing_ids_set[ $new_id ] ) || isset( $items_to_add[ $new_id ] ) ) {
				$all_ids = array_merge( array_keys( $existing_ids_set ), array_keys( $items_to_add ) );
				$new_id = self::generate_unique_id( $all_ids );
			}

			$original_label = $imported_class['label'] ?? $imported_id;
			$new_label = ImportExportUtils::resolve_label_conflict( $original_label, $existing_label_keys );
			$existing_label_keys[] = strtolower( $new_label );

			$imported_class['id'] = $new_id;
			$imported_class['label'] = $new_label;

			$items_to_add[ $new_id ] = $imported_class;
			$added_order[] = $new_id;

			$import_entry = [
				'id' => $imported_id,
				'label' => $original_label,
			];
			$result_entry = [
				'id' => $new_id,
				'label' => $new_label,
			];

			$was_renamed = strtolower( $new_label ) !== strtolower( $original_label );

			if ( $was_renamed ) {
				$result['renamed'][] = [
					'import_entry' => $import_entry,
					'result_entry' => $result_entry,
				];
			} else {
				$result['created'][] = [
					'import_entry' => $import_entry,
					'result_entry' => $result_entry,
				];
			}
		}

		if ( ! empty( $items_to_add ) ) {
			$final_order = array_merge( $added_order, $existing_order );

			$repository_for_writing->put( $items_to_add, $final_order );
		}

		return $result;
	}

	private static function generate_unique_id( array $existing_ids ): string {
		return Utils::generate_id( 'g-', $existing_ids );
	}
}
