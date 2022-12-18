<?php
namespace Elementor\Core\Frontend;

use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;
use Elementor\Core\Frontend\RenderModes\Render_Mode_Normal;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Render_Mode_Manager {
	const QUERY_STRING_PARAM_NAME = 'render_mode';
	const QUERY_STRING_POST_ID = 'post_id';
	const QUERY_STRING_NONCE_PARAM_NAME = 'render_mode_nonce';
	const NONCE_ACTION_PATTERN = 'render_mode_{post_id}';

	/**
	 * @var Render_Mode_Base
	 */
	private $current;

	/**
	 * @var Render_Mode_Base[]
	 */
	private $render_modes = [];

	/**
	 * @param $post_id
	 * @param $render_mode_name
	 *
	 * @return string
	 */
	public static function get_base_url( $post_id, $render_mode_name ) {
		return add_query_arg( [
			self::QUERY_STRING_POST_ID => $post_id,
			self::QUERY_STRING_PARAM_NAME => $render_mode_name,
			self::QUERY_STRING_NONCE_PARAM_NAME => wp_create_nonce( self::get_nonce_action( $post_id ) ),
			'ver' => time(),
		], get_permalink( $post_id ) );
	}

	/**
	 * @param $post_id
	 *
	 * @return string
	 */
	public static function get_nonce_action( $post_id ) {
		return str_replace( '{post_id}', $post_id, self::NONCE_ACTION_PATTERN );
	}

	/**
	 * Register a new render mode into the render mode manager.
	 *
	 * @param $class_name
	 *
	 * @return $this
	 * @throws \Exception
	 */
	public function register_render_mode( $class_name ) {
		if ( ! is_subclass_of( $class_name, Render_Mode_Base::class ) ) {
			throw new \Exception( "'{$class_name}' must extends 'Render_Mode_Base'" );
		}

		$this->render_modes[ $class_name::get_name() ] = $class_name;

		return $this;
	}

	/**
	 * Get the current render mode.
	 *
	 * @return Render_Mode_Base
	 */
	public function get_current() {
		return $this->current;
	}

	/**
	 * @param Render_Mode_Base $render_mode
	 *
	 * @return $this
	 */
	private function set_current( Render_Mode_Base $render_mode ) {
		$this->current = $render_mode;

		return $this;
	}

	/**
	 * Set render mode.
	 *
	 * @return $this
	 */
	private function choose_render_mode() {
		$post_id = null;
		$key = null;
		$nonce = null;

		if ( isset( $_GET[ self::QUERY_STRING_POST_ID ] ) ) {
			$post_id = $_GET[ self::QUERY_STRING_POST_ID ]; // phpcs:ignore -- Nonce will be checked next line.
		}

		if ( isset( $_GET[ self::QUERY_STRING_NONCE_PARAM_NAME ] ) ) {
			$nonce = $_GET[ self::QUERY_STRING_NONCE_PARAM_NAME ]; // phpcs:ignore -- Nonce will be checked next line.
		}

		if ( isset( $_GET[ self::QUERY_STRING_PARAM_NAME ] ) ) {
			$key = $_GET[ self::QUERY_STRING_PARAM_NAME ]; // phpcs:ignore -- Nonce will be checked next line.
		}

		if (
			$post_id &&
			$nonce &&
			wp_verify_nonce( $nonce, self::get_nonce_action( $post_id ) ) &&
			$key &&
			array_key_exists( $key, $this->render_modes )
		) {
			$this->set_current( new $this->render_modes[ $key ]( $post_id ) );
		} else {
			$this->set_current( new Render_Mode_Normal( $post_id ) );
		}

		return $this;
	}

	/**
	 * Add actions base on the current render.
	 *
	 * @throws \Requests_Exception_HTTP_403
	 * @throws Status403
	 */
	private function add_current_actions() {
		if ( ! $this->current->get_permissions_callback() ) {
			// WP >= 6.2-alpha
			if ( class_exists( '\WpOrg\Requests\Exception\Http\Status403' ) ) {
				throw new \WpOrg\Requests\Exception\Http\Status403();
			} else {
				throw new \Requests_Exception_HTTP_403();
			}
		}

		// Run when 'template-redirect' actually because the the class is instantiate when 'template-redirect' run.
		$this->current->prepare_render();
	}

	/**
	 * Render_Mode_Manager constructor.
	 *
	 * @throws \Exception
	 */
	public function __construct() {
		$this->register_render_mode( Render_Mode_Normal::class );

		do_action( 'elementor/frontend/render_mode/register', $this );

		$this->choose_render_mode();
		$this->add_current_actions();
	}
}
