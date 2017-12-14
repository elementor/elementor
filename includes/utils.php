<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Utils.
 *
 * Elementor utils handler class.
 *
 * @since 1.0.0
 */
class Utils {

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function is_ajax() {
		// TODO: When minimum required version will be 4.7, use `wp_doing_ajax()`.
		return defined( 'DOING_AJAX' ) && DOING_AJAX;
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function is_script_debug() {
		return defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG;
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function get_edit_link( $post_id = 0 ) {
		$edit_link = add_query_arg( [ 'post' => $post_id, 'action' => 'elementor' ], admin_url( 'post.php' ) );

		/**
		 * Filters the Elementor edit link.
		 *
		 * @since 1.0.0
		 *
		 * @param string $edit_link New URL query string (unescaped).
		 * @param int    $post_id   Post ID.
		 */
		$edit_link = apply_filters( 'elementor/utils/get_edit_link', $edit_link, $post_id );

		return $edit_link;
	}

	/**
	 * @static
	 * @since 1.7.0
	 * @access public
	*/
	public static function get_pro_link( $link ) {
		static $theme_name = false;

		if ( ! $theme_name ) {
			$theme_obj = wp_get_theme();
			if ( $theme_obj->parent() ) {
				$theme_name = $theme_obj->parent()->get( 'Name' );
			} else {
				$theme_name = $theme_obj->get( 'Name' );
			}

			$theme_name = sanitize_key( $theme_name );
		}

		$link = add_query_arg( 'utm_term', $theme_name, $link );

		if ( defined( 'ELEMENTOR_PARTNER_ID' ) ) {
			$link = add_query_arg( 'partner_id', sanitize_key( ELEMENTOR_PARTNER_ID ), $link );
		}

		return $link;
	}

	/**
	 * @static
	 * @since 1.6.4
	 * @access public
	*/
	public static function get_preview_url( $post_id ) {
		$preview_url = set_url_scheme( add_query_arg( 'elementor-preview', '', get_permalink( $post_id ) ) );

		/**
		 * Filters the Elementor preview URL.
		 *
		 * @since 1.6.4
		 *
		 * @param string $preview_url URL with chosen scheme.
		 * @param int    $post_id     Post ID.
		 */
		$preview_url = apply_filters( 'elementor/utils/preview_url', $preview_url, $post_id );

		return $preview_url;
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function is_post_type_support( $post_id = 0 ) {
		$post_type = get_post_type( $post_id );
		$is_supported = post_type_supports( $post_type, 'elementor' );

		/**
		 * Filters whether the post type supports editing with Elementor.
		 *
		 * @since 1.0.0
		 *
		 * @param bool   $is_supported Whether the post type supports editing with Elementor.
		 * @param int    $post_id      Post ID.
		 * @param string $post_type    Post type.
		 */
		$is_supported = apply_filters( 'elementor/utils/is_post_type_support', $is_supported, $post_id, $post_type );

		return $is_supported;
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function get_placeholder_image_src() {
		$placeholder_image = ELEMENTOR_ASSETS_URL . 'images/placeholder.png';

		/**
		 * Filters the source of the default placeholder image used by Elementor.
		 *
		 * @since 1.0.0
		 *
		 * @param string $placeholder_image The source of the default placeholder image.
		 */
		$placeholder_image = apply_filters( 'elementor/utils/get_placeholder_image_src', $placeholder_image );

		return $placeholder_image;
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function generate_random_string() {
		return dechex( rand() );
	}

	/**
	 * Tell to WP Cache plugins do not cache this request.
	 *
	 * @static
	 * @since 1.0.0
	 * @access public
	 * @return void
	 */
	public static function do_not_cache() {
		if ( ! defined( 'DONOTCACHEPAGE' ) ) {
			define( 'DONOTCACHEPAGE', true );
		}

		if ( ! defined( 'DONOTCACHEDB' ) ) {
			define( 'DONOTCACHEDB', true );
		}

		if ( ! defined( 'DONOTMINIFY' ) ) {
			define( 'DONOTMINIFY', true );
		}

		if ( ! defined( 'DONOTCDN' ) ) {
			define( 'DONOTCDN', true );
		}

		if ( ! defined( 'DONOTCACHCEOBJECT' ) ) {
			define( 'DONOTCACHCEOBJECT', true );
		}

		// Set the headers to prevent caching for the different browsers.
		nocache_headers();
	}

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function get_timezone_string() {
		$current_offset = (float) get_option( 'gmt_offset' );
		$timezone_string = get_option( 'timezone_string' );

		// Create a UTC+- zone if no timezone string exists.
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

	/**
	 * @static
	 * @since 1.0.10
	 * @access public
	*/
	public static function do_action_deprecated( $tag, $args, $version, $replacement = false, $message = null ) {
		if ( function_exists( 'do_action_deprecated' ) ) { /* WP >= 4.6 */
			do_action_deprecated( $tag, $args, $version, $replacement, $message );
		} else {
			do_action_ref_array( $tag, $args );
		}
	}

	/**
	 * @static
	 * @since 1.0.10
	 * @access public
	*/
	public static function apply_filters_deprecated( $tag, $args, $version, $replacement = false, $message = null ) {
		if ( function_exists( 'apply_filters_deprecated' ) ) { /* WP >= 4.6 */
			return apply_filters_deprecated( $tag, $args, $version, $replacement, $message );
		} else {
			return apply_filters_ref_array( $tag, $args );
		}
	}
}
