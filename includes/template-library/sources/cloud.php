<?php
namespace Elementor\TemplateLibrary;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Source_Cloud extends Source_Base {

	const TRANSIENT_KEY_PREFIX = 'elementor_cloud_library_templates_data_';

	public function __construct() {
		parent::__construct();

		$this->add_actions();
	}

	public function add_actions() {
		add_action( 'elementor/experiments/feature-state-change/container', [ $this, 'clear_cache' ], 10, 0 );
	}

	public function get_id() {
		return 'cloud';
	}

	public function get_title() {
		return esc_html__( 'Cloud Library', 'elementor' );
	}

	public function register_data() {}

	public function get_items( $args = [] ) {
		$force_update = ! empty( $args['force_update'] ) && is_bool( $args['force_update'] );

		$templates_data = $this->get_templates_data( $force_update );

		$templates = [];

		foreach ( $templates_data as $template_data ) {
			$templates[] = $this->prepare_template( $template_data );
		}

		return $templates;
	}

	public function get_item( $template_id ) {
		$templates = $this->get_items();

		return $templates[ $template_id ];
	}

	public function save_item( $template_data ) {}

	public function update_item( $new_data ) {}

	public function delete_template( $template_id ) {}

	public function export_template( $template_id ) {}

	public function get_data( array $args, $context = 'display' ) {
		$app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-library' );
		$data = $app->get_resource( $args['template_id'] );

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		// Set the Request's state as an Elementor upload request, in order to support unfiltered file uploads.
		Plugin::$instance->uploads_manager->set_elementor_upload_state( true );

		// BC.
		$data = (array) $data;

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

	protected function get_templates_data( bool $force_update ): array {
		$templates_data_cache_key = static::TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION;

		$experiments_manager = Plugin::$instance->experiments;
		$editor_layout_type = $experiments_manager->is_feature_active( 'container' ) ? 'container_flexbox' : '';

		if ( $force_update ) {
			return $this->get_templates( $editor_layout_type );
		}

		$templates_data = get_transient( $templates_data_cache_key );

		if ( empty( $templates_data ) ) {
			return $this->get_templates( $editor_layout_type );
		}

		return $templates_data;
	}

	protected function get_templates( string $editor_layout_type ): array {
		$app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-library' );

		$templates_data = $app->get_resources( $editor_layout_type );

		if ( empty( $templates_data ) ) {
			return [];
		}

		set_transient( static::TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION, $templates_data, 12 * HOUR_IN_SECONDS );

		return $templates_data;
	}

	protected function prepare_template( array $template_data ) {

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

	public function clear_cache() {
		delete_transient( static::TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION );
	}
}
