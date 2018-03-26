<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor utils class.
 *
 * Elementor utils handler class is responsible for different utility methods
 * used by Elementor.
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
		// TODO: When minimum required version of WordPress will be 4.7, use `wp_doing_ajax()` instead.
		return defined( 'DOING_AJAX' ) && DOING_AJAX;
	}

	/**
	 * Is script debug.
	 *
	 * Whether script debug is enabled or not.
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
	 * @since 1.0.0
	 * @deprecated 2.0.0
	 *
	 * @access public
	 * @static
	 *
	 * @param int $post_id Optional. Post ID. Default is `0`.
	 *
	 * @return string Post edit link.
	 */
	public static function get_edit_link( $post_id = 0 ) {
		// TODO: _deprecated_function( __METHOD__, '2.0.0', '$document->get_edit_url()' );

		if ( ! $post_id ) {
			$post_id = get_the_ID();
		}

		$edit_link = Plugin::$instance->documents->get( $post_id )->get_edit_url();

		/**
		 * Get edit link.
		 *
		 * Filters the Elementor edit link.
		 *
		 * @since 1.0.0
		 * @deprecated 2.0.0 Use `elementor/document/urls/edit ` filter instead.
		 *
		 * @param string $edit_link New URL query string (unescaped).
		 * @param int    $post_id   Post ID.
		 *
		 */
		$edit_link = apply_filters( 'elementor/utils/get_edit_link', $edit_link, $post_id );

		return $edit_link;
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
	 * @deprecated 2.0.0
	 *
	 * @access public
	 * @static
	 *
	 * @param int $post_id Optional. Post ID. Default is `0`.
	 *
	 * @return string Post preview URL.
	 */
	public static function get_preview_url( $post_id ) {
		// TODO: _deprecated_function( __METHOD__, '2.0.0', '$document->get_preview_url()' );

		$url = Plugin::$instance->documents->get( $post_id )->get_preview_url();

		/**
		 * Preview URL.
		 *
		 * Filters the Elementor preview URL.
		 *
		 * @since 1.6.4
		 * @deprecated 2.0.0 Use `elementor/document/urls/preview` filter instead.
		 *
		 * @param string $preview_url URL with chosen scheme.
		 * @param int    $post_id     Post ID.
		 */
		$url = apply_filters( 'elementor/utils/preview_url', $url, $post_id );

		return $url;
	}

	/**
	 * Get WordPress preview url.
	 *
	 * Retrieve WordPress preview URL for any given post ID.
	 *
	 * @since 1.9.0
	 * @deprecated 2.0.0
	 *
	 * @access public
	 * @static
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return string WordPress preview URL.
	 */
	public static function get_wp_preview_url( $post_id ) {
		// TODO: _deprecated_function( __METHOD__, '2.0.0', '$document->get_wp_preview_url()' );

		$wp_preview_url = Plugin::$instance->documents->get( $post_id )->get_wp_preview_url();

		/**
		 * WordPress preview URL.
		 *
		 * Filters the WordPress preview URL.
		 *
		 * @since 1.9.0
		 * @deprecated 2.0.0 Use `elementor/document/urls/wp_preview` filter instead.
		 *
		 * @param string $wp_preview_url WordPress preview URL.
		 * @param int    $post_id        Post ID.
		 */
		$wp_preview_url = apply_filters( 'elementor/utils/wp_preview_url', $wp_preview_url, $post_id );

		return $wp_preview_url;
	}


	/**
	 * Get exit to dashboard URL.
	 *
	 * Retrieve WordPress preview URL for any given post ID.
	 *
	 * @since 1.9.0
	 * @deprecated 2.0.0
	 *
	 * @access public
	 * @static
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return string Exit to dashboard URL.
	 */
	public static function get_exit_to_dashboard_url( $post_id ) {
		// TODO: _deprecated_function( __METHOD__, '2.0.0', '$document->get_exit_to_dashboard_url()' );
		return Plugin::$instance->documents->get( $post_id )->get_exit_to_dashboard_url();
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
		 * Is post type support.
		 *
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
		 * Get placeholder image source.
		 *
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
	 * Returns a string containing a hexadecimal representation of random number.
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
	 * @param bool   $replacement Optional. The hook that should have been used.
	 * @param string $message     Optional. A message regarding the change.
	 */
	public static function do_action_deprecated( $tag, $args, $version, $replacement = false, $message = null ) {
		// TODO: When minimum required version of Elementor will be 4.6, this method can be replaced by `do_action_deprecated()` function.
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
	 * @param bool   $replacement Optional. The hook that should have been used.
	 * @param string $message     Optional. A message regarding the change.
	 */
	public static function apply_filters_deprecated( $tag, $args, $version, $replacement = false, $message = null ) {
		// TODO: When minimum required version of Elementor will be 4.6, this method can be replaced by `apply_filters_deprecated()` function.
		if ( function_exists( 'apply_filters_deprecated' ) ) { /* WP >= 4.6 */
			return apply_filters_deprecated( $tag, $args, $version, $replacement, $message );
		} else {
			return apply_filters_ref_array( $tag, $args );
		}
	}

	/**
	 * Get last edited string.
	 *
	 * Retrieve a string saying when the post was saved or the last time it was edited.
	 *
	 * @since 1.9.0
	 * @deprecated 2.0.0
	 *
	 * @access public
	 * @static
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return string Last edited string.
	 */
	public static function get_last_edited( $post_id ) {
		// TODO: _deprecated_function( __METHOD__, '2.0.0', '$document->get_last_edited()' );

		$document = Plugin::$instance->documents->get( $post_id );

		return $document->get_last_edited();
	}

	/**
	 * Get create new post URL.
	 *
	 * Retrieve a custom URL for creating a new post/page using Elementor.
	 *
	 * @since 1.9.0
	 * @access public
	 * @static
	 *
	 * @param string $post_type Optional. Post type slug. Default is 'page'.
	 *
	 * @return string A URL for creating new post using Elementor.
	 */
	public static function get_create_new_post_url( $post_type = 'page' ) {
		$new_post_url = add_query_arg( [
			'action' => 'elementor_new_post',
			'post_type' => $post_type,
		], admin_url( 'edit.php' ) );

		$new_post_url = wp_nonce_url( $new_post_url, 'elementor_action_new_post' );

		return $new_post_url;
	}

	/**
	 * Get post autosave.
	 *
	 * Retrieve an autosave for any given post.
	 *
	 * @access public
	 * @static
	 *
	 * @param int $post_id Post ID.
	 * @param int $user_id Optional. User ID. Default is `0`.
	 *
	 * @return \WP_Post|false Post autosave or false.
	 */
	public static function get_post_autosave( $post_id, $user_id = 0 ) {
		global $wpdb;

		$post = get_post( $post_id );

		$where = $wpdb->prepare( 'post_parent = %d AND post_name LIKE %s AND post_modified_gmt > %s', [ $post_id, "{$post_id}-autosave%", $post->post_modified_gmt ] );

		if ( $user_id ) {
			$where .= $wpdb->prepare( ' AND post_author = %d', $user_id );
		}

		$revision = $wpdb->get_row( "SELECT * FROM $wpdb->posts WHERE $where AND post_type = 'revision'" );

		if ( $revision ) {
			$revision = new \WP_Post( $revision );
		} else {
			$revision = false;
		}

		return $revision;
	}

	/**
	 * @since 2.0.0
	 * @access public
	 * @static
	 */
	public static function is_cpt_custom_templates_supported() {
		require_once ABSPATH . '/wp-admin/includes/theme.php';

		return method_exists( wp_get_theme(), 'get_post_templates' );
	}
}
