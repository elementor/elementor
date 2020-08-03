<?php
namespace Elementor\Core\Frontend\RenderModes;

use Elementor\Core\Frontend\Render_Mode_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Render_Mode_Base implements Render_Mode_Interface {
	/**
	 * @param $post_id
	 *
	 * @return string
	 */
	public static function get_url( $post_id ) {
		return add_query_arg( [
			'post_id' => $post_id,
			Render_Mode_Manager::QUERY_STRING_PARAM_NAME => static::get_name(),
			'ver' => time(),
			Render_Mode_Manager::QUERY_STRING_NONCE_PARAM_NAME => wp_create_nonce(
				str_replace( '{post_id}', $post_id, Render_Mode_Manager::NONCE_ACTION_PATTERN )
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
