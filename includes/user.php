<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class User {

	const ADMIN_NOTICES_KEY = 'elementor_admin_notices';
	const INTRODUCTION_KEY = 'elementor_introduction';

	public static function init() {
		add_action( 'wp_ajax_elementor_introduction_viewed', [ __CLASS__, 'set_introduction_viewed' ] );
		add_action( 'wp_ajax_elementor_set_admin_notice_viewed', [ __CLASS__, 'ajax_set_admin_notice_viewed' ] );
	}

	public static function is_current_user_can_edit( $post_id = 0 ) {
		if ( empty( $post_id ) )
			$post_id = get_the_ID();

		if ( ! Utils::is_post_type_support( $post_id ) )
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

	private static function _get_user_notices() {
		return get_user_meta( get_current_user_id(), self::ADMIN_NOTICES_KEY, true );
	}

	public static function is_user_notice_viewed( $notice_id ) {
		$notices = self::_get_user_notices();
		if ( empty( $notices ) || empty( $notices[ $notice_id ] ) )
			return false;

		return true;
	}

	public static function ajax_set_admin_notice_viewed() {
		if ( empty( $_POST['notice_id'] ) )
			die;

		$notices = self::_get_user_notices();
		if ( empty( $notices ) )
			$notices = [];

		$notices[ $_POST['notice_id'] ] = 'true';
		update_user_meta( get_current_user_id(), self::ADMIN_NOTICES_KEY, $notices );

		die;
	}

	public static function get_introduction() {
		$introduction = self::get_current_introduction();

		if ( empty( $introduction['active'] ) ) {
			return false;
		}

		$introduction['is_user_should_view'] = self::is_user_should_view_introduction();

		return $introduction;
	}

	public static function set_introduction_viewed() {
		$user_introduction_meta = self::get_introduction_meta();

		if ( ! $user_introduction_meta ) {
			$user_introduction_meta = [];
		}

		$current_introduction = self::get_current_introduction();

		$user_introduction_meta[ $current_introduction['version'] ] = true;

		$user = wp_get_current_user();

		update_user_meta( $user->ID, self::INTRODUCTION_KEY, $user_introduction_meta );

		die;
	}

	private static function get_introduction_meta() {
		$user = wp_get_current_user();

		return get_user_meta( $user->ID, self::INTRODUCTION_KEY, true );
	}

	public static function is_user_should_view_introduction() {
		$user_introduction_meta = self::get_introduction_meta();

		$current_introduction = self::get_current_introduction();

		return empty( $user_introduction_meta[ $current_introduction['version'] ] );
	}

	private static function get_current_introduction() {
		return [
			'active' => true,
			'title' => '<div id="elementor-introduction-title">' .
			           __( 'Two Minute Tour Of Elementor', 'elementor' ) .
			           '</div><div id="elementor-introduction-subtitle">' .
			           __( 'Watch this quick tour that gives you a basic understanding of how to use Elementor.', 'elementor' ) .
			           '</div>',
			'content' => '<div class="elementor-video-wrapper"><iframe src="https://www.youtube.com/embed/6u45V2q1s4k?autoplay=1&rel=0&showinfo=0" frameborder="0" allowfullscreen></iframe></div>',
			'delay' => 2500,
			'version' => 1,
		];
	}
}

User::init();
