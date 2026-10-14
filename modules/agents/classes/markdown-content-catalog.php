<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Content_Catalog {

	const PAGE_SIZE = 20;

	const MAX_SCANNED_PAGES = 5;

	/**
	 * Published, public, indexable posts the preview picker can show, ordered by title.
	 * An empty term puts the static front page first when it qualifies.
	 *
	 * @param string[] $post_types Post type slugs to query.
	 * @param string   $term       Title search term.
	 * @return array<int, array{id: int, title: string, path: string, type: string}>
	 */
	public function search( array $post_types, string $term ): array {
		if ( empty( $post_types ) ) {
			return [];
		}

		$front_page = '' === $term ? $this->get_front_page( $post_types ) : null;
		$items      = $front_page ? [ $this->to_item( $front_page ) ] : [];
		$exclude    = $front_page ? [ $front_page->ID ] : [];

		for ( $page = 1; $page <= self::MAX_SCANNED_PAGES; $page++ ) {
			$posts = $this->query_posts( $post_types, $term, $page, $exclude );

			foreach ( $posts as $post ) {
				if ( $this->is_listable( $post ) ) {
					$items[] = $this->to_item( $post );
				}

				if ( count( $items ) >= self::PAGE_SIZE ) {
					return $items;
				}
			}

			if ( count( $posts ) < self::PAGE_SIZE ) {
				break;
			}
		}

		return $items;
	}

	/**
	 * @param string[] $post_types
	 */
	private function get_front_page( array $post_types ): ?\WP_Post {
		if ( 'page' !== get_option( 'show_on_front' ) ) {
			return null;
		}

		$post = get_post( (int) get_option( 'page_on_front' ) );

		if ( ! ( $post instanceof \WP_Post ) || ! in_array( $post->post_type, $post_types, true ) ) {
			return null;
		}

		if ( 'publish' !== $post->post_status || '' !== $post->post_password || ! $this->is_listable( $post ) ) {
			return null;
		}

		return $post;
	}

	/**
	 * @param string[] $post_types Post type slugs to query.
	 * @param string   $term       Title search term.
	 * @param int      $page       One-based results page.
	 * @param int[]    $exclude    Post IDs already listed.
	 * @return \WP_Post[]
	 */
	private function query_posts( array $post_types, string $term, int $page, array $exclude ): array {
		$args = [
			'post_type'              => $post_types,
			'post_status'            => 'publish',
			'posts_per_page'         => self::PAGE_SIZE,
			'paged'                  => $page,
			'orderby'                => 'title',
			'order'                  => 'ASC',
			'no_found_rows'          => true,
			'update_post_term_cache' => false,
			'has_password'           => false,
			'post__not_in'           => $exclude,
		];

		if ( '' !== $term ) {
			$args['s']              = $term;
			$args['search_columns'] = [ 'post_title' ];
		}

		$query = new \WP_Query( $args );

		return array_values( array_filter(
			$query->posts,
			static fn( $post ) => $post instanceof \WP_Post
		) );
	}

	private function is_listable( \WP_Post $post ): bool {
		return is_post_publicly_viewable( $post ) && ! Post_Noindex::is_noindex( $post->ID );
	}

	/**
	 * @return array{id: int, title: string, path: string, type: string}
	 */
	private function to_item( \WP_Post $post ): array {
		return [
			'id'    => $post->ID,
			'title' => get_the_title( $post ),
			'path'  => $this->get_path( $post ),
			'type'  => $post->post_type,
		];
	}

	private function get_path( \WP_Post $post ): string {
		$permalink = get_permalink( $post );
		$path      = is_string( $permalink ) ? wp_parse_url( $permalink, PHP_URL_PATH ) : '';

		if ( is_string( $path ) && '' !== $path && '/' !== $path ) {
			return $path;
		}

		return '/' . $post->post_name;
	}
}
