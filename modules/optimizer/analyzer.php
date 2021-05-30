<?php


namespace Elementor\Modules\Optimizer;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Analyzer extends BaseModule {
	private $post_id;

	public function get_name() {
		return 'analyzer';
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'show_admin_bar', '__return_false' );

		add_action( 'wp_footer', function() {
			wp_register_script( 'analyzer',
				ELEMENTOR_ASSETS_URL . '/js/analyzer.js',
				'jquery',
				ELEMENTOR_VERSION,
				true
			);
			wp_enqueue_script( 'analyzer' );
			wp_localize_script( 'analyzer', 'analyzerAjax', array( 'ajaxurl' => admin_url( 'admin-ajax.php' ) ) );
		} );

		$is_analyzer_data_report = isset( $_POST['action'] ) && 'save_analyzer_data_report' === $_POST['action'];
		$this->post_id = isset( $_POST['post_id'] ) && ! ! get_post_status( $_POST['post_id'] ) ? $_POST['post_id'] : false;

		if ( ! $is_analyzer_data_report ) {
			$nonce_verified = isset( $_REQUEST['nonce'] ) && wp_verify_nonce( $_REQUEST['nonce'], 'save_analyzer_data_report' );

			if ( ! $this->post_id || ! $nonce_verified ) {
				return;
			}
		}

		if ( $this->post_id ) {
			$this->save_analyzer_data_report();
		} else {
			$result = 'No valid post ID found. ' . $_POST['post_id'];
			wp_send_json_error( $result, 400 );
		}
	}

	private function save_analyzer_data_report() {
		try {
			$page_data = json_decode( stripslashes( $_POST['page_data'] ), true );

			// do stuff with the data
			// TODO: Remove large content from data at this point.

			$did_save_data = update_post_meta( $_POST['post_id'], '_elementor_analyzer_report', $page_data );

			$optimizer = new Page_Optimizer( $page_data, $_POST['post_id'] );
			$optimizer->optimize_page();
/*
			do_action( 'elementor_analyzer_report_saved', [
				'post_id' => $_POST['post_id'],
				'page_data' => $page_data,
			] );

			if ( get_post_meta( $_POST['post_id'], '_elementor_analyzer_report', true ) ) {
				$did_save_data = update_post_meta( $_POST['post_id'], '_elementor_analyzer_report', $page_data );
			} else {
				$did_save_data = add_post_meta( $_POST['post_id'], '_elementor_analyzer_report', $page_data );
			}
*/
			$result = [
				'type' => 'success',
				'did_save_data' => $did_save_data,
			];
			wp_send_json_success( $result, 200 );
		} catch ( \Error $error ) {
			$result = [
				'type' => 'error',
				'error' => $error->getMessage(),
			];
			wp_send_json_error( $result, 400 );
		}
	}
}
