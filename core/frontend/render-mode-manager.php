<?php
namespace Elementor\Core\Frontend;

use Elementor\Core\Frontend\RenderModes\Render_Mode_Normal;
use Elementor\Core\Frontend\RenderModes\Render_Mode_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Render_Mode_Manager {
	/**
	 * @var Render_Mode_Interface
	 */
	private $current;

	/**
	 * @var Render_Mode_Interface[]
	 */
	private $render_modes = [];

	/**
	 * Register a new render mode into the render mode manager.
	 *
	 * @param $class_name
	 *
	 * @return $this
	 * @throws \Exception
	 */
	public function register_render_mode( $class_name ) {
		$interfaces = class_implements( $class_name );

		if ( ! $interfaces || ! in_array( Render_Mode_Interface::class, $interfaces, true ) ) {
			throw new \Exception( "'{$class_name}' must implements 'Render_Mode_Interface'" );
		}

		$this->render_modes[ $class_name::get_name() ] = $class_name;

		return $this;
	}

	/**
	 * Get the current render mode.
	 *
	 * @return Render_Mode_Interface
	 */
	public function get_current() {
		return $this->current;
	}

	/**
	 * Set render mode.
	 *
	 * @return $this
	 */
	private function set_current_render_mode() {
		$post_id = get_the_ID();

		$key = null;
		$nonce = null;
		$nonce_action = str_replace( '{post_id}', $post_id, Render_Mode_Interface::NONCE_ACTION_PATTERN );

		if ( isset( $_GET[ Render_Mode_Interface::QUERY_STRING_NONCE_PARAM_NAME ] ) ) {
			$nonce = $_GET[ Render_Mode_Interface::QUERY_STRING_NONCE_PARAM_NAME ]; // phpcs:ignore -- Nonce will be checked next line.
		}

		if ( isset( $_GET[ Render_Mode_Interface::QUERY_STRING_PARAM_NAME ] ) ) {
			$key = $_GET[ Render_Mode_Interface::QUERY_STRING_PARAM_NAME ]; // phpcs:ignore -- Nonce will be checked next line.
		}

		if (
			$nonce &&
			wp_verify_nonce( $nonce, $nonce_action ) &&
			$key &&
			array_key_exists( $key, $this->render_modes )
		) {
			$this->current = new $this->render_modes[ $key ]();
		} else {
			$this->current = new Render_Mode_Normal();
		}

		return $this;
	}

	private function run_current_actions() {
		$this->current->prepare_render();

		add_action( 'wp_enqueue_scripts', [ $this->current, 'enqueue_scripts' ] );
		add_action( 'wp_enqueue_scripts', [ $this->current, 'enqueue_styles' ] );
	}

	/**
	 * Render_Mode_Manager constructor.
	 *
	 * @throws \Exception
	 */
	public function __construct() {
		$this->register_render_mode( Render_Mode_Normal::class );

		do_action( 'elementor/frontend/render_mode/register' );

		$this->set_current_render_mode();
		$this->run_current_actions();
	}
}
