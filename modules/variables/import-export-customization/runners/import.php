<?php

namespace Elementor\Modules\Variables\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\Variables\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
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
			$this->save_collection( $repository, $imported_collection );

			return $variables_data;
		}

		$existing_collection = $repository->load();
		$imported_collection = Variables_Collection::hydrate( $variables_data );

		$merged_collection = $this->merge_collections( $existing_collection, $imported_collection );
		$this->save_collection( $repository, $merged_collection );

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

			$original_id = $variable->id();
			$id_exists = in_array( $original_id, $existing_ids, true );
			$new_id = $id_exists
				? $this->generate_unique_id( $existing_ids )
				: $original_id;
			$existing_ids[] = $new_id;

			$new_label = ImportExportUtils::resolve_label_conflict( $variable->label(), $existing_labels );
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

	private function generate_unique_id( array $existing_ids ): string {
		return Utils::generate_id( 'e-gv-', $existing_ids );
	}

	private function save_collection( Variables_Repository $repository, Variables_Collection $collection ): void {
		$result = $repository->save( $collection );

		if ( false === $result ) {
			throw new \RuntimeException( 'Failed to save global variables during import.' );
		}
	}
}
