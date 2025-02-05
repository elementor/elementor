<?php
namespace Elementor\TemplateLibrary;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Source_Cloud extends Source_Base {
	protected function get_app(): Cloud_Library {
		$cloud_library_app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-library' );

		if ( ! $cloud_library_app ) {
			$error_message = esc_html__( 'Cloud-Library is not instantiated.', 'elementor' );

			throw new \Exception( $error_message, Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return $cloud_library_app;
	}

	public function get_id(): string {
		return 'cloud';
	}

	public function get_title(): string {
		return esc_html__( 'Cloud Library', 'elementor' );
	}

	public function register_data() {}

	public function get_items( $args = [] ) {
		return $this->get_app()->get_resources( $args );
	}

	public function get_item_children( array $args = [] ) {
		return $this->get_app()->get_resources( $args );
	}

	public function get_item( $template_id ) {}

	public function get_data( array $args ) {
		$data = $this->get_app()->get_resource( $args );

		if ( is_wp_error( $data ) || empty( $data['content'] ) ) {
			return $data;
		}

		$data['content'] = json_decode( $data['content'], true );

		Plugin::$instance->uploads_manager->set_elementor_upload_state( true );

		$data['content'] = $this->replace_elements_ids( $data['content'] );
		$data['content'] = $this->process_export_import_content( $data['content'], 'on_import' );

		$post_id = $args['editor_post_id'];
		$document = Plugin::$instance->documents->get( $post_id );
		if ( $document ) {
			$data['content'] = $document->get_elements_raw_data( $data['content'], true );
		}

		// After the upload complete, set the elementor upload state back to false
		Plugin::$instance->uploads_manager->set_elementor_upload_state( false );

		return $data;
	}

	public function delete_template( $template_id ) {
		return $this->get_app()->delete_resource( $template_id );
	}

	public function save_item( $template_data ) {}

	public function update_item( $template_data ) {
		return $this->get_app()->update_resource( $template_data );
	}

	public function export_template( $template_id ) {}
}
