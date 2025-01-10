<?php

namespace Elementor\App\Modules\ImportExport\Runners\Export;

use Elementor\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Core\Utils\ImportExport\WP_Exporter;

class Wp_Content extends Export_Runner_Base {

	public static function get_name(): string {
		return 'wp-content';
	}

	public function should_export( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'content', $data['include'], true )
		);
	}

	public function export( array $data ) {
		$post_types = ImportExportUtils::get_builtin_wp_post_types();
		$custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : array();

		$files = array();
		$manifest_data = array();

		foreach ( $post_types as $post_type ) {
			$export = $this->export_wp_post_type( $post_type );
			$files[] = $export['file'];
			$manifest_data['wp-content'][ $post_type ] = $export['manifest_data'];
		}

		foreach ( $custom_post_types as $post_type ) {
			$export = $this->export_wp_post_type( $post_type );
			$files[] = $export['file'];
			$manifest_data['wp-content'][ $post_type ] = $export['manifest_data'];

			$post_type_object = get_post_type_object( $post_type );

			$manifest_data['custom-post-type-title'][ $post_type ] = array(
				'name' => $post_type_object->name,
				'label' => $post_type_object->label,
			);
		}

		return array(
			'files' => $files,
			'manifest' => array(
				$manifest_data,
			),
		);
	}

	private function export_wp_post_type( $post_type ) {
		$wp_exporter = new WP_Exporter( array(
			'content' => $post_type,
			'status' => 'publish',
			'limit' => 20,
			'meta_query' => array(
				array(
					'key' => static::META_KEY_ELEMENTOR_EDIT_MODE,
					'compare' => 'NOT EXISTS',
				),
			),
			'include_post_featured_image_as_attachment' => true,
		) );

		$export_result = $wp_exporter->run();

		return array(
			'file' => array(
				'path' => 'wp-content/' . $post_type . '/' . $post_type . '.xml',
				'data' => $export_result['xml'],
			),
			'manifest_data' => $export_result['ids'],
		);
	}
}
