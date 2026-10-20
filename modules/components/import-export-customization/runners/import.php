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
			! empty( $data['manifest'][ Import_Export_Customization::MANIFEST_KEY ] )
		);
	}

	public function import( array $data, array $imported_data ): array {
		$strategy_name = $this->resolve_strategy_name( $data );
		$strategy = $this->strategy_factory->create( $strategy_name );
		$records = $this->load_records( $data );
		$result = $this->empty_result();

		if ( empty( $records ) ) {
			return [
				Import_Export_Customization::MANIFEST_KEY => $result,
			];
		}

		$documents_to_import = [];

		foreach ( $records as $record ) {
			try {
				$resolution = $strategy->resolve( $record );

				if ( ! $resolution->should_import_document() ) {
					$result['skipped'][ $record['id'] ] = $record['uid'];
					continue;
				}

				$document = $this->resolve_document_for_import( $record, $resolution );

				if ( $resolution->should_track_in_session() ) {
					$this->set_session_post_meta( $document->get_main_id(), $data['session_id'] );
				}

				$resolution->set_destination_component_id( $document->get_main_id() );
				$result['succeed'][ (int) $record['id'] ] = $document->get_main_id();
				$documents_to_import[] = [
					'document' => $document,
					'record' => $record,
					'resolution' => $resolution,
				];
			} catch ( \Exception $e ) {
				$result['failed'][ (int) ( $record['id'] ?? 0 ) ] = $e->getMessage();
			}
		}

		foreach ( $documents_to_import as $entry ) {
			try {
				$document_data = $this->prepare_document_data( $entry['record'] );
				$entry['document']->import( $document_data );

				if ( ! empty( $entry['record']['is_archived'] ) ) {
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
			Import_Export_Customization::MANIFEST_KEY => $result,
		];
	}

	public function get_import_session_metadata(): array {
		return $this->import_session_metadata;
	}

	private function load_records( array $data ): array {
		$records = [];
		$components_manifest = $data['manifest'][ Import_Export_Customization::MANIFEST_KEY ] ?? [];
		$components_dir = trailingslashit( $data['extracted_directory_path'] . Import_Export_Customization::DIRECTORY_NAME );

		foreach ( $components_manifest as $component_manifest ) {
			$component_uid = $component_manifest['uid'] ?? '';

			if ( ! is_string( $component_uid ) || '' === $component_uid ) {
				continue;
			}

			$record = Import_Export_Utils::read_json_file( $components_dir . $component_uid );

			if ( ! empty( $record ) ) {
				$records[] = $record;
			}
		}

		return $records;
	}

	private function resolve_document_for_import( array $record, Import_Strategy_Result $resolution ): Component_Document {
		if ( $resolution->should_create_document() ) {
			$status = $this->sanitize_status( $record['status'] ?? Document::STATUS_PUBLISH );

			return $this->repository->create_empty_document(
				(string) ( $record['title'] ?? '' ),
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
		$document_data = $record['document'] ?? [];
		$document_data['settings'] = $this->merge_component_settings( $document_data['settings'] ?? [], $record );
		$document_data['import_settings'] = [
			'thumbnail' => $record['thumbnail'] ?? '',
		];

		return $document_data;
	}

	private function merge_component_settings( array $settings, array $record ): array {
		if ( isset( $record['overridable_props'] ) ) {
			$settings['overridable_props'] = $record['overridable_props'];
		}

		if ( isset( $record['variants'] ) ) {
			$settings['variants'] = $record['variants'];
		}

		return $settings;
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
