<?php
namespace Elementor\Modules\Screenshots;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function get_name() {
		return 'screenshots';
	}

	public function screenshot_proxy() {
		if ( ! wp_verify_nonce( $_GET['nonce'], 'screenshot_proxy' ) ) {
			echo '';
		}

		if ( ! empty( $_GET['href'] ) ) {
			$response = wp_remote_get( utf8_decode( $_GET['href'] ) );
			$body = wp_remote_retrieve_body( $response );
			if ( $body ) {
				echo $body;
			}
		}
	}

	public function ajax_save( $data ) {
		if ( empty( $data['screenshot'] ) ) {
			return false;
		}

		$post_id = $data['post_id'];

		$file_content = substr( $data['screenshot'], strlen( 'data:image/png;base64,' ) );
		$file_name = 'Elementor Post Screenshot ' . $post_id . '.png';
		$over_write_file_name_callback = function () use ( $file_name ) {
			return $file_name;
		};

		add_filter( 'wp_unique_filename', $over_write_file_name_callback );

		$upload = wp_upload_bits(
			$file_name,
			null,
			base64_decode( $file_content )
		);

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

	public function enqueue_scripts() {
		if ( ! isset( $_REQUEST['elementor-screenshot'] ) || ! User::is_current_user_can_edit() ) { // WPCS: CSRF ok.
			return;
		}

		wp_enqueue_script(
			'html2canvas',
			ELEMENTOR_URL . 'modules/screenshots/assets/js/html2canvas.min.js',
			[],
			'1.0.0-alpha.12',
			true
		);

		wp_enqueue_script(
			'elementor-screenshot',
			ELEMENTOR_URL . 'modules/screenshots/assets/js/frontend/screenshot.js',
			[
				'html2canvas',
			],
			ELEMENTOR_VERSION . time(),
			true
		);

		$post_id = get_queried_object_id();

		$config = [
			'selector' => '.elementor-' . $post_id,
			'nonce' => wp_create_nonce( 'screenshot_proxy' ),
			'home_url' => home_url(),
		];

		wp_add_inline_script( 'elementor-screenshot', 'var ElementorScreenshotConfig = ' . json_encode( $config ) . ';' );

		$css = new \Elementor\Core\Files\CSS\Post_Preview( $post_id );
		$css->enqueue();
	}

	/**
	 * @param \Elementor\Core\Common\Modules\Ajax\Module $ajax_manager
	 */
	public function register_ajax_actions( $ajax_manager ) {
		$ajax_manager->register_ajax_action( 'screenshot_save', [ $this, 'ajax_save' ] );
	}

	public function __construct() {
		if ( isset( $_REQUEST['screenshot_proxy'] ) ) {
			$this->screenshot_proxy();
			die;
		}

		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ], 1000 );

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );
	}
}
