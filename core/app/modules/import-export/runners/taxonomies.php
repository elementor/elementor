<?php
namespace Elementor\Core\App\Modules\ImportExport\Runners;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;

class Taxonomies extends Runner_Base {

	public static function get_name() {
		return 'taxonomies';
	}

	public function should_import( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'content', $data['include'], true ) &&
			! empty( $data['extracted_directory_path'] ) &&
			! empty( $data['manifest']['taxonomies'] )
		);
	}

	public function should_export( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'content', $data['include'], true )
		);
	}

	public function import( array $data, array $imported_data ) {
		$path = $data['extracted_directory_path'] . 'taxonomies/';

		$wp_builtin_post_types = ImportExportUtils::get_builtin_wp_post_types();
		$selected_custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];
		$post_types = array_merge( $wp_builtin_post_types, $selected_custom_post_types );

		$result = [];

		foreach ( $post_types as $post_type ) {
			if ( empty( $data['manifest']['taxonomies'][ $post_type ] ) ) {
				continue;
			}

			$result['taxonomies'][ $post_type ] = $this->import_taxonomies( $data['manifest']['taxonomies'][ $post_type ], $path );
		}

		return $result;
	}

	public function export( array $data ) {
		$wp_builtin_post_types = ImportExportUtils::get_builtin_wp_post_types();
		$selected_custom_post_types = isset( $data['selected_custom_post_types'] ) ? $data['selected_custom_post_types'] : [];
		$post_types = array_merge( $wp_builtin_post_types, $selected_custom_post_types );

		$export = $this->export_taxonomies( $post_types );

		$manifest_data['taxonomies'] = $export['manifest'];

		return [
			'files' => $export['files'],
			'manifest' => [
				$manifest_data,
			],
		];
	}

	private function import_taxonomies( array $taxonomies, $path ) {
		$result = [];
		$imported_taxonomies = [];

		foreach ( $taxonomies as $taxonomy ) {
			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			if ( ! empty( $imported_taxonomies[ $taxonomy ] ) ) {
				$result[ $taxonomy ] = $imported_taxonomies[ $taxonomy ];
				continue;
			}

			$taxonomy_data = ImportExportUtils::read_json_file( $path . $taxonomy );
			if ( empty( $taxonomy_data ) ) {
				continue;
			}

			$import = $this->import_taxonomy( $taxonomy_data );
			$result[ $taxonomy ] = $import;
			$imported_taxonomies[ $taxonomy ] = $import;
		}

		return $result;
	}

	private function import_taxonomy( array $taxonomy_data ) {
		$terms = [];

		foreach ( $taxonomy_data as $term ) {
			$old_slug = $term['slug'];

			$existing_term = term_exists( $term['slug'], $term['taxonomy'] );
			if ( $existing_term ) {
				if ( 'nav_menu' === $term['taxonomy'] ) {
					$term = $this->handle_duplicated_nav_menu_term( $term );
				} else {
					$terms[] = [
						'old_id' => (int) $term['term_id'],
						'new_id' => (int) $existing_term['term_id'],
						'old_slug' => $old_slug,
						'new_slug' => $term['slug'],
					];
					continue;
				}
			}

			$parent = $this->get_term_parent( $term, $terms );

			$args = [
				'slug' => $term['slug'],
				'description' => wp_slash( $term['description'] ),
				'parent' => (int) $parent,
			];

			$new_term = wp_insert_term( wp_slash( $term['name'] ), $term['taxonomy'], $args );
			if ( ! is_wp_error( $new_term ) ) {
				$terms[] = [
					'old_id' => $term['term_id'],
					'new_id' => (int) $new_term['term_id'],
					'old_slug' => $old_slug,
					'new_slug' => $term['slug'],
				];
			}
		}

		return $terms;
	}

	private function handle_duplicated_nav_menu_term( $term ) {
		do {
			$term['slug'] = $term['slug'] . '-duplicate';
			$term['name'] = $term['name'] . ' duplicate';
		} while ( term_exists( $term['slug'], 'nav_menu' ) );

		return $term;
	}

	private function get_term_parent( $term, array $imported_terms ) {
		$parent = $term['parent'];
		if ( 0 !== $parent && ! empty( $imported_terms[ $parent ] ) ) {
			$parent_term = term_exists( $term[ $imported_terms[ $parent ]['new_id'] ], $term['taxonomy'] );

			if ( isset( $parent_term['term_id'] ) ) {
				return $parent_term['term_id'];
			}
		}

		return 0;
	}

	private function export_taxonomies( array $post_types ) {
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

		$ordered_terms = $this->order_terms( $terms );

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

	// Put terms in order with no child going before its parent.
	private function order_terms( array $terms ) {
		$ordered_terms = [];

		while ( $term = array_shift( $terms ) ) {
			$is_top_level = 0 === $term->parent;
			$is_parent_exits = isset( $ordered_terms[ $term->parent ] );

			if ( $is_top_level || $is_parent_exits ) {
				$ordered_terms[ $term->term_id ] = $term;
			} else {
				$terms[] = $term;
			}
		}

		return $ordered_terms;
	}
}
