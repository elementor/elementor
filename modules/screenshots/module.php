<?php
namespace Elementor\Modules\Screenshots;

use Elementor\Plugin;
use Elementor\Frontend;
use Elementor\Core\Files\CSS\Post_Preview;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {
	const SCREENSHOT_NONCE_ACTION = 'screenshot';
	const SCREENSHOT_PROXY_NONCE_ACTION = 'screenshot_proxy';

	const SCREENSHOT_PARAM_NAME = 'elementor-screenshot';

	/**
	 * Module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'screenshots';
	}

	/**
	 * Creates proxy for css and images,
	 * dom to image libraries cannot load content from another origin.
	 *
	 * @param $url
	 *
	 * @return string
	 */
	public function get_proxy_data( $url ) {
		$response = wp_remote_get( utf8_decode( $url ) );

		$body = wp_remote_retrieve_body( $response );

		if ( ! $body ) {
			$body = '';
		}

		$content_type = wp_remote_retrieve_headers( $response )->offsetGet( 'content-type' );

		header( 'content-type: ' . $content_type );

		return $body;
	}

	/**
	 * Save screenshot and attached it to the post.
	 *
	 * @param $data
	 *
	 * @return bool|string
	 * @throws \Exception
	 */
	public function ajax_save( $data ) {
		if ( empty( $data['screenshot'] ) || empty( $data['post_id'] ) ) {
			return false;
		}

		$screenshot = new Screenshot( $data['post_id'], $data['screenshot'] );

		$screenshot
			->create_dir()
			->upload()
			->remove_old_attachment()
			->create_new_attachment();

		return $screenshot->get_screenshot_url();
	}

	/**
	 * Load screenshot scripts.
	 */
	public function enqueue_scripts() {
		$post_id = $_GET[ self::SCREENSHOT_PARAM_NAME ]; // phpcs:ignore -- Nonce was checked before register this method.

		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) ? '' : '.min';

		wp_enqueue_script(
			'dom-to-image',
			ELEMENTOR_ASSETS_URL . "/lib/dom-to-image/js/dom-to-image{$suffix}.js",
			[],
			'2.6.0',
			true
		);

		wp_enqueue_script(
			'html2canvas',
			ELEMENTOR_ASSETS_URL . "/lib/html2canvas/js/html2canvas{$suffix}.js",
			[],
			'1.0.0-rc.5',
			true
		);

		wp_enqueue_script(
			'elementor-screenshot',
			ELEMENTOR_URL . "assets/js/screenshot{$suffix}.js",
			[ 'dom-to-image', 'html2canvas' ],
			ELEMENTOR_VERSION,
			true
		);

		$config = [
			'selector' => '.elementor-' . $post_id,
			'nonce' => wp_create_nonce( self::SCREENSHOT_PROXY_NONCE_ACTION ),
			'home_url' => home_url(),
			'post_id' => $post_id,
		];

		wp_add_inline_script( 'elementor-screenshot', 'var ElementorScreenshotConfig = ' . wp_json_encode( $config ) . ';' );

		$css = Post_Preview::create( $post_id );
		$css->enqueue();
	}

	/**
	 * Register screenshots action.
	 *
	 * @param \Elementor\Core\Common\Modules\Ajax\Module $ajax_manager
	 */
	public function register_ajax_actions( $ajax_manager ) {
		$ajax_manager->register_ajax_action( 'screenshot_save', [ $this, 'ajax_save' ] );
	}

	/**
	 * @param $post_id
	 *
	 * @return string
	 */
	public function get_screenshot_url( $post_id ) {
		return add_query_arg( [
			'elementor-screenshot' => $post_id,
			'ver' => time(),
			'nonce' => wp_create_nonce( self::SCREENSHOT_NONCE_ACTION . $post_id ),
		], get_permalink( $post_id ) );
	}

	/**
	 * Extends document config with screenshot URL.
	 *
	 * @param $config
	 *
	 * @return array
	 */
	public function extend_document_config( $config ) {
		$url = $this->get_screenshot_url(
			get_queried_object_id()
		);

		return array_replace_recursive( $config, [
			'urls' => [
				'screenshot' => $url,
			],
		] );
	}

	/**
	 * Handle frontend for screenshot mode.
	 *
	 * Sets the mode on `template redirect` hook, after plugins are loaded and before WP page render.
	 * @throws \Requests_Exception_HTTP_403
	 */
	public function handle_screenshot_mode() {
		if ( ! $this->is_screenshot_mode( $_GET ) ) { // phpcs:ignore -- Checking nonce inside the method.
			return;
		}

		// Make the preview to be rendered static. (static images, video, slides and animations).
		Plugin::$instance->frontend->set_render_mode( Frontend::RENDER_MODE_STATIC );

		show_admin_bar( false );

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ], 1000 );
	}

	/**
	 * Check and validate proxy mode.
	 *
	 * @param array $query_params
	 *
	 * @return bool
	 * @throws \Requests_Exception_HTTP_400
	 * @throws \Requests_Exception_HTTP_403
	 */
	protected function is_screenshot_proxy_mode( array $query_params ) {
		$is_proxy = isset( $query_params['screenshot_proxy'] );

		if ( $is_proxy ) {
			if ( ! wp_verify_nonce( $query_params['nonce'], self::SCREENSHOT_PROXY_NONCE_ACTION ) ) {
				throw new \Requests_Exception_HTTP_403();
			}

			if ( ! $query_params['href'] ) {
				throw new \Requests_Exception_HTTP_400();
			}
		}

		return $is_proxy;
	}

	/**
	 * Check and validate proxy mode.
	 *
	 * @param array $query_params
	 *
	 * @return bool
	 * @throws \Requests_Exception_HTTP_403
	 */
	protected function is_screenshot_mode( array $query_params ) {
		$is_screenshot = isset( $query_params[ self::SCREENSHOT_PARAM_NAME ] );

		if ( $is_screenshot ) {
			$post_id = $query_params[ self::SCREENSHOT_PARAM_NAME ];

			if ( ! wp_verify_nonce( $query_params['nonce'], self::SCREENSHOT_NONCE_ACTION . $post_id ) ) {
				throw new \Requests_Exception_HTTP_403();
			}

			$document = Plugin::$instance->documents->get( $post_id );

			if ( ! $document->is_editable_by_current_user() ) {
				throw new \Requests_Exception_HTTP_403();
			}
		}

		return $is_screenshot;
	}

	/**
	 * Module constructor.
	 *
	 * @throws \Requests_Exception_HTTP_400
	 * @throws \Requests_Exception_HTTP_403
	 */
	public function __construct() {
		if ( $this->is_screenshot_proxy_mode( $_GET ) ) { // phpcs:ignore -- Checking nonce inside the method.
			echo $this->get_proxy_data( $_GET['href'] ); // phpcs:ignore -- Nonce was checked on the above method
			die;
		}

		add_action( 'template_redirect', [ $this, 'handle_screenshot_mode' ] );
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
		add_filter( 'elementor/document/config', [ $this, 'extend_document_config' ] );
	}
}
