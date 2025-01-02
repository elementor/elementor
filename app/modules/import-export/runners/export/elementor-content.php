<?php

namespace Elementor\App\Modules\ImportExport\Runners\Export;

use Elementor\App\Modules\ImportExport\Utils as ImportExportUtils;
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
		$elementor_post_types = ImportExportUtils::get_elementor_post_types();

		$files = array();
		$manifest = array();

		foreach ( $elementor_post_types as $post_type ) {
			$export = $this->export_elementor_post_type( $post_type );
			$files = array_merge( $files, $export['files'] );

			$manifest[ $post_type ] = $export['manifest_data'];
		}

		$manifest_data['content'] = $manifest;

		return array(
			'files' => $files,
			'manifest' => array(
				$manifest_data,
			),
		);
	}

	private function export_elementor_post_type( $post_type ) {
		$query_args = array(
			'post_type' => $post_type,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'meta_query' => array(
				array(
					'key' => static::META_KEY_ELEMENTOR_EDIT_MODE,
					'compare' => 'EXISTS',
				),
				array(
					'key' => '_elementor_data',
					'compare' => 'EXISTS',
				),
				array(
					'key' => '_elementor_data',
					'compare' => '!=',
					'value' => '[]',
				),
			),
		);

		$query = new \WP_Query( $query_args );

		if ( empty( $query ) ) {
			return array(
				'files' => array(),
				'manifest_data' => array(),
			);
		}

		$post_type_taxonomies = $this->get_post_type_taxonomies( $post_type );

		$manifest_data = array();
		$files = array();

		foreach ( $query->posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );

			$terms = ! empty( $post_type_taxonomies ) ? $this->get_post_terms( $post->ID, $post_type_taxonomies ) : array();

			$post_manifest_data = array(
				'title' => $post->post_title,
				'excerpt' => $post->post_excerpt,
				'doc_type' => $document->get_name(),
				'thumbnail' => get_the_post_thumbnail_url( $post ),
				'url' => get_permalink( $post ),
				'terms' => $terms,
			);

			if ( $post->ID === $this->page_on_front_id ) {
				$post_manifest_data['show_on_front'] = true;
			}

			$manifest_data[ $post->ID ] = $post_manifest_data;

			$files[] = array(
				'path' => 'content/' . $post_type . '/' . $post->ID,
				'data' => $document->get_export_data(),
			);
		}

		return array(
			'files' => $files,
			'manifest_data' => $manifest_data,
		);
	}

	private function get_post_type_taxonomies( $post_type ) {
		return get_object_taxonomies( $post_type );
	}

	private function get_post_terms( $post_id, array $taxonomies ) {
		$terms = wp_get_object_terms( $post_id, $taxonomies );

		$result = array();

		foreach ( $terms as $term ) {
			$result[] = array(
				'term_id' => $term->term_id,
				'taxonomy' => $term->taxonomy,
				'slug' => $term->slug,
			);
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
