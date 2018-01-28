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

	/**
	 * @param Ajax_Manager $ajax_manager
	 */
	public function register_ajax_actions( $ajax_manager ) {
		$ajax_manager->register_ajax_action( 'save_screenshot', [ $this, 'save_screenshot' ] );

	}

	public function screenshot_proxy() {
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
			'rasterizeHTML',
			ELEMENTOR_URL . '/modules/screenshots/assets/js/rasterizeHTML.js-master/dist/rasterizeHTML.allinone.js',
			[],
			'10-06-2017',
			true
		);
	}

	public function template_include( $template ) {
		if ( User::is_current_user_can_edit() && isset( $_REQUEST['elementor-screenshot'] ) ) { // WPCS: CSRF ok.

			add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
			$template = __DIR__ . '/templates/screenshot.php';
		}

		return $template;
	}

	public function __construct() {
		$this->register_actions();

		parent::__construct();
	}

	private function register_actions() {
		add_filter( 'template_include', [ $this, 'template_include' ] );
		add_action( 'wp_ajax_elementor_save_screenshot', [ $this, 'save_screenshot' ] );
		add_action( 'wp_ajax_elementor_screenshot_proxy', [ $this, 'screenshot_proxy' ] );
	}
}
