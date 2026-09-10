<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Noindex {

	/**
	 * Return true if any active SEO plugin has marked this post as noindex,
	 * or if the page/post is otherwise excluded from public indexing.
	 */
	public static function is_noindex( int $post_id ): bool {
		if ( '1' === get_post_meta( $post_id, '_yoast_wpseo_meta-robots-noindex', true ) ) {
			return true;
		}

		$rm = get_post_meta( $post_id, 'rank_math_robots', true );

		if ( is_array( $rm ) && in_array( 'noindex', $rm, true ) ) {
			return true;
		}

		if ( is_string( $rm ) && false !== strpos( $rm, 'noindex' ) ) {
			return true;
		}

		if ( '1' === (string) get_post_meta( $post_id, '_aioseo_noindex', true ) ) {
			return true;
		}

		if ( 'yes' === get_post_meta( $post_id, '_seopress_robots_index', true ) ) {
			return true;
		}

		return false;
	}
}
