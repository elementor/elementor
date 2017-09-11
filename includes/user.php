<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class User {

	const ADMIN_NOTICES_KEY = 'elementor_admin_notices';

	public static function init() {
		add_action( 'wp_ajax_elementor_set_admin_notice_viewed', [ __CLASS__, 'ajax_set_admin_notice_viewed' ] );
	}

	public static function is_current_user_can_edit( $post_id = 0 ) {
		if ( empty( $post_id ) ) {
			$post_id = get_the_ID();
		}

		if ( ! Utils::is_post_type_support( $post_id ) ) {
			return false;
		}

		if ( 'trash' === get_post_status( $post_id ) ) {
			return false;
		}

		$post_type_object = get_post_type_object( get_post_type( $post_id ) );
		if ( empty( $post_type_object ) ) {
			return false;
		}

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

		$user = wp_get_current_user();
		$exclude_roles = get_option( 'elementor_exclude_user_roles', [] );

		$compare_roles = array_intersect( $user->roles, $exclude_roles );
		if ( ! empty( $compare_roles ) ) {
			return false;
		}

		return true;
	}

	private static function _get_user_notices() {
		return get_user_meta( get_current_user_id(), self::ADMIN_NOTICES_KEY, true );
	}

	public static function is_user_notice_viewed( $notice_id ) {
		$notices = self::_get_user_notices();
		if ( empty( $notices ) || empty( $notices[ $notice_id ] ) ) {
			return false;
		}

		return true;
	}

	public static function ajax_set_admin_notice_viewed() {
		if ( empty( $_POST['notice_id'] ) ) {
			die;
		}

		$notices = self::_get_user_notices();
		if ( empty( $notices ) ) {
			$notices = [];
		}

		$notices[ $_POST['notice_id'] ] = 'true';
		update_user_meta( get_current_user_id(), self::ADMIN_NOTICES_KEY, $notices );

		die;
	}
}

User::init();
