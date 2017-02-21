<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Utils {

	public static function is_ajax() {
		return ( defined( 'DOING_AJAX' ) && DOING_AJAX );
	}

	public static function is_script_debug() {
		return ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG );
	}

	public static function get_edit_link( $post_id = 0 ) {
		return apply_filters( 'elementor/utils/get_edit_link', add_query_arg( 'elementor', '', get_permalink( $post_id ) ), $post_id );
	}

	public static function is_post_type_support( $post_id = 0 ) {
		$post_type = get_post_type( $post_id );
		$is_supported = post_type_supports( $post_type, 'elementor' );

		return apply_filters( 'elementor/utils/is_post_type_support', $is_supported, $post_id, $post_type );
	}

	public static function get_placeholder_image_src() {
		return apply_filters( 'elementor/utils/get_placeholder_image_src', ELEMENTOR_ASSETS_URL . 'images/placeholder.png' );
	}

	public static function generate_random_string( $length = 7 ) {
		$salt = 'abcdefghijklmnopqrstuvwxyz';
		return substr( str_shuffle( str_repeat( $salt, $length ) ), 0, $length );
	}

	public static function get_youtube_id_from_url( $url ) {
		preg_match( '/^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?vi?=|(?:embed|v|vi|user)\/))([^\?&\"\'>]+)/', $url, $video_id_parts );

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

	public static function get_timezone_string() {
		$current_offset = (float) get_option( 'gmt_offset' );
		$timezone_string = get_option( 'timezone_string' );

		// Create a UTC+- zone if no timezone string exists
		if ( empty( $timezone_string ) ) {
			if ( 0 === $current_offset ) {
				$timezone_string = 'UTC+0';
			} elseif ( $current_offset < 0 ) {
				$timezone_string = 'UTC' . $current_offset;
			} else {
				$timezone_string = 'UTC+' . $current_offset;
			}
		}

		return $timezone_string;
	}

	public static function do_action_deprecated( $tag, $args, $version, $replacement = false, $message = null ) {
		if ( function_exists( 'do_action_deprecated' ) ) { /* WP >= 4.6 */
			do_action_deprecated( $tag, $args, $version, $replacement, $message );
		} else {
			do_action_ref_array( $tag, $args );
		}
	}

	public static function apply_filters_deprecated( $tag, $args, $version, $replacement = false, $message = null ) {
		if ( function_exists( 'apply_filters_deprecated' ) ) { /* WP >= 4.6 */
			return apply_filters_deprecated( $tag, $args, $version, $replacement, $message );
		} else {
			return apply_filters_ref_array( $tag, $args );
		}
	}
}
