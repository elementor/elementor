<?php

namespace Elementor\Modules\Components\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExportCustomization\Utils as Import_Export_Utils;
use Elementor\Core\Base\Document;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\Components\ImportExportCustomization\ImportStrategies\Import_Strategy_Factory;
use Elementor\Modules\Components\ImportExportCustomization\ImportStrategies\Import_Strategy_Result;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\Components\Utils\Sort_Components_By_Dependencies;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	const DEFAULT_STRATEGY = 'duplicate';

	private Components_Repository $repository;

	private Import_Strategy_Factory $strategy_factory;

	private array $import_session_metadata = [];

	public function __construct( ?Components_Repository $repository = null, ?Import_Strategy_Factory $strategy_factory = null ) {
		$this->repository = $repository ?? Components_Repository::make();
		$this->strategy_factory = $strategy_factory ?? new Import_Strategy_Factory( $this->repository );
	}

	public static function get_name(): string {
		return 'components';
	}

	public function should_import( array $data ): bool {
		return (
			Components_Module::is_experiment_active() &&
			! empty( $data['extracted_directory_path'] ) &&
			! empty( $data['manifest']['content'][ Component_Document::TYPE ] )
		);
	}

	public function import( array $data, array $imported_data ): array {
		$strategy_name = $this->resolve_strategy_name( $data );
		$strategy = $this->strategy_factory->create( $strategy_name );
		$result = $this->empty_result();
		$records = $this->load_records( $data, $result );
		$records = $this->sort_records_by_dependencies( $records, $data );

		$documents_to_import = [];

		foreach ( $records as $component_id => $record ) {
			try {
				$resolution = $strategy->resolve( $record );

				if ( ! $resolution->should_import_document() ) {
					$result['skipped'][ $component_id ] = $record['uid'];
					continue;
				}

				$document = $this->resolve_document_for_import( $record, $resolution );

				if ( $resolution->should_track_in_session() ) {
					$this->set_session_post_meta( $document->get_main_id(), $data['session_id'] );
				}

				$resolution->set_destination_component_id( $document->get_main_id() );
				$result['succeed'][ $component_id ] = $document->get_main_id();
				$documents_to_import[] = [
					'document' => $document,
					'record' => $record,
					'resolution' => $resolution,
				];
			} catch ( \Exception $e ) {
				$result['failed'][ $component_id ] = $e->getMessage();
			}
		}

		foreach ( $documents_to_import as $entry ) {
			try {
				$entry['document']->import( $this->prepare_document_data( $entry['record'] ) );

				if ( ! empty( $entry['record']['component']['is_archived'] ) ) {
					$entry['document']->archive();
				}
			} catch ( \Exception $e ) {
				if ( $entry['resolution']->should_track_in_session() ) {
					$entry['document']->force_delete();
				}

				throw $e;
			}
		}

		$this->import_session_metadata = [
			'strategy' => $strategy_name,
			'created' => array_values( $result['succeed'] ),
		];

		return [
			'content' => [
				Component_Document::TYPE => $result,
			],
		];
	}

	public function get_import_session_metadata(): array {
		return $this->import_session_metadata;
	}

	/**
	 * Kits exported before the components runner existed only carry the generic document export
	 * (`content`, `settings`, `metadata`), so the `component` block is optional.
	 */
	private function load_records( array $data, array &$result ): array {
		$records = [];
		$components_manifest = $data['manifest']['content'][ Component_Document::TYPE ] ?? [];
		$components_dir = $data['extracted_directory_path'] . Import_Export_Customization::CONTENT_DIRECTORY;

		foreach ( $components_manifest as $component_id => $post_settings ) {
			$component_id = (int) $component_id;
			$export_data = Import_Export_Utils::read_json_file( $components_dir . $component_id );

			if ( empty( $export_data ) ) {
				$result['failed'][ $component_id ] = 'Component file is missing.';
				continue;
			}

			$component = $export_data['component'] ?? [];
			unset( $export_data['component'] );

			$records[ $component_id ] = [
				'id' => $component_id,
				'uid' => is_string( $component['uid'] ?? null ) ? $component['uid'] : '',
				'component' => $component,
				'post_settings' => is_array( $post_settings ) ? $post_settings : [],
				'export_data' => $export_data,
			];
		}

		return $records;
	}

	private function sort_records_by_dependencies( array $records, array $data ): array {
		$dependencies_file = Import_Export_Utils::read_json_file( $data['extracted_directory_path'] . Import_Export_Customization::DEPENDENCIES_FILE_PATH );
		$dependencies = $dependencies_file['dependencies'] ?? [];

		if ( empty( $dependencies ) || ! is_array( $dependencies ) ) {
			return $records;
		}

		$sorted_records = [];

		foreach ( Sort_Components_By_Dependencies::apply( array_keys( $records ), $dependencies ) as $component_id ) {
			$sorted_records[ $component_id ] = $records[ $component_id ];
		}

		return $sorted_records;
	}

	private function resolve_document_for_import( array $record, Import_Strategy_Result $resolution ): Component_Document {
		if ( $resolution->should_create_document() ) {
			$status = $this->sanitize_status( (string) ( $record['component']['status'] ?? Document::STATUS_PUBLISH ) );

			return $this->repository->create_empty_document(
				(string) ( $record['post_settings']['title'] ?? '' ),
				$status,
				$resolution->get_uid()
			);
		}

		$destination_component_id = $resolution->get_destination_component_id();
		$document = $destination_component_id ? $this->repository->get( $destination_component_id, false ) : null;

		if ( ! $document ) {
			throw new \Exception( 'Failed to resolve component import target.' );
		}

		return $document;
	}

	private function prepare_document_data( array $record ): array {
		$document_data = $record['export_data'];
		$document_data['content'] = $document_data['content'] ?? [];
		$document_data['settings'] = $document_data['settings'] ?? [];
		$document_data['import_settings'] = array_merge(
			[ 'thumbnail' => '' ],
			$record['post_settings']
		);

		return $document_data;
	}

	private function sanitize_status( string $status ): string {
		if ( in_array( $status, [ Document::STATUS_PUBLISH, Document::STATUS_DRAFT, Document::STATUS_AUTOSAVE ], true ) ) {
			return $status;
		}

		return Document::STATUS_PUBLISH;
	}

	private function resolve_strategy_name( array $data ): string {
		$strategy_name = $data['customization']['settings']['componentsImportStrategy'] ?? self::DEFAULT_STRATEGY;

		return is_string( $strategy_name ) && '' !== $strategy_name
			? $strategy_name
			: self::DEFAULT_STRATEGY;
	}

	private function empty_result(): array {
		return [
			'succeed' => [],
			'failed' => [],
			'skipped' => [],
		];
	}
}
