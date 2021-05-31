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
		$post_id = $this->post_id;

		if ( ! $is_analyzer_data_report ) {
			$nonce_verified = isset( $_REQUEST['nonce'] ) && wp_verify_nonce( $_REQUEST['nonce'], 'save_analyzer_data_report' );

			if ( ! $post_id || ! $nonce_verified ) {
				return;
			}
		}

		if ( $post_id ) {
			$this->save_analyzer_data_report();
		} else {
			$result = 'No valid post ID found. ' . $post_id;
			wp_send_json_error( $result, 400 );
		}
	}

	private function save_analyzer_data_report() {
		$post_id = $this->post_id;

		try {
			$page_data = json_decode( stripslashes( $_POST['page_data'] ), true );
			$original_data = $page_data;
			$optimizer = new Page_Optimizer( $page_data, $post_id );
			$optimization_results = $optimizer->optimize_page();

			$css = $page_data['css'];
			$critical_css = $page_data['criticalCSS'];
			$did_save_data['css'] = update_post_meta( $post_id, '_elementor_optimizer_used_css', $css );
			$did_save_data['critical_CSS'] = update_post_meta( $post_id, '_elementor_optimizer_critical_css', $critical_css );

			unset( $page_data['css'] );
			unset( $page_data['criticalCSS'] );
			foreach ( $page_data['images'] as $key => $image ) {
				unset( $page_data['images'][ $key ]['placeholder']['data'] );
			}
			foreach ( $page_data['backgroundImages'] as $key => $image ) {
				unset( $page_data['backgroundImages'][ $key ]['placeholder']['data'] );
			}

			$did_save_data['report'] = update_post_meta( $post_id, '_elementor_analyzer_report', $page_data );

			$result = [
				'type' => 'success',
				'optimization_results' => $optimization_results,
				'did_save_data' => $did_save_data,
				'saved_report' => $page_data,
				'original_data' => $original_data,
				'css' => $css,
				'critical_css' => $critical_css,
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
