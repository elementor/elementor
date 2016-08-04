<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Utils {

	public static function is_development_mode() {
		return apply_filters( 'elementor/utils/is_development_mode', false );
	}

	public static function get_edit_link( $post_id = 0 ) {
		return apply_filters( 'elementor/utils/get_edit_link', add_query_arg( 'elementor', '', get_permalink( $post_id ) ), $post_id );
	}

	public static function is_post_type_support( $post_id = 0 ) {
		return post_type_supports( get_post_type( $post_id ), 'elementor' );
	}

	public static function get_placeholder_image_src() {
		return apply_filters( 'elementor/utils/get_placeholder_image_src', ELEMENTOR_ASSETS_URL . 'images/placeholder.png' );
	}

	public static function generate_random_string( $length = 7 ) {
		$salt = 'abcdefghijklmnopqrstuvwxyz';
		return substr( str_shuffle( str_repeat( $salt, $length ) ), 0, $length );
	}

	public static function get_youtube_id_from_url( $url ) {
		preg_match( '/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/', $url, $video_id_parts );

		if ( empty( $video_id_parts[1] ) ) {
			return false;
		}

		return $video_id_parts[1];
	}

	/**
	 * Tell to WP Cache plugins do not cache this request.
	 *
	 * @return void
	 */
	public static function do_not_cache() {
		if ( ! defined( 'DONOTCACHEPAGE' ) )
			define( 'DONOTCACHEPAGE', true );

		if ( ! defined( 'DONOTCACHEDB' ) )
			define( 'DONOTCACHEDB', true );

		if ( ! defined( 'DONOTMINIFY' ) )
			define( 'DONOTMINIFY', true );

		if ( ! defined( 'DONOTCDN' ) )
			define( 'DONOTCDN', true );

		if ( ! defined( 'DONOTCACHCEOBJECT' ) )
			define( 'DONOTCACHCEOBJECT', true );

		// Set the headers to prevent caching for the different browsers
		nocache_headers();
	}
}
