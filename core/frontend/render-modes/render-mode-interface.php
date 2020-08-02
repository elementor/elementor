<?php
namespace Elementor\Core\Frontend\RenderModes;

interface Render_Mode_Interface {
	const QUERY_STRING_PARAM_NAME = 'render_mode';
	const QUERY_STRING_NONCE_PARAM_NAME = 'render_mode_nonce';
	const NONCE_ACTION_PATTERN = 'render_mode_{post_id}';

	/**
	 * Returns the key name of the class.
	 *
	 * @return string
	 */
	public static function get_name();

	/**
	 * Check if the current render mode is static.
	 *
	 * @return bool
	 */
	public function is_static();

	/**
	 * Will execute all the logic that related to the current render mode.
	 *
	 * @return static
	 */
	public function prepare_render();

	/**
	 * @return static
	 */
	public function enqueue_scripts();

	/**
	 * @return static
	 */
	public function enqueue_styles();
}
