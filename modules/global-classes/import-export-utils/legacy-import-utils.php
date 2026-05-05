<?php

namespace Elementor\Modules\GlobalClasses\ImportExportUtils;

use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Import_Export_Customization;
use Elementor\Plugin;
use Elementor\Core\Kits\Documents\Kit;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Legacy_Import_Utils {
	public static function import_classes( string $global_classes_file, ?Kit $kit = null ): array {
		$global_classes = ImportExportUtils::read_json_file( $global_classes_file );

		if ( ! $kit || ! $global_classes ) {
			return [];
		}

		$global_classes['order'] = Global_Classes_Parser::sanitize_order(
			$global_classes['items'] ?? [],
			$global_classes['order'] ?? []
		);

		$global_classes_result = Global_Classes_Parser::make()->parse( $global_classes );

		if ( ! $global_classes_result->is_valid() ) {
			return [];
		}

		$imported_classes = $global_classes_result->unwrap();
		$repository = Global_Classes_Repository::make( $kit );

		$override_all = ! empty( $data['customization']['settings']['classesOverrideAll'] );

		if ( $override_all ) {
            $repository->delete_all();

			$repository->put(
				$imported_classes['items'],
				$imported_classes['order']
			);

			return $imported_classes;
		}

		$existing_classes = Global_Classes_Repository::make( $kit )->all()->get();
		$merged = self::merge_classes( $existing_classes, $imported_classes );

		$repository->put(
			$merged['items'],
			$merged['order']
		);

		return $imported_classes;
	}

	private static function merge_classes( array $existing, array $imported ): array {
		$existing_items = $existing['items'] ?? [];
		$existing_order = $existing['order'] ?? [];
		$existing_labels = self::get_existing_labels( $existing_items );

		$imported_items = $imported['items'] ?? [];
		$imported_order = $imported['order'] ?? [];

		foreach ( $imported_order as $imported_id ) {
			if ( ! isset( $imported_items[ $imported_id ] ) ) {
				continue;
			}

			$imported_class = $imported_items[ $imported_id ];

			$id_exists = array_key_exists( $imported_id, $existing_items );
			$new_id = $id_exists
				? self::generate_unique_id( array_keys( $existing_items ) )
				: $imported_id;

			$original_label = $imported_class['label'] ?? $imported_id;
			$new_label = ImportExportUtils::resolve_label_conflict( $original_label, $existing_labels );
			$existing_labels[] = strtolower( $new_label );

			$imported_class['id'] = $new_id;
			$imported_class['label'] = $new_label;

			$existing_items[ $new_id ] = $imported_class;
			$existing_order[] = $new_id;
		}

		return [
			'items' => $existing_items,
			'order' => $existing_order,
		];
	}

	private static function get_existing_labels( array $items ): array {
		$labels = [];

		foreach ( $items as $item ) {
			if ( isset( $item['label'] ) ) {
				$labels[] = strtolower( $item['label'] );
			}
		}

		return $labels;
	}

	private static function generate_unique_id( array $existing_ids ): string {
		return Utils::generate_id( 'g-', $existing_ids );
	}
}