<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Revisions_Manager {

	public function __construct() {
		$this->register_actions();
	}

	public function on_revision_preview_request() {
		if ( empty( $_POST['id'] ) ) {
			wp_send_json_error( __( 'You must set the id', 'elementor' ) );
		}

		$revision = Plugin::instance()->db->get_plain_editor( $_POST['id'] );

		if ( empty( $revision ) ) {
			wp_send_json_error( __( 'Invalid Revision', 'elementor' ) );
		}

		wp_send_json_success( $revision );
	}

	private function register_actions() {
		if ( Utils::is_ajax() ) {
			add_action( 'wp_ajax_elementor_get_revision_preview', [ $this, 'on_revision_preview_request' ] );
		}
	}
}
