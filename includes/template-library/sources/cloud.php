<?php
namespace Elementor\TemplateLibrary;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
use Elementor\Plugin;
use Elementor\DB;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Source_Cloud extends Source_Base {
	const TEMP_FILES_DIR = 'elementor/tmp';
	const RESOURCE_TYPE_FOLDER = 'FOLDER';
	const RESOURCE_TYPE_TEMPLATE = 'TEMPLATE';

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

		$data['content'] = json_decode( $data['content'], true )['content'];

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

	public function search_templates( array $args = [] ) {
		return $this->get_app()->get_resources( $args );
	}

	public function export_template( $id ) {
		$data = $this->get_app()->get_resource( [ 'template_id' => $id ] );

		if ( is_wp_error( $data ) ) {
			return new \WP_Error( 'export_template_error', 'An error has occured' );
		}

		if ( static::RESOURCE_TYPE_FOLDER === $data['type'] ) {
			$this->handle_export_folder( $id );
		}

		if ( static::RESOURCE_TYPE_TEMPLATE === $data['type'] ) {
			$this->handle_export_file( $data );
		}
	}

	private function handle_export_file( $data ) {
		$file_data = $this->prepare_template_export( $data );

		if ( is_wp_error( $file_data ) ) {
			return $file_data;
		}

		$this->send_file_headers( $file_data['name'], strlen( $file_data['content'] ) );

		@ob_end_clean();
		flush();

		// PHPCS - Export widget json
		echo $file_data['content']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

		die;
	}

	private function handle_export_folder( $folder_id ) {
		$templates = $this->get_app()->get_resources( [ 'template_id' => $folder_id ] );

		$template_ids = array_map( fn( $template ) => $template['template_id'], $templates );

		$this->export_multiple_templates( $template_ids );
	}

	private function prepare_template_export( $data ) {
		if ( empty( $data['content'] ) ) {
			return new \WP_Error( 'empty_template', 'The template is empty' );
		}

		$data['content'] = json_decode( $data['content'], true );

		$export_data = [
			'content' => $data['content']['content'],
			'page_settings' => $data['content']['page_settings'] ?? [],
			'version' => DB::DB_VERSION,
			'title' => $data['title'],
			'type' => $data['templateType'],
		];

		return [
			'name' => 'elementor-' . $data['id'] . '-' . gmdate( 'Y-m-d' ) . '.json',
			'content' => wp_json_encode( $export_data ),
		];
	}

	private function send_file_headers( $file_name, $file_size ) {
		header( 'Content-Type: application/octet-stream' );
		header( 'Content-Disposition: attachment; filename=' . $file_name );
		header( 'Expires: 0' );
		header( 'Cache-Control: must-revalidate' );
		header( 'Pragma: public' );
		header( 'Content-Length: ' . $file_size );
	}

	public function export_multiple_templates( array $template_ids ) {
		$files = [];

		$wp_upload_dir = wp_upload_dir();

		$temp_path = $wp_upload_dir['basedir'] . '/' . self::TEMP_FILES_DIR;

		wp_mkdir_p( $temp_path );

		foreach ( $template_ids as $template_id ) {
			$data = $this->get_app()->get_resource( [ 'template_id' => $template_id ] );
			$file_data = $this->prepare_template_export( $data );

			if ( is_wp_error( $file_data ) ) {
				continue;
			}

			$complete_path = $temp_path . '/' . $file_data['name'];

			$put_contents = file_put_contents( $complete_path, $file_data['content'] );

			if ( ! $put_contents ) {
				return new \WP_Error( '404', sprintf( 'Cannot create file "%s".', $file_data['name'] ) );
			}

			$files[] = [
				'path' => $complete_path,
				'name' => $file_data['name'],
			];
		}

		if ( ! $files ) {
			return new \WP_Error( 'empty_files', 'There is no files to export (probably all the requested templates are empty).' );
		}

		$zip_archive_filename = 'elementor-templates-' . gmdate( 'Y-m-d' ) . '.zip';

		$zip_archive = new \ZipArchive();

		$zip_complete_path = $temp_path . '/' . $zip_archive_filename;

		$zip_archive->open( $zip_complete_path, \ZipArchive::CREATE );

		foreach ( $files as $file ) {
			$zip_archive->addFile( $file['path'], $file['name'] );
		}

		$zip_archive->close();

		foreach ( $files as $file ) {
			unlink( $file['path'] );
		}

		$this->send_file_headers( $zip_archive_filename, filesize( $zip_complete_path ) );

		@ob_end_flush();

		@readfile( $zip_complete_path );

		unlink( $zip_complete_path );

		die;
	}
}
