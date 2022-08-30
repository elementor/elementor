<?php

namespace Elementor\Core\App\Modules\ImportExport\Runners;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Core\Utils\ImportExport\WP_Exporter;
use Elementor\Core\Utils\ImportExport\WP_Import;

class Wp_Content extends Runner_Base {

	public static function get_name() {
		return 'wp-content';
	}

	public function should_import( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'content', $data['include'], true ) &&
			! empty( $data['extracted_directory_path'] ) &&
			! empty( $data['manifest']['wp-content'] )
		);
	}

	public function should_export( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'content', $data['include'], true )
		);
	}

	public function import( array $data, array $imported_data ) {
		$path = $data['extracted_directory_path'] . 'wp-content/';

		$wp_builtin_post_types = ImportExportUtils::get_builtin_wp_post_types();
		$selected_custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];
		$post_types = array_merge( $wp_builtin_post_types, $selected_custom_post_types );
		$post_types = $this->force_element_to_be_last_by_value( $post_types, 'nav_menu_item' );

		$taxonomies = isset( $imported_data['taxonomies'] ) ? $imported_data['taxonomies'] : [];
		$imported_terms = ImportExportUtils::map_old_new_terms_ids( $imported_data );

		$result['wp-content'] = [];

		foreach ( $post_types as $post_type ) {
			if ( ! post_type_exists( $post_type ) ) {
				continue;
			}

			$import = $this->import_wp_post_type(
				$path,
				$post_type,
				$imported_data,
				$taxonomies,
				$imported_terms
			);

			if ( empty( $import ) ) {
				continue;
			}

			$result['wp-content'][ $post_type ] = $import;
			$imported_data = array_merge( $imported_data, $result );
		}

		return $result;
	}

	public function export( array $data ) {
		$post_types = ImportExportUtils::get_builtin_wp_post_types();
		$custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];

		$files = [];
		$manifest_data = [];

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

			$manifest_data['custom-post-type-title'][ $post_type ] = [
				'name' => $post_type_object->name,
				'label' => $post_type_object->label,
			];
		}

		return [
			'files' => $files,
			'manifest' => [
				$manifest_data,
			],
		];
	}

	private function import_wp_post_type( $path, $post_type, array $imported_data, array $taxonomies, array $imported_terms ) {
		$args = [
			'fetch_attachments' => true,
			'posts' => ImportExportUtils::map_old_new_post_ids( $imported_data ),
			'terms' => $imported_terms,
			'taxonomies' => ! empty( $taxonomies[ $post_type ] ) ? $taxonomies[ $post_type ] : [],
		];

		$file = $path . $post_type . '/' . $post_type . '.xml';

		if ( ! file_exists( $file ) ) {
			return [];
		}

		$wp_importer = new WP_Import( $file, $args );
		$result = $wp_importer->run();

		return $result['summary']['posts'];
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
			'include_post_featured_image_as_attachment' => true,
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

	/**
	 * @param $array array The array we want to relocate his element.
	 * @param $element mixed The value of the element in the array we want to shift to end of the array.
	 * @return mixed
	 */
	private function force_element_to_be_last_by_value( $array, $element ) {
		$index = array_search( $element, $array, true );

		if ( false !== $index ) {
			unset( $array[ $index ] );
			$array[] = $element;
		}

		return $array;
	}
}
