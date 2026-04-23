<?php

namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\App\Modules\ImportExportCustomization\Data\Response;
use Elementor\App\Modules\ImportExportCustomization\Module as ImportExportCustomizationModule;
use Elementor\Core\Utils\Str;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Import_Export_Customization as Global_Classes_Import_Export;
use Elementor\Modules\GlobalClasses\Module as Global_Classes_Module;
use Elementor\Modules\Variables\ImportExportCustomization\Import_Export_Customization as Variables_Import_Export;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use Elementor\Utils as ElementorUtils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Export Design Tokens Route
 *
 * Exports only Global Classes and Global Variables (design tokens) without
 * templates, content, plugins, or other site settings.
 */
class Export_Design_Tokens extends Base_Route {
	const ZIP_ARCHIVE_MODULE_MISSING = 'zip-archive-module-is-missing';

	protected function get_route(): string {
		return 'export-design-tokens';
	}

	protected function get_method(): string {
		return \WP_REST_Server::CREATABLE;
	}

	protected function callback( $request ): \WP_REST_Response {
		try {
			$result = $this->export();

			return Response::success( [
				'file' => base64_encode( $result['file'] ),
				'file_name' => $result['file_name'] . '.zip',
			] );

		} catch ( \Error | \Exception $e ) {
			Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
				'meta' => [
					'trace' => $e->getTraceAsString(),
				],
			] );

			return Response::error( $e->getMessage(), 'export_design_tokens_error' );
		}
	}

	private function export(): array {
		if ( ! class_exists( '\ZipArchive' ) ) {
			throw new \Error( self::ZIP_ARCHIVE_MODULE_MISSING );
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			throw new \Error( 'no-active-kit' );
		}

		$site_name = get_bloginfo( 'name' );
		$file_name = sanitize_title( $site_name ) . '-design-system';

		$temp_dir = Plugin::$instance->uploads_manager->create_unique_dir();
		$zip_file_name = $temp_dir . $file_name . '.zip';

		$zip = new \ZipArchive();
		$zip->open( $zip_file_name, \ZipArchive::CREATE | \ZipArchive::OVERWRITE );

		$manifest = $this->create_manifest( $file_name, $kit );

		$classes_data = $this->get_classes_data();
		if ( ! empty( $classes_data ) ) {
			$this->add_json_file( $zip, Global_Classes_Import_Export::FILE_NAME, $classes_data );
			$manifest['classes_count'] = count( $classes_data['items'] ?? [] );
		}

		$variables_data = $this->get_variables_data( $kit );
		if ( ! empty( $variables_data ) ) {
			$this->add_json_file( $zip, Variables_Import_Export::FILE_NAME, $variables_data );
			$manifest['variables_count'] = count( $variables_data['data'] ?? [] );
		}

		$this->add_json_file( $zip, 'manifest', $manifest );

		$zip->close();

		$file = ElementorUtils::file_get_contents( $zip_file_name );

		Plugin::$instance->uploads_manager->remove_file_or_dir( $temp_dir );

		if ( ! $file ) {
			throw new \Error( 'file-creation-failed' );
		}

		return [
			'manifest' => $manifest,
			'file' => $file,
			'file_name' => $file_name,
		];
	}

	private function create_manifest( string $file_name, $kit ): array {
		$kit_post = $kit->get_post();

		return [
			'name' => $file_name,
			'title' => $file_name,
			'author' => get_the_author_meta( 'display_name', $kit_post->post_author ),
			'version' => ImportExportCustomizationModule::FORMAT_VERSION,
			'elementor_version' => ELEMENTOR_VERSION,
			'created' => gmdate( 'Y-m-d H:i:s' ),
			'site' => get_site_url(),
			'type' => 'design-tokens',
		];
	}

	private function get_classes_data(): ?array {
		if ( ! $this->is_classes_feature_active() ) {
			return null;
		}

		$global_classes = Global_Classes_Repository::make()->all()->get();
		$result = Global_Classes_Parser::make()->parse( $global_classes );

		if ( ! $result->is_valid() ) {
			return null;
		}

		$classes_data = $result->unwrap();

		return empty( $classes_data['items'] ) ? null : $classes_data;
	}

	private function get_variables_data( $kit ): ?array {
		if ( ! $this->is_variables_feature_active() ) {
			return null;
		}

		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();
		$variables_data = $collection->serialize();

		return empty( $variables_data['data'] ) ? null : $variables_data;
	}

	private function is_classes_feature_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Global_Classes_Module::NAME )
			&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	private function is_variables_feature_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	private function add_json_file( \ZipArchive $zip, string $path, array $content ): void {
		if ( ! Str::ends_with( $path, '.json' ) ) {
			$path .= '.json';
		}

		$zip->addFromString( $path, wp_json_encode( $content ) );
	}

	/**
	 * Write classes data to a temporary file in chunks to avoid memory issues with large datasets.
	 * Each class is JSON encoded separately and written to the file incrementally.
	 *
	 * @param \ZipArchive $zip The ZIP archive to add the file to.
	 * @param string $path The path within the ZIP for the JSON file.
	 * @param array $classes_data The classes data with 'items' and 'order' keys.
	 * @param string $temp_dir Temporary directory for the file.
	 * @return int Number of classes written.
	 */
	private function add_classes_json_chunked( \ZipArchive $zip, string $path, array $classes_data, string $temp_dir ): int {
		if ( ! Str::ends_with( $path, '.json' ) ) {
			$path .= '.json';
		}

		$temp_file = $temp_dir . 'classes_temp.json';
		$handle = fopen( $temp_file, 'w' );

		if ( ! $handle ) {
			throw new \Error( 'failed-to-create-temp-file' );
		}

		$items = $classes_data['items'] ?? [];
		$order = $classes_data['order'] ?? [];
		$count = 0;

		fwrite( $handle, '{"items":{' );

		$first = true;
		foreach ( $items as $id => $class ) {
			if ( ! $first ) {
				fwrite( $handle, ',' );
			}
			fwrite( $handle, wp_json_encode( $id ) . ':' . wp_json_encode( $class ) );
			$first = false;
			$count++;
		}

		fwrite( $handle, '},"order":' . wp_json_encode( $order ) . '}' );
		fclose( $handle );

		$zip->addFile( $temp_file, $path );

		return $count;
	}

	/**
	 * Write variables data to a temporary file in chunks to avoid memory issues with large datasets.
	 *
	 * @param \ZipArchive $zip The ZIP archive to add the file to.
	 * @param string $path The path within the ZIP for the JSON file.
	 * @param array $variables_data The variables data with 'data', 'watermark', and 'version' keys.
	 * @param string $temp_dir Temporary directory for the file.
	 * @return int Number of variables written.
	 */
	private function add_variables_json_chunked( \ZipArchive $zip, string $path, array $variables_data, string $temp_dir ): int {
		if ( ! Str::ends_with( $path, '.json' ) ) {
			$path .= '.json';
		}

		$temp_file = $temp_dir . 'variables_temp.json';
		$handle = fopen( $temp_file, 'w' );

		if ( ! $handle ) {
			throw new \Error( 'failed-to-create-temp-file' );
		}

		$data = $variables_data['data'] ?? [];
		$watermark = $variables_data['watermark'] ?? 0;
		$version = $variables_data['version'] ?? 1;
		$count = 0;

		fwrite( $handle, '{"data":{' );

		$first = true;
		foreach ( $data as $id => $variable ) {
			if ( ! $first ) {
				fwrite( $handle, ',' );
			}
			fwrite( $handle, wp_json_encode( $id ) . ':' . wp_json_encode( $variable ) );
			$first = false;
			$count++;
		}

		fwrite( $handle, '},"watermark":' . wp_json_encode( $watermark ) . ',"version":' . wp_json_encode( $version ) . '}' );
		fclose( $handle );

		$zip->addFile( $temp_file, $path );

		return $count;
	}

	protected function get_args(): array {
		return [];
	}
}
