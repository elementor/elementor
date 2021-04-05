<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Templates extends Base {

	protected function get_name() {
		return 'templates';
	}

	protected function export() {
		$template_local_source = Plugin::$instance->templates_manager->get_source( 'local' );

		$templates = $template_local_source->get_items();

		$manifest_data = [];

		foreach ( $templates as $template ) {
			$template_document = Plugin::$instance->documents->get( $template['template_id'] );

			$template_export_data = $template_document->get_export_data();

			$this->exporter->add_json_file( $template['template_id'], $template_export_data );

			$manifest_data[ $template['template_id'] ] = [
				'title' => $template['title'],
				'doc_type' => $template_document->get_name(),
				'thumbnail' => $template['thumbnail'],
			];
		}

		return $manifest_data;
	}

	protected function import( array $import_settings ) {
		$result = [
			'success' => [],
			'failed' => [],
		];

		foreach ( $import_settings as $id => $template_settings ) {
			try {
				$import = $this->import_template( $id, $template_settings );

				if ( is_wp_error( $import ) ) {
					$result['failed'][ $id ] = $import->get_error_message();

					continue;
				}

				$result['success'][] = $import;
			} catch ( \Error $error ) {
				$result['failed'][ $id ] = $error->getMessage();
			}
		}

		return $result;
	}

	private function import_template( $id, array $template_settings ) {
		$template = $this->importer->read_json_file( $id );

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
			return $new_document;
		}

		$new_document->import( $template );

		return $new_document->get_main_id();
	}
}
