<?php

namespace Elementor\Modules\ImportExportDesignSystem\Processes;

use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use ZipArchive;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Export {
	const MANIFEST_NAME = 'design-system';
	const MANIFEST_VERSION = '3.0';
	const FILE_GLOBAL_CLASSES = 'global-classes.json';
	const FILE_GLOBAL_VARIABLES = 'global-variables.json';
	const FILE_MANIFEST = 'manifest.json';

	/**
	 * @return array|\WP_Error
	 */
	public function run() {
		if ( ! function_exists( 'wp_tempnam' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		if ( ! class_exists( 'ZipArchive' ) ) {
			return new \WP_Error(
				'zip-archive-module-missing',
				__( 'PHP ZipArchive extension is not available.', 'elementor' )
			);
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return new \WP_Error(
				'no-active-kit',
				__( 'No active kit found.', 'elementor' )
			);
		}

		$classes_data = $this->get_classes_data();
		$variables_data = $this->get_variables_data( $kit );

		$classes_count = count( $classes_data['items'] ?? [] );
		$variables_count = count( $variables_data['data'] ?? [] );

		$manifest = $this->build_manifest( $classes_count, $variables_count );
		$zip_content = $this->create_zip( $manifest, $classes_data, $variables_data );

		if ( is_wp_error( $zip_content ) ) {
			return $zip_content;
		}

		return [
			'manifest' => $manifest,
			'file' => base64_encode( $zip_content ),
		];
	}

	private function get_classes_data(): array {
		$global_classes = Global_Classes_Repository::make()->all()->get();
		$global_classes_result = Global_Classes_Parser::make()->parse( $global_classes );

		if ( ! $global_classes_result->is_valid() ) {
			return [ 'items' => [], 'order' => [] ];
		}

		return $global_classes_result->unwrap();
	}

	private function get_variables_data( $kit ): array {
		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();

		return $collection->serialize();
	}

	private function build_manifest( int $classes_count, int $variables_count ): array {
		$current_user = wp_get_current_user();

		return [
			'name' => self::MANIFEST_NAME,
			'title' => 'My Design System',
			'description' => null,
			'author' => $current_user->user_email ?? null,
			'version' => self::MANIFEST_VERSION,
			'elementor_version' => ELEMENTOR_VERSION,
			'created' => gmdate( 'Y-m-d H:i:s' ),
			'thumbnail' => false,
			'site' => get_site_url(),
			'classesCount' => $classes_count,
			'variablesCount' => $variables_count,
		];
	}

	/**
	 * @return string|\WP_Error
	 */
	private function create_zip( array $manifest, array $classes_data, array $variables_data ) {
		$temp_file = wp_tempnam( 'design-system-export' );

		$zip = new ZipArchive();
		$opened = $zip->open( $temp_file, ZipArchive::CREATE | ZipArchive::OVERWRITE );

		if ( true !== $opened ) {
			return new \WP_Error(
				'zip-creation-failed',
				__( 'Failed to create ZIP file.', 'elementor' )
			);
		}

		$zip->addFromString( self::FILE_MANIFEST, wp_json_encode( $manifest, JSON_PRETTY_PRINT ) );
		$zip->addFromString( self::FILE_GLOBAL_CLASSES, wp_json_encode( $classes_data, JSON_PRETTY_PRINT ) );
		$zip->addFromString( self::FILE_GLOBAL_VARIABLES, wp_json_encode( $variables_data, JSON_PRETTY_PRINT ) );

		$zip->close();

		$content = file_get_contents( $temp_file );

		wp_delete_file( $temp_file );

		return $content;
	}
}
