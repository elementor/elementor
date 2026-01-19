<?php

namespace Elementor\Modules\Variables\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\Variables\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	private const MAX_LABEL_LENGTH = 50;

	public static function get_name(): string {
		return 'global-variables';
	}

	public function should_import( array $data ): bool {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			! empty( $data['extracted_directory_path'] ) &&
			$this->is_variables_enabled( $data )
		);
	}

	private function is_variables_enabled( array $data ): bool {
		if ( isset( $data['customization']['settings']['variables'] ) ) {
			return (bool) $data['customization']['settings']['variables'];
		}

		return true;
	}

	public function import( array $data, array $imported_data ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$file_name = Import_Export_Customization::FILE_NAME;
		$variables_data = ImportExportUtils::read_json_file( "{$data['extracted_directory_path']}/{$file_name}.json" );

		if ( ! $kit || ! $variables_data || empty( $variables_data['data'] ) ) {
			return [];
		}

		$repository = new Variables_Repository( $kit );

		$override_all = ! empty( $data['customization']['settings']['variablesOverrideAll'] );

		if ( $override_all ) {
			$imported_collection = Variables_Collection::hydrate( $variables_data );
			$repository->save( $imported_collection );

			return $variables_data;
		}

		$existing_collection = $repository->load();
		$imported_collection = Variables_Collection::hydrate( $variables_data );

		$merged_collection = $this->merge_collections( $existing_collection, $imported_collection );
		$repository->save( $merged_collection );

		return $variables_data;
	}

	private function merge_collections(
		Variables_Collection $existing,
		Variables_Collection $imported
	): Variables_Collection {
		$existing_labels = $this->get_existing_labels( $existing );
		$existing_ids = array_keys( $existing->all() );

		foreach ( $imported->all() as $variable ) {
			if ( $variable->is_deleted() ) {
				continue;
			}

			$new_id = $this->generate_unique_id( $existing_ids );
			$existing_ids[] = $new_id;

			$new_label = $this->resolve_label_conflict( $variable->label(), $existing_labels );
			$existing_labels[] = strtolower( $new_label );

			$new_variable = Variable::create_new( [
				'id' => $new_id,
				'type' => $variable->type(),
				'label' => $new_label,
				'value' => $variable->value(),
				'order' => $existing->get_next_order(),
			] );

			$existing->add_variable( $new_variable );
		}

		return $existing;
	}

	private function get_existing_labels( Variables_Collection $collection ): array {
		$labels = [];

		foreach ( $collection->all() as $variable ) {
			if ( ! $variable->is_deleted() ) {
				$labels[] = strtolower( $variable->label() );
			}
		}

		return $labels;
	}

	private function resolve_label_conflict( string $label, array $existing_labels ): string {
		$lower_label = strtolower( $label );

		if ( ! in_array( $lower_label, $existing_labels, true ) ) {
			return $label;
		}

		$suffix = 1;

		do {
			$suffix_str = '_' . $suffix;
			$max_base_length = self::MAX_LABEL_LENGTH - strlen( $suffix_str );
			$base_label = mb_substr( $label, 0, $max_base_length );
			$new_label = $base_label . $suffix_str;
			$suffix++;
		} while ( in_array( strtolower( $new_label ), $existing_labels, true ) && $suffix < 1000 );

		return $new_label;
	}

	private function generate_unique_id( array $existing_ids ): string {
		do {
			$new_id = 'e-gv-' . wp_generate_uuid4();
		} while ( in_array( $new_id, $existing_ids, true ) );

		return $new_id;
	}
}
