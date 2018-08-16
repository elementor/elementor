<?php
namespace Elementor\Modules\Screenshots;

use Elementor\Core\Ajax_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function get_name() {
		return 'screenshots';
	}

	public function screenshot_proxy() {
		if ( ! wp_verify_nonce( $_REQUEST['nonce'], 'screenshot_proxy' ) ) {
			echo '';
		}

		if ( ! empty( $_REQUEST['href'] ) ) {
			$response = wp_remote_get( utf8_decode( $_REQUEST['href'] ) );
			$body =  wp_remote_retrieve_body( $response );
			if ( $body ) {
				echo $body;
			}
		}
	}

	public function save_screenshot() {
		if ( empty( $_REQUEST['screenshot'] ) ) {
			return;
		}

		$post_id = $_REQUEST['post_id'];
		$file_content = substr( $_REQUEST['screenshot'], strlen( 'data:image/png;base64,' ) );
		$file_name = 'Elementor Post Screenshot ' . $post_id . '.png';
		$attachment_data = get_post_meta( $post_id, '_elementor_screenshot', true );
		$over_write_file_name_callback = function () use ( $file_name ) {
			return $file_name;
		};

		add_filter( 'wp_unique_filename', $over_write_file_name_callback );

		$upload = wp_upload_bits(
			$file_name,
			'',
			base64_decode( $file_content )
		);

		remove_filter( 'wp_unique_filename', $over_write_file_name_callback );

		if ( $attachment_data ) {
			return;
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
	}

	public function enqueue_scripts() {
		wp_enqueue_script(
			'rasterize-html',
			ELEMENTOR_URL . 'modules/screenshots/assets/js/rasterizeHTML.js-master/dist/rasterizeHTML.allinone.js',
			[],
			'10-06-2017',
			true
		);

		wp_enqueue_script(
			'elementor-screenshot',
			ELEMENTOR_URL . 'modules/screenshots/assets/js/frontend/screenshot.js',
			[
				'rasterize-html'
			],
			ELEMENTOR_VERSION . time(),
			true
		);

		$post_id = get_queried_object_id();

		$config = [
			'selector' => '.elementor-' . $post_id,
			'post_id' => $post_id,
			'nonce' => wp_create_nonce( 'screenshot_proxy' ),
			'home_url' => home_url(),
			'ajax_url' => admin_url( '/admin-ajax.php' ),
		];

		wp_add_inline_script( 'elementor-screenshot', 'var ElementorScreenshotConfig = ' . json_encode( $config ) . ';' );
	}

	public function template_redirect() {
		if ( isset( $_REQUEST['elementor-screenshot'] ) && User::is_current_user_can_edit() ) { // WPCS: CSRF ok.
			remove_action( 'template_redirect', 'redirect_canonical' );
			add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
			add_filter('show_admin_bar', '__return_false');
			add_filter( 'template_include', [ $this, 'template_include' ], 12 /* After WooCommerce & Elementor Pro - Locations Manager */ );
		}
	}

	public function template_include() {
		return  __DIR__ . '/templates/screenshot.php';
	}

	public function __construct() {
		add_filter( 'template_redirect', [ $this, 'template_redirect' ], 0 );
		add_action( 'wp_ajax_elementor_save_screenshot', [ $this, 'save_screenshot' ] );
		if ( isset( $_REQUEST['screenshot_proxy'] ) ) {
			$this->screenshot_proxy();
			die;
		}
	}
}
