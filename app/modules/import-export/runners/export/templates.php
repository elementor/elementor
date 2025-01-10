<?php

namespace Elementor\App\Modules\ImportExport\Runners\Export;

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
		$template_types = array_values( Source_Local::get_template_types() );

		$query_args = array(
			'post_type' => Source_Local::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'meta_query' => array(
				array(
					'key' => Document::TYPE_META_KEY,
					'value' => $template_types,
				),
			),
		);

		$templates_query = new \WP_Query( $query_args );

		$templates_manifest_data = array();
		$files = array();

		foreach ( $templates_query->posts as $template_post ) {
			$template_id = $template_post->ID;

			$template_document = Plugin::$instance->documents->get( $template_id );

			$templates_manifest_data[ $template_id ] = $template_document->get_export_summary();

			$files[] = array(
				'path' => 'templates/' . $template_id,
				'data' => $template_document->get_export_data(),
			);
		}

		$manifest_data['templates'] = $templates_manifest_data;

		return array(
			'files' => $files,
			'manifest' => array(
				$manifest_data,
			),
		);
	}
}
