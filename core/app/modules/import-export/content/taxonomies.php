<?php
namespace Elementor\Core\App\Modules\ImportExport\Content;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;

class Taxonomies extends Runner_Base {

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

		if ( empty( $data['manifest']['taxonomies'] ) ) {
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
		$path = $data['extracted_directory_path'] . 'taxonomies/';

		$wp_native_post_types = [ 'post', 'page', 'nav_menu_item' ];
		$selected_custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];
		$post_types = array_merge( $wp_native_post_types, $selected_custom_post_types );

		$result['taxonomies'] = [];

		$already_imported_taxonomies = [];

		foreach ( $post_types as $post_type ) {
			if ( empty( $data['manifest']['taxonomies'][ $post_type ] ) ) {
				continue;
			}

			foreach ( $data['manifest']['taxonomies'][ $post_type ] as $taxonomy ) {
				if ( array_key_exists( $taxonomy, $already_imported_taxonomies ) ) {
					$result['taxonomies'][ $post_type ][ $taxonomy ] = $already_imported_taxonomies[ $taxonomy ];
					continue;
				}

				if ( ! taxonomy_exists( $taxonomy ) ) {
					continue;
				}

				$taxonomy_data = ImportExportUtils::read_json_file( $path . $taxonomy );
				$import = $this->import_taxonomy( $taxonomy_data );
				$result['taxonomies'][ $post_type ][ $taxonomy ] = $import;
				$already_imported_taxonomies[ $taxonomy ] = $import;
			}
		}

		return $result;
	}

	private function import_taxonomy( $taxonomy_data ) {
		$terms = [];

		if ( empty( $taxonomy_data ) ) {
			return $terms;
		}

		foreach ( $taxonomy_data as $term ) {
			$old_slug = $term['slug'];
			$existed_term = term_exists( $term['slug'], $term['taxonomy'] );
			if ( $existed_term ) {
				if ( 'nav_menu' === $term['taxonomy'] ) {
					$term = $this->handle_duplicated_nav_menu_term( $term );
				} else {
					$terms[] = [
						'id' => [
							$term['term_id'] => intval( $existed_term['term_id'] ),
						],
						// Since we are not creating new term for duplicated once, the slug will be the same
						'slug' => [
							$old_slug => $term['slug'],
						],
					];
					continue;
				}
			}

			// If a term has a parent we already imported it since the terms are ordered with no child before parent.
			$parent = $term['parent'];
			if ( 0 !== $parent && ! empty( $terms[ $parent ] ) ) {
				$parent_term = term_exists( $term[ $terms[ $parent ] ], $term['taxonomy'] );

				if ( isset( $parent_term['term_id'] ) ) {
					$parent = $parent_term['term_id'];
				} else {
					$parent = 0;
				}
			} else {
				$parent = 0;
			}

			$args = [
				'slug' => $term['slug'],
				'description' => wp_slash( $term['description'] ),
				'parent' => (int) $parent,
			];

			$id = wp_insert_term( wp_slash( $term['name'] ), $term['taxonomy'], $args );
			if ( ! is_wp_error( $id ) ) {
				$terms[] = [
					'id' => [
						$term['term_id'] => $id['term_id'],
					],
					// Since we are not creating new term for duplicated once, the slug will be the same
					'slug' => [
						$old_slug => $term['slug'],
					],
				];
			}
		}

		return $terms;
	}

	private function handle_duplicated_nav_menu_term( $term ) {
		$duplicate_slug = $term['slug'] . '-duplicate';
		$duplicate_name = $term['name'] . ' duplicate';

		while ( term_exists( $duplicate_slug, 'nav_menu' ) ) {
			$duplicate_slug .= '-duplicate';
			$duplicate_name .= ' duplicate';
		}

		$term['slug'] = $duplicate_slug;
		$term['name'] = $duplicate_name;

		return $term;
	}

	public function export( $data ) {
		$wp_native_post_types = [ 'post', 'page', 'nav_menu_item' ];
		$selected_custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];
		$post_types = array_merge( $wp_native_post_types, $selected_custom_post_types );

		$export = $this->export_taxonomies( $post_types );

		$manifest_data['taxonomies'] = $export['manifest'];

		return [
			'files' => $export['files'],
			'manifest' => [
				$manifest_data,
			],
		];
	}

	private function export_taxonomies( $post_types ) {
		$files = [];
		$manifest = [];

		$taxonomies = get_taxonomies();

		foreach ( $taxonomies as $taxonomy ) {
			$taxonomy_post_types = get_taxonomy( $taxonomy )->object_type;
			$intersected_post_types = array_intersect( $taxonomy_post_types, $post_types );

			if ( empty( $intersected_post_types ) ) {
				continue;
			}

			$data = $this->export_terms( $taxonomy );

			if ( empty( $data ) ) {
				continue;
			}

			foreach ( $intersected_post_types as $post_type ) {
				$manifest[ $post_type ][] = $taxonomy;
			}

			$files[] = [
				'path' => 'taxonomies/' . $taxonomy,
				'data' => $data,
			];
		}

		return [
			'files' => $files,
			'manifest' => $manifest,
		];
	}

	private function export_terms( $taxonomy ) {
		$terms = get_terms( [
			'taxonomy' => (array) $taxonomy,
			'hide_empty' => true,
			'get' => 'all',
		] );

		$ordered_terms = [];

		// Put terms in order with no child going before its parent.
		while ( $t = array_shift( $terms ) ) {
			if ( 0 == $t->parent || isset( $ordered_terms[ $t->parent ] ) ) {
				$ordered_terms[ $t->term_id ] = $t;
			} else {
				$terms[] = $t;
			}
		}

		if ( empty( $ordered_terms ) ) {
			return [];
		}

		$data = [];
		foreach ( $ordered_terms as $term ) {
			$data[] = [
				'term_id' => $term->term_id,
				'name' => $term->name,
				'slug' => $term->slug,
				'taxonomy' => $term->taxonomy,
				'description' => $term->description,
				'parent' => $term->parent,
			];
		}

		return $data;
	}
}
