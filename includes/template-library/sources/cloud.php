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

	public function get_item( $template_id ) {}

	public function get_data( array $args ) {}

	public function delete_template( $template_id ) {}

	public function save_item( $template_data ) {}

	public function update_item( $new_data ) {}

	public function export_template( $template_id ) {}
}
