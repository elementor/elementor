<?php
namespace Elementor\Modules\Screenshots;

use Elementor\Core\Ajax_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
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

	public function save_screenshot( $request ) {
		if ( empty( $request['screenshot'] ) ) {
			return;
		}

		$post_id = $request['post_id'];
		$file_content = substr( $request['screenshot'], strlen( 'data:image/png;base64,' ) );
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
			'html2canvas',
			'https://html2canvas.hertzen.com/dist/html2canvas.js',
			[],
			'1.0.0-alpha.9',
			true
		);
	}

	public function __construct() {
		$this->register_actions();

		parent::__construct();
	}

	private function register_actions() {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );

	}
}
