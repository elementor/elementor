<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Core\Utils\Template_Library_Import_Export_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Global_Classes {

	public static function add_global_classes_snapshot( array $snapshots, $content, $template_id, array $export_data ): array {
		if ( ! is_array( $content ) ) {
			return $snapshots;
		}

		if ( ! empty( $snapshots['global_classes'] ) ) {
			return $snapshots;
		}

		$snapshot = Template_Library_Global_Classes_Snapshot_Builder::build_snapshot_for_elements( $content );

		if ( ! empty( $snapshot ) ) {
			$snapshots['global_classes'] = $snapshot;
		}

		return $snapshots;
	}

	public static function extract_global_classes_from_data( array $snapshots, array $decoded_data, array $data ): array {
		$snapshot = $decoded_data['global_classes'] ?? null;

		if ( ! empty( $snapshot ) && is_array( $snapshot ) ) {
			$snapshots['global_classes'] = $snapshot;
		}

		return $snapshots;
	}

	public static function process_global_classes_import( array $result, string $import_mode, array $data ): array {
		$snapshot = $data['global_classes'] ?? null;

		if ( empty( $snapshot ) || ! is_array( $snapshot ) ) {
			return $result;
		}

		$snapshot = apply_filters(
			'elementor/global_classes/import/transform_snapshot',
			$snapshot,
			$import_mode,
			$result,
			$data
		);

		$processed = Template_Library_Import_Export_Utils::process_import_by_mode(
			$import_mode,
			$result['content'],
			$snapshot,
			[ Template_Library_Global_Classes_Snapshot_Builder::class, 'merge_snapshot_and_get_id_map' ],
			[ Template_Library_Global_Classes_Snapshot_Builder::class, 'create_snapshot_as_new' ],
			[ Template_Library_Global_Classes_Element_Transformer::class, 'rewrite_elements_classes_ids' ],
			[ Template_Library_Global_Classes_Element_Transformer::class, 'flatten_elements_classes' ]
		);

		$result['content'] = $processed['content'];
		$result['updated_global_classes'] = $processed['operation_result']['global_classes'] ?? null;
		$result['classes_to_flatten'] = $processed['ids_to_flatten'];

		return $result;
	}
}
