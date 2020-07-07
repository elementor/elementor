<?php

namespace Elementor\Modules\Screenshots;

use Elementor\Plugin;
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
	 * @return string
	 */
	public function ajax_save( $data ) {
		if ( empty( $data['screenshot'] ) || empty( $data['post_id'] ) ) {
			return false;
		}

		$post_id = $data['post_id'];

		$file_content = substr( $data['screenshot'], strlen( 'data:image/png;base64,' ) );
		$file_name = 'Elementor-post-screenshot-' . $post_id . '.png';
		$over_write_file_name_callback = function () use ( $file_name ) {
			return $file_name;
		};

		$upload_dir_callback = function ( $uploads ) {
			return array_merge( $uploads, [
				'subdir' => $subdir = 'elementor/screenshots',
				'path' => "{$uploads['basedir']}/{$subdir}",
				'url' => "{$uploads['baseurl']}/{$subdir}",
			] );
		};

		add_filter( 'wp_unique_filename', $over_write_file_name_callback );
		add_filter( 'upload_dir', $upload_dir_callback );

		$upload = wp_upload_bits(
			$file_name,
			null,
			base64_decode( $file_content )
		);

		remove_filter( 'upload_dir', $upload_dir_callback );
		remove_filter( 'wp_unique_filename', $over_write_file_name_callback );

		$attachment_data = get_post_meta( $post_id, '_elementor_screenshot', true );

		if ( $attachment_data ) {
			return $attachment_data['url'];
		}

		$post = [
			'post_title' => $file_name,
			'guid' => $upload['url'],
		];

		$info = wp_check_filetype( $upload['file'] );

		if ( $info ) {
			$post['post_mime_type'] = $info['type'];
		}

		$attachment_id = wp_insert_attachment( $post, $upload['file'] );

		$attachment_data = [
			'id' => $attachment_id,
			'url' => $upload['url'],
		];

		update_post_meta( $post_id, '_elementor_screenshot', $attachment_data );

		$disable_thumbnail_sizes_filter = function () {
			return [];
		};

		add_filter( 'intermediate_image_sizes_advanced', $disable_thumbnail_sizes_filter );

		wp_update_attachment_metadata(
			$attachment_id,
			wp_generate_attachment_metadata( $attachment_id, $upload['file'] )
		);

		remove_filter( 'intermediate_image_sizes_advanced', $disable_thumbnail_sizes_filter );

		return $upload['url'];
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
			'elementor-screenshot',
			ELEMENTOR_URL . "assets/js/screenshot{$suffix}.js",
			[ 'dom-to-image' ],
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
		if ( $this->is_screenshot_mode( $_GET ) ) { // phpcs:ignore -- Checking nonce inside the method.
			show_admin_bar( false );

			add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ], 1000 );
		}
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
