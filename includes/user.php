<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor user.
 *
 * Elementor user handler class is responsible for checking if the user can edit
 * with Elementor and displaying different admin notices.
 *
 * @since 1.0.0
 */
class User {

	/**
	 * The admin notices key.
	 */
	const ADMIN_NOTICES_KEY = 'elementor_admin_notices';

	const INTRODUCTION_KEY = 'elementor_introduction';

	const INTRODUCTION_VERSION = 2;

	/**
	 * Init.
	 *
	 * Initialize Elementor user.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 */
	public static function init() {
		add_action( 'wp_ajax_elementor_set_admin_notice_viewed', [ __CLASS__, 'ajax_set_admin_notice_viewed' ] );

		add_action( 'elementor/ajax/register_actions', [ __CLASS__, 'register_ajax_actions' ] );
	}

	public static function register_ajax_actions() {
		Plugin::$instance->ajax->register_ajax_action( 'introduction_viewed', [ __CLASS__, 'set_introduction_viewed' ] );
	}

	/**
	 * Is current user can edit.
	 *
	 * Whether the current user can edit the post.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param int $post_id Optional. The post ID. Default is `0`.
	 *
	 * @return bool Whether the current user can edit the post.
	 */
	public static function is_current_user_can_edit( $post_id = 0 ) {
		$post = get_post( $post_id );

		if ( ! $post ) {
			return false;
		}

		if ( 'trash' === get_post_status( $post_id ) ) {
			return false;
		}

		if ( ! self::is_current_user_can_edit_post_type( $post->post_type ) ) {
			return false;
		}

		$post_type_object = get_post_type_object( $post->post_type );

		if ( ! isset( $post_type_object->cap->edit_post ) ) {
			return false;
		}

		$edit_cap = $post_type_object->cap->edit_post;
		if ( ! current_user_can( $edit_cap, $post_id ) ) {
			return false;
		}

		if ( get_option( 'page_for_posts' ) === $post_id ) {
			return false;
		}

		return true;
	}

	/**
	 * Is current user can access elementor.
	 *
	 * Whether the current user role is not excluded by Elementor Settings.
	 *
	 * @access public
	 * @static
	 *
	 * @return bool True if can access, False otherwise.
	 */
	public static function is_current_user_in_editing_black_list() {
		$user = wp_get_current_user();
		$exclude_roles = get_option( 'elementor_exclude_user_roles', [] );

		$compare_roles = array_intersect( $user->roles, $exclude_roles );
		if ( ! empty( $compare_roles ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Is current user can edit post type.
	 *
	 * Whether the current user can edit the given post type.
	 *
	 * @since 1.9.0
	 * @access public
	 * @static
	 *
	 * @param string $post_type the post type slug to check.
	 *
	 * @return bool True if can edit, False otherwise.
	 */
	public static function is_current_user_can_edit_post_type( $post_type ) {
		if ( ! self::is_current_user_in_editing_black_list() ) {
			return false;
		}

		if ( ! Utils::is_post_type_support( $post_type ) ) {
			return false;
		}

		$post_type_object = get_post_type_object( $post_type );

		if ( ! current_user_can( $post_type_object->cap->edit_posts ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Get user notices.
	 *
	 * Retrieve the list of notices for the current user.
	 *
	 * @since 2.0.0
	 * @access private
	 * @static
	 *
	 * @return array A list of user notices.
	 */
	private static function get_user_notices() {
		return get_user_meta( get_current_user_id(), self::ADMIN_NOTICES_KEY, true );
	}

	/**
	 * Is user notice viewed.
	 *
	 * Whether the notice was viewed by the user.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param int $notice_id The notice ID.
	 *
	 * @return bool Whether the notice was viewed by the user.
	 */
	public static function is_user_notice_viewed( $notice_id ) {
		$notices = self::get_user_notices();
		if ( empty( $notices ) || empty( $notices[ $notice_id ] ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Set admin notice as viewed.
	 *
	 * Flag the user admin notice as viewed using an authenticated ajax request.
	 *
	 * Fired by `wp_ajax_elementor_set_admin_notice_viewed` action.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 */
	public static function ajax_set_admin_notice_viewed() {
		if ( empty( $_POST['notice_id'] ) ) {
			die;
		}

		$notices = self::get_user_notices();
		if ( empty( $notices ) ) {
			$notices = [];
		}

		$notices[ $_POST['notice_id'] ] = 'true';
		update_user_meta( get_current_user_id(), self::ADMIN_NOTICES_KEY, $notices );

		die;
	}

	public static function set_introduction_viewed() {
		$user_introduction_meta = self::get_introduction_meta();

		if ( ! $user_introduction_meta ) {
			$user_introduction_meta = [];
		}

		$user_introduction_meta[ self::INTRODUCTION_VERSION ] = true;

		update_user_meta( get_current_user_id(), self::INTRODUCTION_KEY, $user_introduction_meta );
	}

	public static function is_should_view_introduction() {
		$user_introduction_meta = self::get_introduction_meta();

		return empty( $user_introduction_meta[ self::INTRODUCTION_VERSION ] );
	}

	private static function get_introduction_meta() {
		return get_user_meta( get_current_user_id(), self::INTRODUCTION_KEY, true );
	}
}

User::init();
