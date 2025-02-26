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
	const FOLDER_RESOURCE_TYPE = 'FOLDER';
	const TEMPLATE_RESOURCE_TYPE = 'TEMPLATE';

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
		return $this->get_app()->get_resources( [ 'parentId' => $args['template_id'] ] );
	}

	public function get_item( $id ) {
		return $this->get_app()->get_resource( [ 'id' => $id ] );
	}

	public function get_data( array $args ) {
		$data = $this->get_app()->get_resource( [ 'id' => $args['template_id'] ] );

		if ( is_wp_error( $data ) || empty( $data['content'] ) ) {
			return $data;
		}

		$decoded_data = json_decode( $data['content'], true );
		$data['content'] = $decoded_data['content'];

		Plugin::$instance->uploads_manager->set_elementor_upload_state( true );

		$data['content'] = $this->replace_elements_ids( $data['content'] );
		$data['content'] = $this->process_export_import_content( $data['content'], 'on_import' );

		if ( ! empty( $args['editor_post_id'] ) ) {
			$post_id = $args['editor_post_id'];
			$document = Plugin::$instance->documents->get( $post_id );
			if ( $document ) {
				$data['content'] = $document->get_elements_raw_data( $data['content'], true );
			}
		}

		if ( ! empty( $args['with_page_settings'] ) ) {
			$data['page_settings'] = $decoded_data['page_settings'];
		}

		// After the upload complete, set the elementor upload state back to false
		Plugin::$instance->uploads_manager->set_elementor_upload_state( false );

		return $data;
	}

	public function delete_template( $template_id ) {
		return $this->get_app()->delete_resource( $template_id );
	}

	public function save_item( $template_data ): int {
		$app = $this->get_app();

		$resource_data = [
			'title' => $template_data['title'] ?? esc_html__( '(no title)', 'elementor' ),
			'type' => self::TEMPLATE_RESOURCE_TYPE,
			'templateType' => $template_data['type'],
			'parentId' => $template_data['parentId'] ?? null,
			'content' => wp_json_encode( $template_data['content'] ),
		];

		$response = $app->post_resource( $resource_data );

		return (int) $response['id'];
	}

	public function save_folder( array $folder_data = [] ) {
		$app = $this->get_app();

		$resource_data = [
			'title' => $folder_data['title'] ?? esc_html__( 'New Folder', 'elementor' ),
			'type' => self::FOLDER_RESOURCE_TYPE,
			'templateType' => 'folder',
			'parentId' => null,
		];

		$response = $app->post_resource( $resource_data );

		return (int) $response['id'];
	}

	public function update_item( $template_data ) {
		return $this->get_app()->update_resource( $template_data );
	}

	public function search_templates( array $args = [] ) {
		return $this->get_app()->get_resources( $args );
	}

	public function export_template( $id ) {
		$data = $this->get_app()->get_resource( [ 'id' => $id ] );

		if ( is_wp_error( $data ) ) {
			return new \WP_Error( 'export_template_error', 'An error has occured' );
		}

		if ( static::TEMPLATE_RESOURCE_TYPE === $data['type'] ) {
			$this->handle_export_file( $data );
		}

		if ( static::FOLDER_RESOURCE_TYPE === $data['type'] ) {
			$this->handle_export_folder( $id );
		}
	}

	protected function handle_export_file( array $data ): void {
		$file_data = $this->prepare_template_export( $data );

		if ( is_wp_error( $file_data ) ) {
			return;
		}

		$this->send_file_headers( $file_data['name'], strlen( $file_data['content'] ) );

		$this->serve_file( $file_data['content'] );
	}

	protected function handle_export_folder( int $folder_id ) {
		$data = $this->get_item_children( [ 'template_id' => $folder_id ] );

		if ( empty( $data['templates'] ) ) {
			throw new \Exception( 'Folder does not have any templates to export' );
		}

		$template_ids = array_map( fn( $template ) => $template['template_id'], $data['templates'] );

		$this->export_multiple_templates( $template_ids );
	}

	private function prepare_template_export( $data ) {
		if ( empty( $data['content'] ) ) {
			throw new \Exception( 'Template data not found' );
		}

		$data['content'] = json_decode( $data['content'], true );

		if ( empty( $data['content']['content'] ) ) {
			throw new \Exception( 'The template is empty' );
		}

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

	public function export_multiple_templates( array $template_ids ) {
		$files = [];
		$temp_path = Plugin::$instance->uploads_manager->create_unique_dir();

		foreach ( $template_ids as $template_id ) {
			$files[] = $this->get_file_item( $template_id, $temp_path );
		}

		if ( empty( $files ) ) {
			throw new \Exception( 'There are no files to export (probably all the requested templates are empty).' );
		}

		list( $zip_archive_filename, $zip_complete_path ) = $this->handle_zip_file( $temp_path, $files );

		$this->send_file_headers( $zip_archive_filename, $this->filesize( $zip_complete_path ) );

		$this->serve_zip( $zip_complete_path );

		Plugin::$instance->uploads_manager->remove_file_or_dir( $temp_path );
	}

	protected function handle_zip_file( string $temp_path, array $files ): array {
		if ( ! class_exists( 'ZipArchive' ) ) {
			throw new \Error( 'ZipArchive module missing' );
		}

		$zip_archive_filename = 'elementor-templates-' . gmdate( 'Y-m-d' ) . '.zip';

		$zip_archive = new \ZipArchive();

		$zip_complete_path = $temp_path . '/' . $zip_archive_filename;

		$zip_archive->open( $zip_complete_path, \ZipArchive::CREATE );

		foreach ( $files as $file ) {
			$zip_archive->addFile( $file['path'], $file['name'] );
		}

		$zip_archive->close();

		return [ $zip_archive_filename, $zip_complete_path ];
	}

	private function get_file_item( $template_id, string $temp_path ) {
		$data      = $this->get_app()->get_resource( [ 'id' => $template_id ] );
		$file_data = $this->prepare_template_export( $data );

		if ( is_wp_error( $file_data ) ) {
			return;
		}

		$complete_path = $temp_path . $file_data['name'];

		$put_contents = file_put_contents( $complete_path, $file_data['content'] );

		if ( ! $put_contents ) {
			throw new \Exception( sprintf( 'Cannot create file "%s".', esc_html( $file_data['name'] ) ) );
		}

		return [
			'path' => $complete_path,
			'name' => $file_data['name'],
		];
	}
}
