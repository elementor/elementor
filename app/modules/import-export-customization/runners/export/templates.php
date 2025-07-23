<?php

namespace Elementor\App\Modules\ImportExportCustomization\Runners\Export;

use Elementor\Core\Base\Document;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

class Templates extends Export_Runner_Base {

	public static function get_name(): string {
		return 'templates';
	}

	public function should_export( array $data ) {
		return (
			Utils::has_pro() &&
			isset( $data['include'] ) &&
			in_array( 'templates', $data['include'], true )
		);
	}

	public function export( array $data ) {
		$customization = $data['customization']['templates'] ?? null;

		if ( $customization ) {
			return $this->export_customization( $data, $customization );
		}

		return $this->export_all( $data );
	}

	private function export_all( array $data ) {
		$template_types = array_values( Source_Local::get_template_types() );

		return $this->export_templates_by_types( $template_types );
	}

	private function export_customization( array $data, $customization ) {
		$template_types = [];

		if ( isset( $customization['siteTemplates'] ) && $customization['siteTemplates'] ) {
			$template_types = array_keys( Plugin::$instance->documents->get_document_types( [
				'is_editable' => true,
				'show_in_library' => true,
				'export_group' => 'site-templates',
			] ) );
		}

		$template_types_to_add = apply_filters( 'elementor/import-export-customization/export/template_types', [], $data, $customization );
		$template_types = array_merge( $template_types, $template_types_to_add );

		if ( empty( $template_types ) ) {
			return [
				'files' => [],
				'manifest' => [],
			];
		}

		return $this->export_templates_by_types( $template_types );
	}

	private function export_templates_by_types( array $template_types ) {
		$query_args = [
			'post_type' => Source_Local::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'meta_query' => [
				[
					'key' => Document::TYPE_META_KEY,
					'value' => $template_types,
				],
			],
		];

		$templates_query = new \WP_Query( $query_args );

		$templates_manifest_data = [];
		$files = [];

		foreach ( $templates_query->posts as $template_post ) {
			$template_id = $template_post->ID;

			$template_document = Plugin::$instance->documents->get( $template_id );

			$templates_manifest_data[ $template_id ] = $template_document->get_export_summary();

			$files[] = [
				'path' => 'templates/' . $template_id,
				'data' => $template_document->get_export_data(),
			];
		}

		$manifest_data['templates'] = $templates_manifest_data;

		return [
			'files' => $files,
			'manifest' => [
				$manifest_data,
			],
		];
	}
}
