<?php

namespace Elementor\Modules\ImportExportDesignSystem\Processes;

use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;
use Elementor\Modules\GlobalClasses\Import_Export_Utils;
use Elementor\Modules\Variables\Storage\Constants as Variables_Constants;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use ZipArchive;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import {
	const CONFLICT_SKIP = 'skip';
	const CONFLICT_REPLACE = 'replace';
	const SKIP_REASON_MALFORMED = 'malformed';
	const SKIP_REASON_LIMIT_REACHED = 'limit_reached';

	private string $file_path;
	private string $conflict_resolution;
	private string $extraction_dir;
	private string $temp_dir;

	public function __construct( string $file_path, string $conflict_resolution ) {
		$this->file_path = $file_path;
		$this->conflict_resolution = $conflict_resolution;
	}

	/**
	 * @return array|\WP_Error
	 */
	public function run() {
		if ( ! function_exists( 'wp_delete_file' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		if ( ! class_exists( 'ZipArchive' ) ) {
			return new \WP_Error(
				'zip-archive-module-missing',
				__( 'PHP ZipArchive extension is not available.', 'elementor' )
			);
		}

		$extraction = $this->extract_zip();
		if ( is_wp_error( $extraction ) ) {
			return $extraction;
		}

		$validation = $this->validate_structure();
		if ( is_wp_error( $validation ) ) {
			$this->cleanup();
			return $validation;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			$this->cleanup();
			return new \WP_Error( 'no-active-kit', __( 'No active kit found.', 'elementor' ) );
		}

		$classes_result = $this->import_classes();

		if ( is_wp_error( $classes_result ) ) {
			$this->cleanup();
			return $classes_result;
		}

		$variables_result = $this->import_variables( $kit );

		$this->cleanup();

		return [
			'classes' => [
				'imported' => $classes_result['imported'],
				'failed' => $classes_result['failed'],
				'conflicts' => $classes_result['conflicts'],
			],
			'variables' => [
				'imported' => $variables_result['imported'],
				'failed' => $variables_result['failed'],
				'conflicts' => $variables_result['conflicts'],
			],
		];
	}

	/**
	 * @return true|\WP_Error
	 */
	private function extract_zip() {
		$zip = new ZipArchive();
		$opened = $zip->open( $this->file_path );

		if ( true !== $opened ) {
			return new \WP_Error(
				'invalid-zip-file',
				__( 'Failed to open ZIP file.', 'elementor' )
			);
		}

		$this->temp_dir = Plugin::$instance->uploads_manager->create_unique_dir();
		$this->extraction_dir = $this->temp_dir;
		$zip->extractTo( $this->extraction_dir );
		$zip->close();

		return true;
	}

	/**
	 * @return true|\WP_Error
	 */
	private function validate_structure() {
		$base_path = $this->find_base_path();

		if ( ! $base_path ) {
			return new \WP_Error(
				'invalid-design-system-structure',
				__( 'Invalid design system file: missing manifest.json.', 'elementor' )
			);
		}

		$this->extraction_dir = $base_path;

		$manifest_path = $this->extraction_dir . Export::FILE_MANIFEST;
		$classes_path = $this->extraction_dir . Export::FILE_GLOBAL_CLASSES;
		$variables_path = $this->extraction_dir . Export::FILE_GLOBAL_VARIABLES;

		$manifest_content = file_get_contents( $manifest_path );
		$manifest = json_decode( $manifest_content, true );

		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_Error(
				'invalid-design-system-structure',
				__( 'Invalid design system file: manifest.json is not valid JSON.', 'elementor' )
			);
		}

		$classes_dir = $this->extraction_dir . 'global-classes';

		if ( ! file_exists( $classes_path ) && ! is_dir( $classes_dir ) && ! file_exists( $variables_path ) ) {
			return new \WP_Error(
				'invalid-design-system-structure',
				__( 'Invalid design system file: must contain at least one of global-classes.json, global-classes/ or global-variables.json.', 'elementor' )
			);
		}

		if ( file_exists( $variables_path ) ) {
			$variables_content = file_get_contents( $variables_path );

			if ( json_decode( $variables_content, true ) === null && json_last_error() !== JSON_ERROR_NONE ) {
				return new \WP_Error(
					'invalid-design-system-structure',
					__( 'Invalid design system file: global-variables.json is not valid JSON.', 'elementor' )
				);
			}
		}

		return true;
	}

	private function import_classes() {
		$classes_dir = $this->extraction_dir . 'global-classes';
		$empty_result = [ 'imported' => 0, 'failed' => [], 'conflicts' => [] ];

		if ( ! is_dir( $classes_dir ) ) {
			return $empty_result;
		}

		return Import_Export_Utils::import_classes( $classes_dir, [ 'conflict_resolution' => $this->conflict_resolution ] );
	}

	private function import_variables( $kit ): array {
		$variables_path = $this->extraction_dir . Export::FILE_GLOBAL_VARIABLES;
		$empty_result = [ 'imported' => 0, 'failed' => [], 'conflicts' => [] ];

		if ( ! file_exists( $variables_path ) ) {
			return $empty_result;
		}

		$imported_data = json_decode( file_get_contents( $variables_path ), true );

		if ( empty( $imported_data['data'] ) ) {
			return $empty_result;
		}

		$imported_vars = $imported_data['data'];
		$imported_vars = $this->dedupe_variable_labels_in_file( $imported_vars );

		$repository = new Variables_Repository( $kit );
		$existing_collection = $repository->load();

		$existing_labels_map = $this->build_variable_labels_map( $existing_collection );
		$existing_ids = array_keys( $existing_collection->all() );

		$imported_count = 0;
		$failed = [];
		$conflicts = [];
		$max_variables = Variables_Constants::TOTAL_VARIABLES_COUNT;

		foreach ( $imported_vars as $var_id => $var_data ) {
			$label = $var_data['label'] ?? $var_id;

			if ( ! $this->is_valid_variable( $var_data ) ) {
				$failed[] = [ 'label' => $label, 'id' => $var_id, 'reason' => self::SKIP_REASON_MALFORMED ];
				continue;
			}

			if ( isset( $var_data['deleted_at'] ) ) {
				continue;
			}

			$label_lower = strtolower( $label );

			if ( isset( $existing_labels_map[ $label_lower ] ) ) {
				if ( self::CONFLICT_SKIP === $this->conflict_resolution ) {
					$conflicts[] = $label;
					continue;
				}

				$existing_id = $existing_labels_map[ $label_lower ];
				$existing_var = $existing_collection->get( $existing_id );
				if ( $existing_var ) {
					$existing_var->apply_changes( [
						'value' => $var_data['value'],
						'type' => $var_data['type'] ?? $existing_var->type(),
					] );
					$imported_count++;
				}
				continue;
			}

			$active_count = $this->count_active_variables( $existing_collection );
			if ( $active_count >= $max_variables ) {
				$failed[] = [ 'label' => $label, 'id' => $var_id, 'reason' => self::SKIP_REASON_LIMIT_REACHED ];
				continue;
			}

			$new_id = in_array( $var_id, $existing_ids, true )
				? Utils::generate_id( 'e-gv-', $existing_ids )
				: $var_id;
			$existing_ids[] = $new_id;

			$new_variable = Variable::create_new( [
				'id' => $new_id,
				'type' => $var_data['type'],
				'label' => $label,
				'value' => $var_data['value'],
				'order' => $existing_collection->get_next_order(),
			] );

			$existing_collection->add_variable( $new_variable );
			$existing_labels_map[ $label_lower ] = $new_id;
			$imported_count++;
		}

		$repository->save( $existing_collection );

		return [ 'imported' => $imported_count, 'failed' => $failed, 'conflicts' => $conflicts ];
	}

	private function dedupe_labels_in_file( array $items, array $order ): array {
		$seen_labels = [];
		$result = [];

		foreach ( array_reverse( $order ) as $id ) {
			if ( ! isset( $items[ $id ] ) ) {
				continue;
			}

			$item = $items[ $id ];
			$label_lower = strtolower( $item['label'] ?? $id );

			if ( isset( $seen_labels[ $label_lower ] ) ) {
				continue;
			}

			$seen_labels[ $label_lower ] = true;
			$result[ $id ] = $item;
		}

		return array_reverse( $result, true );
	}

	private function dedupe_variable_labels_in_file( array $variables ): array {
		$seen_labels = [];
		$result = [];

		$reversed_ids = array_reverse( array_keys( $variables ) );

		foreach ( $reversed_ids as $id ) {
			$var = $variables[ $id ];
			$label_lower = strtolower( $var['label'] ?? $id );

			if ( isset( $seen_labels[ $label_lower ] ) ) {
				continue;
			}

			$seen_labels[ $label_lower ] = true;
			$result[ $id ] = $var;
		}

		return array_reverse( $result, true );
	}

	private function build_labels_map( array $items ): array {
		$map = [];

		foreach ( $items as $id => $item ) {
			$label = $item['label'] ?? $id;
			$map[ strtolower( $label ) ] = $id;
		}

		return $map;
	}

	private function build_variable_labels_map( Variables_Collection $collection ): array {
		$map = [];

		foreach ( $collection->all() as $variable ) {
			if ( $variable->is_deleted() ) {
				continue;
			}
			$map[ strtolower( $variable->label() ) ] = $variable->id();
		}

		return $map;
	}

	private function is_valid_variable( array $data ): bool {
		$required = [ 'type', 'label', 'value' ];

		foreach ( $required as $key ) {
			if ( ! array_key_exists( $key, $data ) ) {
				return false;
			}
		}

		if ( ! is_string( $data['label'] ) || strlen( $data['label'] ) > 50 ) {
			return false;
		}

		return true;
	}

	private function count_active_variables( Variables_Collection $collection ): int {
		$count = 0;

		foreach ( $collection->all() as $variable ) {
			if ( ! $variable->is_deleted() ) {
				$count++;
			}
		}

		return $count;
	}

	private function find_base_path(): ?string {
		$manifest_file = Export::FILE_MANIFEST;

		if ( file_exists( $this->extraction_dir . $manifest_file ) ) {
			return $this->extraction_dir;
		}

		$items = array_diff( scandir( $this->extraction_dir ), [ '.', '..', '__MACOSX' ] );

		foreach ( $items as $item ) {
			$item_path = $this->extraction_dir . $item . DIRECTORY_SEPARATOR;

			if ( is_dir( $item_path ) && file_exists( $item_path . $manifest_file ) ) {
				return $item_path;
			}
		}

		return null;
	}

	private function cleanup(): void {
		if ( empty( $this->temp_dir ) ) {
			return;
		}

		$this->recursive_delete( $this->temp_dir );
	}

	private function recursive_delete( string $dir ): void {
		if ( ! is_dir( $dir ) ) {
			return;
		}

		$files = array_diff( scandir( $dir ), [ '.', '..' ] );

		foreach ( $files as $file ) {
			$path = $dir . '/' . $file;

			if ( is_dir( $path ) ) {
				$this->recursive_delete( $path );
			} else {
				wp_delete_file( $path );
			}
		}

		rmdir( $dir );
	}

}
