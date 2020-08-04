<?php
namespace Elementor\Core\Frontend\RenderModes;

use Elementor\Plugin;
use Elementor\Core\Base\Document;
use Elementor\Core\Frontend\Render_Mode_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Render_Mode_Base implements Render_Mode_Interface {
	/**
	 * @var int
	 */
	protected $post_id;

	/**
	 * @var Document
	 */
	protected $post;

	/**
	 * Render_Mode_Base constructor.
	 *
	 * @param $post_id
	 */
	public function __construct( $post_id ) {
		$this->post_id = intval( $post_id );
	}

	/**
	 * @param $post_id
	 *
	 * @return string
	 */
	public static function get_url( $post_id ) {
		return Render_Mode_Manager::get_base_url( $post_id, static::get_name() );
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
	 * Check if the current user has permissions for the current render mode.
	 *
	 * @return bool
	 */
	public function get_permissions_callback() {
		return $this->get_post()->is_editable_by_current_user();
	}

	/**
	 * By default returns false.
	 *
	 * @return bool
	 */
	public function is_static() {
		return false;
	}

	/**
	 * @return Document
	 */
	public function get_post() {
		if ( ! $this->post ) {
			$this->post = Plugin::$instance->documents->get( $this->post_id );
		}

		return $this->post;
	}
}
