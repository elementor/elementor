<?php
namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Core\App\Modules\ImportExport\Iterator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WP_Custom_Post_Types extends Base {

	private $post_type;

	public function __construct( Iterator $iterator, Base $parent, $post_type ) {
		parent::__construct( $iterator, $parent );

		$this->post_type = $post_type;
	}

	public function export() {

		$post_type_object = get_post_type_object( $this->post_type );
		return [
			'name'=> $post_type_object->name,
			'label'=> $post_type_object->label,
		];
	}

	public function import_post( $id, array $post_settings ) {
		$post_data = $this->importer->read_json_file( $id );

		$post_attributes = [
			'post_title' => $post_settings['title'],
			'post_type' => $this->post_type,
			'post_status' => 'publish',
		];

		if ( ! empty( $post_settings['excerpt'] ) ) {
			$post_attributes['post_excerpt'] = $post_settings['excerpt'];
		}

		$new_document = Plugin::$instance->documents->create(
			$post_settings['doc_type'],
			$post_attributes
		);

		if ( is_wp_error( $new_document ) ) {
			return $new_document;
		}

		$post_data['import_settings'] = $post_settings;

		$new_document->import( $post_data );

		$new_id = $new_document->get_main_id();

		if ( ! empty( $post_settings['show_on_front'] ) ) {
			update_option( 'page_on_front', $new_id );

			if ( ! $this->show_page_on_front ) {
				update_option( 'show_on_front', 'page' );
			}
		}

		return $new_id;
	}

	protected function get_name() {
		return $this->post_type;
	}

	protected function import( array $import_settings ) {
		$result = [
			'succeed' => [],
			'failed' => [],
		];

		foreach ( $import_settings as $id => $post_settings ) {
			try {
				$import = $this->import_post( $id, $post_settings );

				if ( is_wp_error( $import ) ) {
					$result['failed'][ $id ] = $import->get_error_message();

					continue;
				}

				$result['succeed'][ $id ] = $import;
			} catch ( \Error $error ) {
				$result['failed'][ $id ] = $error->getMessage();
			}
		}

		return $result;
	}

	private function init_page_on_front_data() {
		$this->show_page_on_front = 'page' === get_option( 'show_on_front' );

		if ( $this->show_page_on_front && $this->exporter ) {
			$this->page_on_front_id = (int) get_option( 'page_on_front' );
		}
	}
}
