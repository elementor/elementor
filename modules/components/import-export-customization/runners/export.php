<?php

namespace Elementor\Modules\Components\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Export_Runner_Base;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\Components\Utils\Collect_Component_Dependencies;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Export extends Export_Runner_Base {
	public static function get_name(): string {
		return 'components';
	}

	public function should_export( array $data ): bool {
		return Components_Module::is_import_export_supported()
			&& in_array( 'content', $data['include'] ?? [], true );
	}

	public function export( array $data ): array {
		$files = [];
		$manifest = [];
		$dependencies = [];

		foreach ( $this->get_component_posts() as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );

			if ( ! $document instanceof Component_Document ) {
				continue;
			}

			$content = $this->export_elements( $document );

			$files[] = [
				'path' => Component_Document::EXPORT_DIRECTORY . $post->ID,
				'data' => [
					'content' => $content,
					'settings' => $document->get_kit_export_settings(),
					'metadata' => $document->get_export_metadata(),
				],
			];

			$manifest[ $post->ID ] = $document->get_export_summary();
			$dependencies[ $post->ID ] = [
				'depends_on' => Collect_Component_Dependencies::from_elements( $content ),
			];
		}

		if ( empty( $files ) ) {
			return $this->empty_result();
		}

		$files[] = [
			'path' => Component_Document::EXPORT_DIRECTORY . Component_Document::EXPORT_DEPENDENCIES_FILE_NAME,
			'data' => [
				'dependencies' => $dependencies,
			],
		];

		return [
			'files' => $files,
			'manifest' => [
				[
					Component_Document::EXPORT_MANIFEST_KEY => $manifest,
				],
			],
		];
	}

	/**
	 * Unlike `Document::get_export_data()`, element IDs are intentionally kept as-is
	 * so that references to them (e.g. overridable props, component instances)
	 * remain valid in the exported kit.
	 */
	private function export_elements( Component_Document $document ): array {
		return Plugin::$instance->db->iterate_data( $document->get_elements_data(), function ( $element_data ) use ( $document ) {
			$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

			return $element ? $document->process_element_import_export( $element, 'on_export' ) : null;
		} );
	}

	private function get_component_posts(): array {
		$query = new \WP_Query( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'meta_query' => [
				[
					'key' => static::META_KEY_ELEMENTOR_EDIT_MODE,
					'compare' => 'EXISTS',
				],
				[
					'key' => '_elementor_data',
					'compare' => 'EXISTS',
				],
				[
					'key' => '_elementor_data',
					'compare' => '!=',
					'value' => '[]',
				],
			],
		] );

		return $query->posts;
	}

	private function empty_result(): array {
		return [
			'manifest' => [],
			'files' => [],
		];
	}
}
