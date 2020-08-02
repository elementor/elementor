<?php
namespace Elementor\Core\Frontend\RenderModes;

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
			Render_Mode_Interface::QUERY_STRING_PARAM_NAME => static::get_name(),
			'ver' => time(),
			Render_Mode_Interface::QUERY_STRING_NONCE_PARAM_NAME => wp_create_nonce(
				str_replace( '{post_id}', $post_id, Render_Mode_Interface::NONCE_ACTION_PATTERN )
			),
		], get_permalink( $post_id ) );
	}

	/**
	 * By default do not do nothing.
	 *
	 * @return static
	 */
	public function prepare_render() {
		return $this;
	}

	/**
	 * By default do not do nothing.
	 *
	 * @return static
	 */
	public function enqueue_scripts() {
		return $this;
	}

	/**
	 * By default do not do nothing.
	 *
	 * @return static
	 */
	public function enqueue_styles() {
		return $this;
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
