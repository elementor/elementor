<?php

namespace Elementor\Modules\Components\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Export_Runner_Base;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\Components\Module as Components_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Export extends Export_Runner_Base {
	private Components_Repository $repository;

	public function __construct( ?Components_Repository $repository = null ) {
		$this->repository = $repository ?? Components_Repository::make();
	}

	public static function get_name(): string {
		return 'components';
	}

	public function should_export( array $data ): bool {
		return Components_Module::is_experiment_active();
	}

	public function export( array $data ): array {
		$components = $this->repository->all()->all();

		if ( empty( $components ) ) {
			return $this->empty_result();
		}

		$manifest = [];
		$files = [];

		foreach ( $components as $component_summary ) {
			$component_id = (int) $component_summary['id'];
			$component = $this->repository->get( $component_id, false );

			if ( ! $component ) {
				continue;
			}

			$manifest[ $component_id ] = [
				'title' => $component->get_main_post()->post_title,
				'uid' => $component->get_component_uid(),
			];

			$files[] = [
				'path' => Import_Export_Customization::DIRECTORY_NAME . '/' . $component->get_component_uid(),
				'data' => $this->build_component_export_record( $component ),
			];
		}

		if ( empty( $files ) ) {
			return $this->empty_result();
		}

		return [
			'manifest' => [
				[
					Import_Export_Customization::MANIFEST_KEY => $manifest,
				],
			],
			'files' => $files,
		];
	}

	private function build_component_export_record( Component_Document $component ): array {
		$document_data = $component->get_export_data();
		$overridable_props = $component->get_overridable_props()->to_associative_array();
		$variants = $component->get_variants()->to_associative_array();
		$document_data['settings']['overridable_props'] = $overridable_props;
		$document_data['settings']['variants'] = $variants;

		return [
			'id' => $component->get_main_id(),
			'uid' => $component->get_component_uid(),
			'title' => $component->get_main_post()->post_title,
			'status' => $component->get_main_post()->post_status,
			'is_archived' => $component->get_is_archived(),
			'overridable_props' => $overridable_props,
			'variants' => $variants,
			'document' => $document_data,
			'thumbnail' => get_the_post_thumbnail_url( $component->get_main_post() ),
		];
	}

	private function empty_result(): array {
		return [
			'manifest' => [],
			'files' => [],
		];
	}
}
