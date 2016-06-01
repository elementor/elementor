<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Utils {

	public static function get_edit_link( $post_id = 0 ) {
		return add_query_arg( 'elementor', '', get_permalink( $post_id ) );
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

	public static function is_current_user_can_edit( $post_id = 0 ) {
		if ( empty( $post_id ) )
			$post_id = get_the_ID();

		if ( ! self::is_post_type_support( $post_id ) )
			return false;

		if ( 'trash' === get_post_status( $post_id ) )
			return false;

		$post_type_object = get_post_type_object( get_post_type( $post_id ) );
		if ( empty( $post_type_object ) )
			return false;

		if ( ! isset( $post_type_object->cap->edit_post ) )
			return false;

		$edit_cap = $post_type_object->cap->edit_post;
		if ( ! current_user_can( $edit_cap, $post_id ) )
			return false;

		$user = wp_get_current_user();
		$exclude_roles = get_option( 'elementor_exclude_user_roles', [] );

		$compare_roles = array_intersect( $user->roles, $exclude_roles );
		if ( ! empty( $compare_roles ) )
			return false;

		return true;
	}

	public static function get_youtube_id_from_url( $url ) {
		preg_match( '/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/', $url, $video_id_parts );

		if ( empty( $video_id_parts[1] ) ) {
			return false;
		}

		return $video_id_parts[1];
	}
}
