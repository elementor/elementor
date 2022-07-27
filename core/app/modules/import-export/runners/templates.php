<?php

namespace Elementor\Core\App\Modules\ImportExport\Runners;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Core\Base\Document;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

// TODO: Move to Pro.
class Templates extends Runner_Base {

	public static function get_name() {
		return 'templates';
	}

	public function should_import( array $data ) {
		return (
			Utils::has_pro() &&
			isset( $data['include'] ) &&
			in_array( 'templates', $data['include'], true ) &&
			! empty( $data['extracted_directory_path'] ) &&
			! empty( $data['manifest']['templates'] )
		);
	}

	public function should_export( array $data ) {
		return (
			Utils::has_pro() &&
			isset( $data['include'] ) &&
			in_array( 'templates', $data['include'], true )
		);
	}


	public function import( array $data, array $imported_data ) {
		$path = $data['extracted_directory_path'] . 'templates/';
		$templates = $data['manifest']['templates'];

		$result['templates'] = [
			'succeed' => [],
			'failed' => [],
		];

		foreach ( $templates as $id => $template_settings ) {
			try {
				$template_data = ImportExportUtils::read_json_file( $path . $id );
				$import = $this->import_template( $id, $template_settings, $template_data );

				$result['templates']['succeed'][ $id ] = $import;
			} catch ( \Exception $error ) {
				$result['templates']['failed'][ $id ] = $error->getMessage();
			}
		}

		return $result;
	}

	private function import_template( $id, array $template_settings, array $template_data ) {
		$doc_type = $template_settings['doc_type'];

		$new_document = Plugin::$instance->documents->create(
			$doc_type,
			[
				'post_title' => $template_settings['title'],
				'post_type' => Source_Local::CPT,
				'post_status' => 'publish',
			]
		);

		if ( is_wp_error( $new_document ) ) {
			throw new \Exception( $new_document->get_error_message() );
		}

		$template_data['import_settings'] = $template_settings;
		$template_data['id'] = $id;

		$new_document->import( $template_data );

		return $new_document->get_main_id();
	}

	public function export( array $data ) {
		$template_types = array_values( Source_Local::get_template_types() );

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
