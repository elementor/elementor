<?php

namespace Elementor\Modules\Variables\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Design_System_Import_Context;
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
	const EMPTY_RESULT = [
		'created' => [],
		'renamed' => [],
		'replaced' => [],
		'skipped' => [],
		'failed' => [],
	];

	public static function get_name(): string {
		return 'global-variables';
	}

	public function should_import( array $data ): bool {
		$import_context = Design_System_Import_Context::from_data( $data );

		return (
			$import_context->is_included() &&
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
			return self::EMPTY_RESULT;
		}

		$repository = new Variables_Repository( $kit );
		$import_context = Design_System_Import_Context::from_data( $data );
		$conflict_resolution = $import_context->resolve_conflict_resolution( $data, 'variablesOverrideAll' );

		if ( 'override-all' === $conflict_resolution ) {
			$imported_collection = Variables_Collection::hydrate( $variables_data );
			$this->save_collection( $repository, $imported_collection );

			return $this->build_override_all_result( $imported_collection );
		}

		$existing_collection = $this->get_existing_collection( $repository, $imported_data );
		$imported_collection = Variables_Collection::hydrate( $variables_data );

		$result = $this->resolve_collections( $existing_collection, $imported_collection, $conflict_resolution );
		$this->save_collection( $repository, $existing_collection );

		return $result;
	}

	private function build_override_all_result( Variables_Collection $imported_collection ): array {
		$result = self::EMPTY_RESULT;

		foreach ( $imported_collection->all() as $variable ) {
			if ( $variable->is_deleted() ) {
				continue;
			}

			$result['created'][] = [
				'import_entry' => $this->format_variable_as_entry( $variable ),
			];
		}

		return $result;
	}

	private function get_existing_collection( Variables_Repository $repository, array $imported_data ): Variables_Collection {
		$existing = $repository->load();

		if ( count( $existing->all() ) > 0 ) {
			return $existing;
		}

		$was_new_kit_created = ! empty( $imported_data['site-settings']['imported_kit_id'] );

		if ( ! $was_new_kit_created ) {
			return $existing;
		}

		$previous_kit_id = Plugin::$instance->kits_manager->get_previous_id();

		if ( ! $previous_kit_id ) {
			return $existing;
		}

		$previous_kit = Plugin::$instance->kits_manager->get_kit( $previous_kit_id );
		$previous_repository = new Variables_Repository( $previous_kit );

		return $previous_repository->load();
	}

	private function resolve_collections(
		Variables_Collection $existing,
		Variables_Collection $imported,
		string $conflict_resolution
	): array {
		$existing_labels = $this->get_existing_labels( $existing );
		$existing_label_type_map = $this->build_label_type_map( $existing );
		$existing_ids = array_keys( $existing->all() );

		$result = self::EMPTY_RESULT;

		foreach ( $imported->all() as $variable ) {
			if ( $variable->is_deleted() ) {
				continue;
			}

			$import_entry = $this->format_variable_as_entry( $variable );
			$label_lower = strtolower( $variable->label() );
			$has_label_conflict = in_array( $label_lower, $existing_labels, true );

			if ( $has_label_conflict && 'skip' === $conflict_resolution ) {
				$result['skipped'][] = [ 'import_entry' => $import_entry ];
				continue;
			}

			if ( $has_label_conflict && 'replace' === $conflict_resolution ) {
				$existing_entry = $existing_label_type_map[ $label_lower ] ?? null;
				$type_matches = $existing_entry && $existing_entry['type'] === $variable->type();

				if ( $type_matches ) {
					$existing_var = $existing->get( $existing_entry['id'] );
					$existing_var->set_value( $variable->value() );

					$result['replaced'][] = [
						'import_entry' => $import_entry,
						'result_entry' => $this->format_variable_as_entry( $existing_var ),
					];
					continue;
				}
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

			$was_renamed = strtolower( $new_label ) !== $label_lower;
			$result_entry = $this->format_variable_as_entry( $new_variable );

			if ( $was_renamed ) {
				$result['renamed'][] = [
					'import_entry' => $import_entry,
					'result_entry' => $result_entry,
				];
			} else {
				$result['created'][] = [ 'import_entry' => $import_entry ];
			}
		}

		return $result;
	}

	private function build_label_type_map( Variables_Collection $collection ): array {
		$map = [];

		foreach ( $collection->all() as $variable ) {
			if ( ! $variable->is_deleted() ) {
				$map[ strtolower( $variable->label() ) ] = [
					'id' => $variable->id(),
					'type' => $variable->type(),
				];
			}
		}

		return $map;
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

	private function format_variable_as_entry( Variable $variable ): array {
		return [
			'id' => $variable->id(),
			'label' => $variable->label(),
		];
	}
}
