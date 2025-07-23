<?php

namespace Elementor\App\Modules\ImportExportCustomization\Runners\Export;

use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
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
		$customization = $data['customization']['content'] ?? null;
		$include_menus = $customization['menus'] ?? true;
		$exclude_post_types = [];

		if ( ! $include_menus ) {
			$exclude_post_types[] = 'nav_menu_item';
		}

		if ( isset( $data['selected_custom_post_types'] ) && ! in_array( 'post', $data['selected_custom_post_types'], true ) ) {
			$exclude_post_types[] = 'post';
		}

		$post_types = ImportExportUtils::get_builtin_wp_post_types( $exclude_post_types );
		$custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];

		$files = [];
		$manifest_data = [];

		foreach ( $post_types as $post_type ) {
			$export = $this->export_wp_post_type( $post_type, $customization );

			if ( ! empty( $export['file'] ) ) {
				$files[] = $export['file'];
			}

			$manifest_data['wp-content'][ $post_type ] = $export['manifest_data'];
		}

		foreach ( $custom_post_types as $post_type ) {
			// handled in the previous loop
			if ( 'post' === $post_type ) {
				continue;
			}
			$export = $this->export_wp_post_type( $post_type, $customization );

			if ( ! empty( $export['file'] ) ) {
				$files[] = $export['file'];
			}

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

	private function export_wp_post_type( $post_type, $customization ) {
		$selected_pages = $customization['pages'] ?? null;

		if ( null !== $selected_pages && empty( $selected_pages ) ) {
			return [
				'file' => [],
				'manifest_data' => [],
			];
		}

		$exporter_args = [
			'content' => $post_type,
			'status' => 'publish',
			'limit' => 20,
			'meta_query' => [
				[
					'key' => static::META_KEY_ELEMENTOR_EDIT_MODE,
					'compare' => 'NOT EXISTS',
				],
			],
			'include_post_featured_image_as_attachment' => true,
		];

		if ( ! empty( $selected_pages ) ) {
			$exporter_args['include'] = $selected_pages;
		}

		$wp_exporter = new WP_Exporter( $exporter_args );

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
