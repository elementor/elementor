<?php

namespace Elementor\Core\Import_Export\Directories;

use Elementor\Plugin;

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

			$manifest_data[] = [
				'id' => $template['template_id'],
				'title' => $template['title'],
				'library_type' => $template['type'],
				'thumbnail' => $template['thumbnail'],
			];
		}

		return $manifest_data;
	}
}
