<?php

namespace Elementor\App\Modules\ImportExportCustomization\Runners\Export;

use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Plugin;

class Elementor_Content extends Export_Runner_Base {
	private $page_on_front_id;

	public function __construct() {
		$this->init_page_on_front_data();
	}

	public static function get_name(): string {
		return 'elementor-content';
	}

	public function should_export( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'content', $data['include'], true )
		);
	}

	public function export( array $data ) {
		$customization = $data['customization']['content'] ?? null;
		$elementor_post_types = ImportExportUtils::get_elementor_post_types();

		$files = [];
		$manifest = [];

		foreach ( $elementor_post_types as $post_type ) {
			$export = $this->export_elementor_post_type( $post_type, $customization );
			$files = array_merge( $files, $export['files'] );

			$manifest[ $post_type ] = $export['manifest_data'];
		}

		$manifest_data['content'] = $manifest;

		return [
			'files' => $files,
			'manifest' => [
				$manifest_data,
			],
		];
	}

	private function export_elementor_post_type( $post_type, $customization ) {
		$selected_pages = $customization['pages'] ?? null;

		$manifest_data = [];
		$files = [];

		if ( is_array( $selected_pages ) && empty( $selected_pages ) ) {
			return [
				'files' => $files,
				'manifest_data' => $manifest_data,
			];
		}

		$query_args = [
			'post_type' => $post_type,
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
		];

		if ( ! is_null( $selected_pages ) && ! empty( $selected_pages ) ) {
			$query_args['post__in'] = $selected_pages;
		}

		$query = new \WP_Query( $query_args );

		if ( empty( $query ) ) {
			return [
				'files' => [],
				'manifest_data' => [],
			];
		}

		$post_type_taxonomies = $this->get_post_type_taxonomies( $post_type );

		foreach ( $query->posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );

			$terms = ! empty( $post_type_taxonomies ) ? $this->get_post_terms( $post->ID, $post_type_taxonomies ) : [];

			$post_manifest_data = [
				'title' => $post->post_title,
				'excerpt' => $post->post_excerpt,
				'doc_type' => $document->get_name(),
				'thumbnail' => get_the_post_thumbnail_url( $post ),
				'url' => get_permalink( $post ),
				'terms' => $terms,
			];

			if ( $post->ID === $this->page_on_front_id ) {
				$post_manifest_data['show_on_front'] = true;
			}

			$manifest_data[ $post->ID ] = $post_manifest_data;

			$files[] = [
				'path' => 'content/' . $post_type . '/' . $post->ID,
				'data' => $document->get_export_data(),
			];
		}

		return [
			'files' => $files,
			'manifest_data' => $manifest_data,
		];
	}

	private function get_post_type_taxonomies( $post_type ) {
		return get_object_taxonomies( $post_type );
	}

	private function get_post_terms( $post_id, array $taxonomies ) {
		$terms = wp_get_object_terms( $post_id, $taxonomies );

		$result = [];

		foreach ( $terms as $term ) {
			$result[] = [
				'term_id' => $term->term_id,
				'taxonomy' => $term->taxonomy,
				'slug' => $term->slug,
			];
		}

		return $result;
	}

	private function init_page_on_front_data() {
		$show_page_on_front = 'page' === get_option( 'show_on_front' );

		if ( $show_page_on_front ) {
			$this->page_on_front_id = (int) get_option( 'page_on_front' );
		}
	}
}
