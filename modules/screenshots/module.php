<?php

namespace Elementor\Modules\Screenshots;

use Elementor\Core\Files\CSS\Post_Preview;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

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
	 */
	public function screenshot_proxy() {
		if ( ! wp_verify_nonce( $_GET['nonce'], 'screenshot_proxy' ) || empty( $_GET['href'] ) ) {
			echo '';
			die;
		}

		$response = wp_remote_get( utf8_decode( $_GET['href'] ) );

		$body = wp_remote_retrieve_body( $response );

		if ( ! $body ) {
			echo '';
			die;
		}

		$content_type = wp_remote_retrieve_headers( $response )->offsetGet( 'content-type' );

		header( 'content-type: ' . $content_type );

		echo $body;
	}

	/**
	 * Save screenshot and attached it to the post.
	 *
	 * @param $data
	 *
	 * @return string
	 */
	public function ajax_save( $data ) {
		if ( empty( $data['screenshot'] ) ) {
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
				'subdir' => $subdir = '/elementor/screenshots',
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

		wp_update_attachment_metadata(
			$attachment_id,
			wp_generate_attachment_metadata( $attachment_id, $upload['file'] )
		);

		return $upload['url'];
	}

	/**
	 * Load screenshot scripts.
	 */
	public function enqueue_scripts() {
		if ( ! $this->is_screenshot_mode() || ! User::is_current_user_can_edit() ) {
			return;
		}

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
			ELEMENTOR_URL . "modules/screenshots/assets/js/preview/screenshot{$suffix}.js",
			[ 'dom-to-image' ],
			ELEMENTOR_VERSION,
			true
		);

		$post_id = get_queried_object_id();

		$config = [
			'selector' => '.elementor-' . $post_id,
			'nonce' => wp_create_nonce( 'screenshot_proxy' ),
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
	 * Extends document config with screenshot URL.
	 *
	 * @param $config
	 *
	 * @return array
	 */
	public function extend_document_config( $config ) {
		$post_id = get_queried_object_id();

		$url = add_query_arg( [
			'elementor-screenshot' => $post_id,
			'ver' => time(),
		], get_permalink( $post_id ) );

		return array_replace_recursive( $config, [
			'urls' => [
				'screenshot' => $url,
			],
		] );
	}

	/**
	 * Checks if is in screenshot mode.
	 *
	 * @return bool
	 */
	protected function is_screenshot_mode() {
		return isset( $_REQUEST['elementor-screenshot'] );
	}

	/**
	 * Checks if is in proxy mode.
	 *
	 * @return bool
	 */
	protected function is_screenshot_proxy_mode() {
		return isset( $_REQUEST['screenshot_proxy'] );
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		if ( $this->is_screenshot_proxy_mode() ) {
			$this->screenshot_proxy();
			die;
		}

		if ( $this->is_screenshot_mode() ) {
			show_admin_bar( false );
		}

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ], 1000 );

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );

		add_filter( 'elementor/document/config', [ $this, 'extend_document_config' ] );
	}
}
