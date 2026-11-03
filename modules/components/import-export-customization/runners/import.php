<?php

namespace Elementor\Modules\Components\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Modules\Components\Utils\Component_Title_Duplicator;
use Elementor\Modules\Components\Utils\Remap_Override_Schema_Source;
use Elementor\Modules\Components\Utils\Sort_Components_By_Dependencies;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	const IMPORT_STATUS_SUCCEEDED = 'succeed';
	const IMPORT_STATUS_FAILED = 'failed';

	public static function get_name(): string {
		return 'components';
	}

	public function should_import( array $data ) {
		return (
			Components_Module::is_import_export_supported() &&
			in_array( 'content', $data['include'] ?? [], true ) &&
			! empty( $data['manifest'][ Component_Document::EXPORT_MANIFEST_KEY ] ) &&
			! empty( $data['extracted_directory_path'] )
		);
	}

	/**
	 * The result is reported under `content.elementor_component` so that
	 * `Utils::map_old_new_post_ids()` and `Utils::map_old_new_component_ids()` pick it up.
	 */
	public function import( array $data, array $imported_data ) {
		$path = $data['extracted_directory_path'] . Component_Document::EXPORT_DIRECTORY;
		$manifest = $data['manifest'][ Component_Document::EXPORT_MANIFEST_KEY ];
		$dependencies = ImportExportUtils::read_json_file( $path . Component_Document::EXPORT_DEPENDENCIES_FILE_NAME )['dependencies'] ?? [];

		$result = [
			static::IMPORT_STATUS_SUCCEEDED => [],
			static::IMPORT_STATUS_FAILED => [],
		];

		Component_Title_Duplicator::reset();

		try {
			foreach ( Sort_Components_By_Dependencies::apply( $manifest, $dependencies ) as $source_id => $summary ) {
				try {
					$result[ static::IMPORT_STATUS_SUCCEEDED ][ $source_id ] = $this->import_component(
						$path,
						(int) $source_id,
						(array) $summary,
						(string) ( $data['session_id'] ?? '' ),
						$result[ static::IMPORT_STATUS_SUCCEEDED ]
					);
				} catch ( \Exception $error ) {
					$result[ static::IMPORT_STATUS_FAILED ][ $source_id ] = $error->getMessage();
				}
			}
		} finally {
			Component_Title_Duplicator::reset();
		}

		return [
			'content' => [
				Component_Document::TYPE => $result,
			],
		];
	}

	private function import_component( string $path, int $source_id, array $summary, string $session_id, array $imported_component_ids ): int {
		$post_data = ImportExportUtils::read_json_file( $path . $source_id );

		if ( empty( $post_data ) ) {
			throw new \Exception( esc_html__( 'Component file is missing or invalid.', 'elementor' ) );
		}

		$post_data['metadata'] = $this->remap_overridable_props_schema_source( $post_data['metadata'] ?? [], $imported_component_ids );

		$document = Plugin::$instance->documents->create(
			Component_Document::TYPE,
			[
				'post_title' => $summary['title'] ?? '',
				'post_type' => Component_Document::TYPE,
				'post_status' => 'publish',
			]
		);

		if ( is_wp_error( $document ) ) {
			throw new \Exception( esc_html( $document->get_error_message() ) );
		}

		if ( ! $document instanceof Component_Document ) {
			throw new \Exception( esc_html__( 'Failed to create component.', 'elementor' ) );
		}

		$post_data['content'] = $post_data['content'] ?? [];
		$post_data['settings'] = $post_data['settings'] ?? [];
		$post_data['import_settings'] = $summary + [ 'thumbnail' => '' ];

		$new_attachment_callback = function ( $attachment_id ) use ( $session_id ) {
			$this->set_session_post_meta( $attachment_id, $session_id );
		};

		add_filter( 'elementor/template_library/import_images/new_attachment', $new_attachment_callback );

		try {
			$document->import( $post_data );
		} catch ( \Exception $error ) {
			$document->force_delete();

			throw $error;
		} finally {
			remove_filter( 'elementor/template_library/import_images/new_attachment', $new_attachment_callback );
		}

		$new_post_id = $document->get_main_id();

		$this->set_session_post_meta( $new_post_id, $session_id );

		return $new_post_id;
	}

	/**
	 * Overridable props meta is written as-is, so the `originValue.schema_source.id` of props
	 * exposed from nested components is remapped here. Components are imported dependencies
	 * first, so nested components already have their destination ids.
	 */
	private function remap_overridable_props_schema_source( array $metadata, array $imported_component_ids ): array {
		$props = $metadata[ Component_Document::OVERRIDABLE_PROPS_META_KEY ]['props'] ?? null;

		if ( empty( $imported_component_ids ) || ! is_array( $props ) ) {
			return $metadata;
		}

		foreach ( $props as $key => $prop ) {
			if ( is_array( $prop['originValue'] ?? null ) ) {
				$metadata[ Component_Document::OVERRIDABLE_PROPS_META_KEY ]['props'][ $key ]['originValue'] = Remap_Override_Schema_Source::apply( $prop['originValue'], $imported_component_ids );
			}
		}

		return $metadata;
	}
}
