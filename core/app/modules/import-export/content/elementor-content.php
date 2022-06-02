<?php

namespace Elementor\Core\App\Modules\ImportExport\Content;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Plugin;

class Elementor_Content extends Runner_Base {

	private $show_page_on_front;

	private $page_on_front_id;

	public function __constructor() {
		$this->init_page_on_front_data();
	}

	public function should_import( $data ) {
		if ( ! isset( $data['include'] ) ) {
			return false;
		}

		if ( ! in_array( 'content', $data['include'], true ) ) {
			return false;
		}

		if ( ! is_array( $data['manifest']['content'] ) ) {
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
		$result['content'] = [];

		$elementor_post_types = [ 'post', 'page', 'e_landing_page' ];

		foreach ( $elementor_post_types as $post_type ) {
			if ( empty( $data['manifest']['content'][ $post_type ] ) ) {
				continue;
			}

			$posts_settings = $data['manifest']['content'][ $post_type ];
			$path = $data['extracted_directory_path'] . 'content/' . $post_type . '/';
			$imported_terms = ! empty( $imported_data['taxonomies'] )
				? ImportExportUtils::map_old_new_terms_ids( $imported_data['taxonomies'] )
				: [];

			$result['content'][ $post_type ] = $this->import_elementor_post_type( $posts_settings, $path, $post_type, $imported_terms );
		}
		return $result;
	}


	private function import_elementor_post_type( $posts_settings, $path, $post_type, $imported_terms ) {
		$result = [
			'succeed' => [],
			'failed' => [],
		];

		foreach ( $posts_settings as $id => $post_settings ) {
			try {
				$post_data = ImportExportUtils::read_json_file( $path . $id );
				$import = $this->import_post( $post_settings, $post_data, $post_type, $imported_terms );

				if ( is_wp_error( $import ) ) {
					$result['failed'][ $id ] = $import->get_error_message();
					continue;
				}

				$result['succeed'][ $id ] = $import;
			} catch ( \Exception $error ) {
				$result['failed'][ $id ] = $error->getMessage();
			}
		}

		return $result;
	}


	public function import_post( array $post_settings, $post_data, $post_type, $imported_terms ) {
		$post_attributes = [
			'post_title' => $post_settings['title'],
			'post_type' => $post_type,
			'post_status' => 'publish',
		];

		if ( ! empty( $post_settings['excerpt'] ) ) {
			$post_attributes['post_excerpt'] = $post_settings['excerpt'];
		}

		$new_document = Plugin::$instance->documents->create(
			$post_settings['doc_type'],
			$post_attributes
		);

		if ( is_wp_error( $new_document ) ) {
			return $new_document;
		}

		$post_data['import_settings'] = $post_settings;

		$new_document->import( $post_data );

		$new_id = $new_document->get_main_id();

		if ( ! empty( $post_settings['terms'] ) ) {
			foreach ( $post_settings['terms'] as $term ) {
				if ( ! isset( $imported_terms[ $term['term_id'] ] ) ) {
					continue;
				}
				wp_set_post_terms( $new_id, array( (int) $imported_terms[ $term['term_id'] ] ), $term['taxonomy'], false );
			}
		}

		if ( ! empty( $post_settings['show_on_front'] ) ) {
			update_option( 'page_on_front', $new_id );

			if ( ! $this->show_page_on_front ) {
				update_option( 'show_on_front', 'page' );
			}
		}

		return $new_id;
	}

	public function export( $data ) {
		$elementor_post_types = [ 'post', 'page', 'e-landing-page' ];

		$files = [];
		$manifest = [];

		foreach ( $elementor_post_types as $post_type ) {
			$export = $this->export_elementor_post_type( $post_type );
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

	private function export_elementor_post_type( $post_type ) {
		$query_args = [
			'post_type' => $post_type,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'meta_query' => [
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

		$query = new \WP_Query( $query_args );

		if ( empty( $query ) ) {
			return [
				'files' => [],
				'manifest_data' => [],
			];
		}

		$post_type_taxonomies = $this->get_post_type_taxonomies( $post_type );

		$manifest_data = [];
		$files = [];

		foreach ( $query->posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );

			if ( ! empty( $post_type_taxonomies ) ) {
				$terms = $this->get_post_terms( $post->ID, $post_type_taxonomies );
			} else {
				$terms = [];
			}

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

	/**
	 *  Helpers
	 */

	private function get_post_type_taxonomies( $post_type ) {
		$taxonomies = get_object_taxonomies( $post_type );

		if ( empty( $taxonomies ) ) {
			return [];
		}

		return $taxonomies;
	}

	private function get_post_terms( $post_id, $taxonomies ) {
		$terms = wp_get_object_terms( $post_id, $taxonomies );

		if ( empty( $terms ) ) {
			return [];
		}

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
		$this->show_page_on_front = 'page' === get_option( 'show_on_front' );

		if ( $this->show_page_on_front ) {
			$this->page_on_front_id = (int) get_option( 'page_on_front' );
		}
	}
}
