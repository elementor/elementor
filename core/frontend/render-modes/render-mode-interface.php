<?php
namespace Elementor\Core\Frontend\RenderModes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Render_Mode_Interface {

	/**
	 * Render_Mode_Interface constructor.
	 *
	 * @param $post_id
	 */
	public function __construct( $post_id );

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
	 */
	public function prepare_render();

	/**
	 * Enqueue scripts for the current render.
	 */
	public function enqueue_scripts();

	/**
	 * Enqueue styles for the current render.
	 */
	public function enqueue_styles();

	/**
	 * Check permissions before start this render mode.
	 */
	public function get_permissions_callback();
}
