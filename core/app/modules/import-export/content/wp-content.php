<?php

namespace Elementor\Core\App\Modules\ImportExport\Content;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Core\Utils\ImportExport\WP_Exporter;
use Elementor\Core\Utils\ImportExport\WP_Import;

class Wp_Content extends Runner_Base {
	public function should_import( $data ) {
		if ( ! isset( $data['include'] ) ) {
			return false;
		}

		if ( ! in_array( 'content', $data['include'], true ) ) {
			return false;
		}

		if ( empty( $data['extracted_directory_path'] ) ) {
			return false;
		}

		return true;
	}

	public function should_export( $data ) {
		if ( ! isset( $data['include'] ) ) {
			return false;
		}

		if ( ! in_array( 'content', $data['include'], true ) ) {
			return false;
		}

		return true;
	}

	public function import( $data, $imported_data ) {
		$path = $data['extracted_directory_path'] . 'wp-content/';

		$wp_native_post_types = [ 'post', 'page' ];
		$selected_custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];
		$post_types = array_merge( $wp_native_post_types, $selected_custom_post_types );
		$post_types[] = 'nav_menu_item';

		$taxonomies = ! empty( $imported_data['taxonomies'] ) ? $imported_data['taxonomies'] : [];
		$terms = ImportExportUtils::map_old_new_terms_ids( $taxonomies );

		$result['wp-content'] = [];
		foreach ( $post_types as $post_type ) {
			$import = $this->import_wp_post_type( $path, $post_type, $imported_data, $taxonomies, $terms );
			$result['wp-content'][ $post_type ] = $import;
			$imported_data = array_merge( $imported_data, $result );
		}

		return $result;
	}

	private function import_wp_post_type( $path, $post_type, $imported_data, $taxonomies, $terms ) {
		if ( ! post_type_exists( $post_type ) ) {
			return [];
		}

		$args = [
			'fetch_attachments' => true,
			'posts' => ImportExportUtils::map_old_new_post_ids( $imported_data ),
			'terms' => $terms,
			'taxonomies' => ! empty( $taxonomies[ $post_type ] ) ? $taxonomies[ $post_type ] : [],
		];

		$wp_importer = new WP_Import( $path . $post_type . '/' . $post_type . '.xml', $args );
		$result = $wp_importer->run();

		return $result['summary']['posts'];
	}

	public function export( $data ) {
		$custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];
		$post_types = [ 'post', 'page', 'nav_menu_item' ];

		$files = [];
		$manifest_data = [];

		foreach ( $post_types as $post_type ) {
			$export = $this->export_wp_post_type( $post_type );
			$files[] = $export['file'];
			$manifest_data['wp-content'][ $post_type ] = $export['manifest_data'];
		}

		if ( ! empty( $custom_post_types ) ) {
			foreach ( $custom_post_types as $post_type ) {
				$export = $this->export_wp_post_type( $post_type );
				$files[] = $export['file'];
				$manifest_data['wp-content'][ $post_type ] = $export['manifest_data'];

				$post_type_object = get_post_type_object( $post_type );

				$manifest_data['custom-post-type-title'][ $post_type ] = [
					'name' => $post_type_object->name,
					'label' => $post_type_object->label,
				];
			}
		}

		return [
			'files' => $files,
			'manifest' => [
				$manifest_data,
			],
		];
	}

	private function export_wp_post_type( $post_type ) {
		$wp_exporter = new WP_Exporter( [
			'content' => $post_type,
			'status' => 'publish',
			'limit' => 20,
			'meta_query' => [
				[
					'key' => '_elementor_edit_mode',
					'compare' => 'NOT EXISTS',
				],
			],
			'include_post_featured_image_as_attachment' => true, // Will export 'featured_image' as attachment.
		] );

		$export_result = $wp_exporter->run();

		return [
			'file' => [
				'path' => 'wp-content/' . $post_type . '/' . $post_type . '.xml',
				'data' => $export_result['xml'],
			],
			'manifest_data' => $export_result['ids'],
		];
	}
}
