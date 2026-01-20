<?php

namespace Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Import_Export_Customization;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	public static function get_name(): string {
		return 'global-classes';
	}

	public function should_import( array $data ): bool {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			! empty( $data['extracted_directory_path'] ) &&
			$this->is_classes_enabled( $data )
		);
	}

	private function is_classes_enabled( array $data ): bool {
		if ( isset( $data['customization']['settings']['classes'] ) ) {
			return (bool) $data['customization']['settings']['classes'];
		}

		return true;
	}

	public function import( array $data, array $imported_data ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$file_name = Import_Export_Customization::FILE_NAME;
		$global_classes = ImportExportUtils::read_json_file( "{$data['extracted_directory_path']}/{$file_name}.json" );

		if ( ! $kit || ! $global_classes ) {
			return [];
		}

		$global_classes_result = Global_Classes_Parser::make()->parse( $global_classes );

		if ( ! $global_classes_result->is_valid() ) {
			return [];
		}

		$imported_classes = $global_classes_result->unwrap();
		$repository = Global_Classes_Repository::make();

		$override_all = ! empty( $data['customization']['settings']['classesOverrideAll'] );

		if ( $override_all ) {
			$repository->put(
				$imported_classes['items'],
				$imported_classes['order']
			);

			return $imported_classes;
		}

		$existing_classes = $repository->all()->get();
		$merged = $this->merge_classes( $existing_classes, $imported_classes );

		$repository->put(
			$merged['items'],
			$merged['order']
		);

		return $imported_classes;
	}

	private function merge_classes( array $existing, array $imported ): array {
		$existing_items = $existing['items'] ?? [];
		$existing_order = $existing['order'] ?? [];
		$existing_labels = $this->get_existing_labels( $existing_items );

		$imported_items = $imported['items'] ?? [];
		$imported_order = $imported['order'] ?? [];

		foreach ( $imported_order as $imported_id ) {
			if ( ! isset( $imported_items[ $imported_id ] ) ) {
				continue;
			}

			$imported_class = $imported_items[ $imported_id ];

			$id_exists = array_key_exists( $imported_id, $existing_items );
			$new_id = $id_exists
				? $this->generate_unique_id( array_keys( $existing_items ) )
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

	private function get_existing_labels( array $items ): array {
		$labels = [];

		foreach ( $items as $item ) {
			if ( isset( $item['label'] ) ) {
				$labels[] = strtolower( $item['label'] );
			}
		}

		return $labels;
	}

	private function generate_unique_id( array $existing_ids ): string {
		return Utils::generate_id( 'g-', $existing_ids );
	}
}
