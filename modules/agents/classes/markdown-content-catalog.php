<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Modules\Agents\Markdown_Manual_Content;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Content_Catalog {

	const PAGE_SIZE = 20;

	const MAX_SCANNED_PAGES = 5;

	const EXCERPT_WORDS = 40;

	private Markdown_Manual_Content $manual_content;

	public function __construct( Markdown_Manual_Content $manual_content ) {
		$this->manual_content = $manual_content;
	}

	/**
	 * Published, public, indexable posts the preview picker can show, ordered by title.
	 * An empty term puts the static front page first when it qualifies.
	 *
	 * @param string[] $post_types        Post type slugs to query.
	 * @param string   $term              Title search term.
	 * @param int[]    $excluded_post_ids Posts to leave out.
	 * @return array<int, array{id: int, title: string, path: string, type: string, isOverridden: bool}>
	 */
	public function search( array $post_types, string $term, array $excluded_post_ids = [] ): array {
		if ( empty( $post_types ) ) {
			return [];
		}

		$front_page = '' === $term ? $this->get_front_page( $post_types ) : null;

		if ( $front_page && in_array( $front_page->ID, $excluded_post_ids, true ) ) {
			$front_page = null;
		}

		$exclude = $front_page ? array_merge( $excluded_post_ids, [ $front_page->ID ] ) : $excluded_post_ids;
		$posts   = $this->collect_posts(
			$post_types,
			$term,
			$front_page ? [ $front_page ] : [],
			$exclude,
			self::PAGE_SIZE,
			[ 'search_columns' => [ 'post_title' ] ]
		);

		return array_map( [ $this, 'to_item' ], $posts );
	}

	/**
	 * Published, public, indexable posts matching the term anywhere in their content, best match first.
	 *
	 * @param string[] $post_types        Post type slugs to query.
	 * @param string   $term              Search term.
	 * @param int      $limit             Maximum number of items.
	 * @param int[]    $excluded_post_ids Posts to leave out.
	 * @return array<int, array{id: int, title: string, url: string, type: string, date: string, excerpt: string}>
	 */
	public function search_content( array $post_types, string $term, int $limit, array $excluded_post_ids = [] ): array {
		if ( empty( $post_types ) ) {
			return [];
		}

		$posts = $this->collect_posts( $post_types, $term, [], $excluded_post_ids, $limit, [ 'orderby' => 'relevance' ] );

		return array_map( [ $this, 'to_content_item' ], $posts );
	}

	/**
	 * One page of published, public, indexable posts of a single type, ordered by title.
	 *
	 * @param string $post_type Post type slug.
	 * @param string $term      Title search term.
	 * @param int    $page      One-based results page.
	 * @param int[]  $pinned_post_ids Posts listed ahead of the rest, on the first page only.
	 * @return array{items: array<int, array{id: int, title: string, url: string}>, hasMore: bool}
	 */
	public function list_page( string $post_type, string $term, int $page, array $pinned_post_ids = [] ): array {
		$overrides = [ 'search_columns' => [ 'post_title' ] ];
		$posts     = $this->query_posts( [ $post_type ], $term, $page, $pinned_post_ids, $overrides );
		$pinned    = 1 === $page ? $this->query_pinned_posts( $post_type, $term, $pinned_post_ids, $overrides ) : [];

		return [
			'items'   => array_values( array_map(
				[ $this, 'to_list_item' ],
				array_filter( array_merge( $pinned, $posts ), [ $this, 'is_listable' ] )
			) ),
			'hasMore' => count( $posts ) >= self::PAGE_SIZE,
		];
	}

	/**
	 * @param string $post_type
	 * @param string $term
	 * @param int[]  $pinned_post_ids
	 * @param array  $overrides
	 * @return \WP_Post[]
	 */
	private function query_pinned_posts( string $post_type, string $term, array $pinned_post_ids, array $overrides ): array {
		if ( empty( $pinned_post_ids ) ) {
			return [];
		}

		return $this->query_posts( [ $post_type ], $term, 1, [], array_merge( $overrides, [
			'post__in'       => $pinned_post_ids,
			'posts_per_page' => count( $pinned_post_ids ),
		] ) );
	}

	/**
	 * @param string[]   $post_types
	 * @param string     $term
	 * @param \WP_Post[] $found      Posts already collected, counted towards the limit.
	 * @param int[]      $exclude
	 * @param int        $limit
	 * @param array      $overrides  WP_Query args that replace the defaults.
	 * @return \WP_Post[]
	 */
	private function collect_posts( array $post_types, string $term, array $found, array $exclude, int $limit, array $overrides ): array {
		for ( $page = 1; $page <= self::MAX_SCANNED_PAGES; $page++ ) {
			$posts = $this->query_posts( $post_types, $term, $page, $exclude, $overrides );

			foreach ( $posts as $post ) {
				if ( $this->is_listable( $post ) ) {
					$found[] = $post;
				}

				if ( count( $found ) >= $limit ) {
					return $found;
				}
			}

			if ( count( $posts ) < self::PAGE_SIZE ) {
				break;
			}
		}

		return $found;
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
	 * @param array    $overrides  WP_Query args that replace the defaults.
	 * @return \WP_Post[]
	 */
	private function query_posts( array $post_types, string $term, int $page, array $exclude, array $overrides = [] ): array {
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
			$args['s'] = $term;
		}

		$query = new \WP_Query( array_merge( $args, $overrides ) );

		return array_values( array_filter(
			$query->posts,
			static fn( $post ) => $post instanceof \WP_Post
		) );
	}

	private function is_listable( \WP_Post $post ): bool {
		return is_post_publicly_viewable( $post ) && ! Post_Noindex::is_noindex( $post->ID );
	}

	/**
	 * @return array{id: int, title: string, path: string, type: string, isOverridden: bool}
	 */
	private function to_item( \WP_Post $post ): array {
		return [
			'id'           => $post->ID,
			'title'        => Post_Title::to_plain_text( get_the_title( $post ) ),
			'path'         => $this->get_path( $post ),
			'type'         => $post->post_type,
			'isOverridden' => $this->manual_content->has_override( $post->ID ),
		];
	}

	/**
	 * @return array{id: int, title: string, url: string}
	 */
	private function to_list_item( \WP_Post $post ): array {
		return [
			'id'    => $post->ID,
			'title' => Post_Title::to_plain_text( get_the_title( $post ) ),
			'url'   => (string) get_permalink( $post ),
		];
	}

	/**
	 * @return array{id: int, title: string, url: string, type: string, date: string, excerpt: string}
	 */
	private function to_content_item( \WP_Post $post ): array {
		return [
			'id'      => $post->ID,
			'title'   => Post_Title::to_plain_text( get_the_title( $post ) ),
			'url'     => (string) get_permalink( $post ),
			'type'    => $post->post_type,
			'date'    => get_the_date( 'c', $post ),
			'excerpt' => $this->get_excerpt( $post ),
		];
	}

	private function get_excerpt( \WP_Post $post ): string {
		$source = '' !== $post->post_excerpt ? $post->post_excerpt : strip_shortcodes( $post->post_content );

		return wp_trim_words( wp_strip_all_tags( $source ), self::EXCERPT_WORDS );
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
