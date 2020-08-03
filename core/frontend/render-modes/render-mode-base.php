<?php
namespace Elementor\Core\Frontend\RenderModes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Render_Mode_Base implements Render_Mode_Interface {
	const QUERY_STRING_PARAM_NAME = 'render_mode';
	const QUERY_STRING_NONCE_PARAM_NAME = 'render_mode_nonce';
	const NONCE_ACTION_PATTERN = 'render_mode_{post_id}';

	/**
	 * @param $post_id
	 *
	 * @return string
	 */
	public static function get_url( $post_id ) {
		return add_query_arg( [
			'post_id' => $post_id,
			static::QUERY_STRING_PARAM_NAME => static::get_name(),
			'ver' => time(),
			static::QUERY_STRING_NONCE_PARAM_NAME => wp_create_nonce(
				str_replace( '{post_id}', $post_id, static::NONCE_ACTION_PATTERN )
			),
		], get_permalink( $post_id ) );
	}

	/**
	 * By default do not do nothing.
	 */
	public function prepare_render() {
		//
	}

	/**
	 * By default do not do nothing.
	 */
	public function enqueue_scripts() {
		//
	}

	/**
	 * By default do not do nothing.
	 */
	public function enqueue_styles() {
		//
	}


	/**
	 * By default returns false.
	 *
	 * @return bool
	 */
	public function is_static() {
		return false;
	}
}
