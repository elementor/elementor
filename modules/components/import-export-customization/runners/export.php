<?php

namespace Elementor\Modules\Components\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Export_Runner_Base;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\Components\Utils\Collect_Component_Dependencies;

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
		$dependencies = [];

		foreach ( $components as $component_summary ) {
			$component_id = (int) $component_summary['id'];
			$component = $this->repository->get( $component_id, false );

			if ( ! $component ) {
				continue;
			}

			$export_data = $this->build_component_export_data( $component );

			$manifest[ $component_id ] = $this->build_component_manifest_data( $component );

			$files[] = [
				'path' => Import_Export_Customization::CONTENT_DIRECTORY . $component_id,
				'data' => $export_data,
			];

			$dependencies[ $component_id ] = [
				'depends_on' => Collect_Component_Dependencies::from_elements( $export_data['content'] ?? [] ),
			];
		}

		if ( empty( $files ) ) {
			return $this->empty_result();
		}

		$files[] = [
			'path' => Import_Export_Customization::DEPENDENCIES_FILE_PATH,
			'data' => [
				'dependencies' => $dependencies,
			],
		];

		return [
			'manifest' => [
				[
					'content' => [
						Component_Document::TYPE => $manifest,
					],
				],
			],
			'files' => $files,
		];
	}

	private function build_component_manifest_data( Component_Document $component ): array {
		$post = $component->get_main_post();

		return [
			'title' => $post->post_title,
			'excerpt' => $post->post_excerpt ?? '',
			'doc_type' => $component->get_name(),
			'thumbnail' => get_the_post_thumbnail_url( $post ),
		];
	}

	private function build_component_export_data( Component_Document $component ): array {
		$export_data = $component->get_export_data();
		$export_data['settings']['overridable_props'] = $component->get_overridable_props()->to_associative_array();
		$export_data['settings']['variants'] = $component->get_variants()->to_associative_array();
		$export_data['component'] = [
			'uid' => $component->get_component_uid(),
			'status' => $component->get_main_post()->post_status,
			'is_archived' => $component->get_is_archived(),
		];

		return $export_data;
	}

	private function empty_result(): array {
		return [
			'manifest' => [],
			'files' => [],
		];
	}
}
