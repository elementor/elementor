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
	 * Is ajax.
	 *
	 * Whether the current request is a WordPress ajax request.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return bool True if it's a WordPress ajax request, false otherwise.
	*/
	public static function is_ajax() {
		// TODO: When minimum required version will be 4.7, use `wp_doing_ajax()`.
		return defined( 'DOING_AJAX' ) && DOING_AJAX;
	}

	/**
	 * Is script debug.
	 *
	 * Whether script debug is ebanled or not.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return bool True if it's a script debug is active, false otherwise.
	*/
	public static function is_script_debug() {
		return defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG;
	}

	/**
	 * Get edit link.
	 *
	 * Retrieve Elementor edit link.
	 *
	 * @since  1.0.0
	 * @access public
	 * @static
	 *
	 * @param int $post_id Optional. Post ID. Default is `0`.
	 *
	 * @return string Post edit link.
	 */
	public static function get_edit_link( $post_id = 0 ) {
		_deprecated_function( __METHOD__, '1.9.0', '$document->get_edit_link()' );

		$url = Plugin::$instance->documents->get( $post_id )->get_edit_url();

		/**
		 * Filters the Elementor edit link.
		 *
		 * @since 1.0.0
		 *
		 * @param string $edit_link New URL query string (unescaped).
		 * @param int    $post_id   Post ID.
		 */
		return self::apply_filters_deprecated( 'elementor/utils/get_edit_link', [ $url, $post_id ], '1.9.0', 'elementor/document/get_edit_link' );
	}

	/**
	 * Get pro link.
	 *
	 * Retrieve the link to Elementor Pro.
	 *
	 * @since 1.7.0
	 * @access public
	 * @static
	 *
	 * @param string $link URL to Elementor pro.
	 *
	 * @return string Elementor pro link.
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
	 * Get preview URL.
	 *
	 * Retrieve the post preview URL.
	 *
	 * @since 1.6.4
	 * @access public
	 * @static
	 *
	 * @param int $post_id Optional. Post ID. Default is `0`.
	 *
	 * @return string Post preview URL.
	 */
	public static function get_preview_url( $post_id ) {
		_deprecated_function( __METHOD__, '1.9.0', '$document->get_preview_url()' );

		$url = Plugin::$instance->documents->get( $post_id )->get_preview_url();

		/**
		 * Filters the Elementor preview URL.
		 *
		 * @since 1.6.4
		 *
		 * @param string $preview_url URL with chosen scheme.
		 * @param int    $post_id     Post ID.
		 */
		return self::apply_filters_deprecated( 'elementor/utils/preview_url', [ $url, $post_id ], '1.9.0', 'elementor/document/preview_url' );
	}

	/**
	 * Is post type supports Elementor.
	 *
	 * Whether the post type supports editing with Elementor.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param int $post_id Optional. Post ID. Default is `0`.
	 *
	 * @return string True if post type supports editing with Elementor, false otherwise.
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
	 * Get placeholder image source.
	 *
	 * Retrieve the source of the placeholder image.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string The source of the default placeholder image used by Elementor.
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
	 * Generate random string.
	 *
	 * Returns a string containing a hexadecimal representation of randon number.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Random string.
	*/
	public static function generate_random_string() {
		return dechex( rand() );
	}

	/**
	 * Do not cache.
	 *
	 * Tell WordPress cache plugins not to cache this request.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
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
	 * Get timezone string.
	 *
	 * Retrieve timezone string from the WordPress database.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return string Timezone string.
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
	 * Do action deprecated.
	 *
	 * Fires functions attached to a deprecated action hook.
	 *
	 * @since 1.0.10
	 * @access public
	 * @static
	 *
	 * @param string $tag         The name of the action hook.
	 * @param array  $args        Array of additional function arguments to be passed to `do_action()`.
	 * @param string $version     The version of WordPress that deprecated the hook.
	 * @param string $replacement Optional. The hook that should have been used.
	 * @param string $message     Optional. A message regarding the change.
	*/
	public static function do_action_deprecated( $tag, $args, $version, $replacement = false, $message = null ) {
		if ( function_exists( 'do_action_deprecated' ) ) { /* WP >= 4.6 */
			do_action_deprecated( $tag, $args, $version, $replacement, $message );
		} else {
			do_action_ref_array( $tag, $args );
		}
	}

	/**
	 * Do filter deprecated.
	 *
	 * Fires functions attached to a deprecated filter hook.
	 *
	 * @since 1.0.10
	 * @access public
	 * @static
	 *
	 * @param string $tag         The name of the filter hook.
	 * @param array  $args        Array of additional function arguments to be passed to `apply_filters()`.
	 * @param string $version     The version of WordPress that deprecated the hook.
	 * @param string $replacement Optional. The hook that should have been used.
	 * @param string $message     Optional. A message regarding the change.
	*/
	public static function apply_filters_deprecated( $tag, $args, $version, $replacement = false, $message = null ) {
		if ( function_exists( 'apply_filters_deprecated' ) ) { /* WP >= 4.6 */
			return apply_filters_deprecated( $tag, $args, $version, $replacement, $message );
		} else {
			return apply_filters_ref_array( $tag, $args );
		}
	}
}
