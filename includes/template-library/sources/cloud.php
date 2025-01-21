<?php
namespace Elementor\TemplateLibrary;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Source_Cloud extends Source_Base {

	public function get_id(): string {
		return 'cloud';
	}

	public function get_title(): string {
		return esc_html__( 'Cloud Library', 'elementor' );
	}

	public function register_data() {}

	public function get_items( $args = [] ) {
		return [];
	}

	public function get_item( $template_id ) {}

	public function get_data( array $args ) {}

	public function delete_template( $template_id ) {}

	public function save_item( $template_data ) {}

	public function update_item( $new_data ) {}

	public function export_template( $template_id ) {}
}
