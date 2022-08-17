<?php

namespace Elementor\Core\App\Modules\ImportExport\Runners;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Core\Base\Document;
use Elementor\Core\Documents_Manager;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

// TODO: Move to Pro.
class Templates extends Runner_Base {
	private $import_session_id;

	public static function get_name() {
		return 'templates';
	}

	public function should_import( array $data ) {
		return (
			Utils::has_pro() &&
			isset( $data['include'] ) &&
			in_array( 'templates', $data['include'], true ) &&
			! empty( $data['extracted_directory_path'] ) &&
			! empty( $data['manifest']['templates'] )
		);
	}

	public function should_export( array $data ) {
		return (
			Utils::has_pro() &&
			isset( $data['include'] ) &&
			in_array( 'templates', $data['include'], true )
		);
	}

	public function should_revert( array $data ) {
		return (
			isset( $data['runners'] ) &&
			array_key_exists( 'templates', $data['runners'] )
		);
	}

	public function import( array $data, array $imported_data ) {
		$this->import_session_id = $data['session_id'];

		$path = $data['extracted_directory_path'] . 'templates/';
		$templates = $data['manifest']['templates'];

		$result['templates'] = [
			'succeed' => [],
			'failed' => [],
		];

		foreach ( $templates as $id => $template_settings ) {
			try {
				$template_data = ImportExportUtils::read_json_file( $path . $id );
				$import = $this->import_template( $id, $template_settings, $template_data );

				$result['templates']['succeed'][ $id ] = $import;
			} catch ( \Exception $error ) {
				$result['templates']['failed'][ $id ] = $error->getMessage();
			}
		}

		$result = $this->add_revert_data( $result );

		return $result;
	}

	public function export( array $data ) {
		$template_types = array_values( Source_Local::get_template_types() );

		$query_args = [
			'post_type' => Source_Local::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
			'meta_query' => [
				[
					'key' => Document::TYPE_META_KEY,
					'value' => $template_types,
				],
			],
		];

		$templates_query = new \WP_Query( $query_args );

		$templates_manifest_data = [];
		$files = [];

		foreach ( $templates_query->posts as $template_post ) {
			$template_id = $template_post->ID;

			$template_document = Plugin::$instance->documents->get( $template_id );

			$templates_manifest_data[ $template_id ] = $template_document->get_export_summary();

			$files[] = [
				'path' => 'templates/' . $template_id,
				'data' => $template_document->get_export_data(),
			];
		}

		$manifest_data['templates'] = $templates_manifest_data;

		return [
			'files' => $files,
			'manifest' => [
				$manifest_data,
			],
		];
	}

	public function revert( array $data ) {
		// TODO: find a better way to do this.
		// Hack to force all the templates type to be registered.
		$document_types = ( new Documents_Manager() )->get_document_types();

		$template_types = array_values( Source_Local::get_template_types() );

		$query_args = [
			'post_type' => Source_Local::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'meta_query' => [
				[
					'key' => Document::TYPE_META_KEY,
					'value' => $template_types,
				],
				[
					'key' => '_elementor_import_session_id',
					'value' => $data['session_id'],
				],
			],
		];

		$templates_query = new \WP_Query( $query_args );

		foreach ( $templates_query->posts as $template_post ) {
			$template_document = Plugin::$instance->documents->get( $template_post->ID );
			$template_document->delete();
		}

		// TODO: Restore the conditions.
	}

	private function import_template( $id, array $template_settings, array $template_data ) {
		$doc_type = $template_settings['doc_type'];

		$new_document = Plugin::$instance->documents->create(
			$doc_type,
			[
				'post_title' => $template_settings['title'],
				'post_type' => Source_Local::CPT,
				'post_status' => 'publish',
			]
		);

		if ( is_wp_error( $new_document ) ) {
			throw new \Exception( $new_document->get_error_message() );
		}

		$template_data['import_settings'] = $template_settings;
		$template_data['id'] = $id;

		$update_callback = function( $attachment_id ) {
			$this->set_session_post_meta( $attachment_id, $this->import_session_id );
		};

		add_filter( 'elementor/template_library/import_images/new_attachment', $update_callback );

		$new_document->import( $template_data );

		remove_filter( 'elementor/template_library/import_images/new_attachment', $update_callback );

		$document_id = $new_document->get_main_id();

		$this->set_session_post_meta( $document_id, $this->import_session_id );

		return $document_id;
	}

	private function add_revert_data( array $result ) {
		$result['revert_data']['templates'] = [];
		// TODO: Add conditions for the revert data.

		return $result;
	}
}
