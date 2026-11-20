<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Exclusions {

	const MAX_EXCLUDED_POSTS = 5000;

	/**
	 * Keeps IDs of existing, non-trashed posts of the given types, in the requested order.
	 * Unpublished posts keep their exclusion so it still applies when they are published again.
	 *
	 * @param mixed    $ids        Incoming post IDs.
	 * @param string[] $post_types Post type slugs an excluded post may belong to.
	 * @return int[]
	 */
	public static function sanitize_ids( $ids, array $post_types ): array {
		if ( ! is_array( $ids ) || empty( $post_types ) ) {
			return [];
		}

		$requested = array_slice(
			array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) ),
			0,
			self::MAX_EXCLUDED_POSTS
		);

		if ( empty( $requested ) ) {
			return [];
		}

		return self::query_ids( [
			'post_type'      => $post_types,
			'post_status'    => 'any',
			'post__in'       => $requested,
			'orderby'        => 'post__in',
			'posts_per_page' => count( $requested ),
		] );
	}

	/**
	 * @param int[]    $ids        Excluded post IDs.
	 * @param string[] $post_types Post type slugs to count.
	 * @return array<string, int> Post type slug => number of excluded published posts.
	 */
	public static function count_published_by_post_type( array $ids, array $post_types ): array {
		$counts = array_fill_keys( $post_types, 0 );

		if ( empty( $ids ) ) {
			return $counts;
		}

		foreach ( $post_types as $post_type ) {
			$counts[ $post_type ] = count( self::query_ids( [
				'post_type'      => $post_type,
				'post_status'    => 'publish',
				'post__in'       => $ids,
				'posts_per_page' => count( $ids ),
			] ) );
		}

		return $counts;
	}

	/**
	 * @param array $args WP_Query args.
	 * @return int[]
	 */
	private static function query_ids( array $args ): array {
		$query = new \WP_Query( array_merge( $args, [
			'fields'                 => 'ids',
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
		] ) );

		return array_map( 'intval', $query->posts );
	}
}
