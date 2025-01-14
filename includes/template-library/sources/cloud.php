<?php
namespace Elementor\TemplateLibrary;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Source_Cloud extends Source_Remote_Base {

	const TEMPLATES_DATA_TRANSIENT_KEY_PREFIX = 'elementor_cloud_library_templates_data_';

	public function get_id() {
		return 'cloud';
	}

	public function get_title() {
		return esc_html__( 'Cloud Library', 'elementor' );
	}

	public function register_data() {}

	public function save_item( $template_data ) {}

	public function update_item( $new_data ) {}

	public function delete_template( $template_id ) {}

	public function export_template( $template_id ) {}

	protected function get_template_content( $template_id ) {
		$app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-library' );

		return $app->get_resource( $template_id );
	}

	protected function prepare_template( array $template_data ): array {
		return [
			'template_id' => $template_data['id'],
			'source' => $this->get_id(),
			'type' => $template_data['type'],
			'subtype' => $template_data['subtype'],
			'title' => $template_data['title'],
			'thumbnail' => $template_data['thumbnail'],
			'date' => $template_data['tmpl_created'],
			'author' => $template_data['author'],
			'hasPageSettings' => ( '1' === $template_data['has_page_settings'] ),
			'url' => $template_data['url'],
		];
	}
}
