<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class User {

	const INTRODUCTION_KEY = 'elementor_introduction';

	public static function init() {
		add_action( 'wp_ajax_elementor_introduction_viewed', [ __CLASS__, 'set_introduction_viewed' ] );
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

	public static function get_introduction() {
		$user_should_view_introduction = self::is_user_should_view_introduction();

		if ( ! $user_should_view_introduction ) {
			return false;
		}

		$introduction = self::get_current_introduction();

		if ( empty( $introduction['active'] ) ) {
			return false;
		}

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

	private static function is_user_should_view_introduction() {
		$user_introduction_meta = self::get_introduction_meta();

		$current_introduction = self::get_current_introduction();

		return empty( $user_introduction_meta[ $current_introduction['version'] ] );
	}

	private static function get_current_introduction() {
		return [
			'active' => false,
			'title' => __( 'Please view our cool video', 'elementor' ),
			'content' => '<div class="elementor-video-wrapper"><iframe src="https://www.youtube.com/watch?v=kB4U67tiQLA" frameborder="0" allowfullscreen></iframe></div>',
			'version' => 1,
		];
	}
}

User::init();
