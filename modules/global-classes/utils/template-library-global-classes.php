<?php

namespace Elementor\Modules\GlobalClasses\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Global_Classes {
	const IMPORT_MODE_MATCH_SITE = 'match_site';
	const IMPORT_MODE_KEEP_CREATE = 'keep_create';
	const IMPORT_MODE_KEEP_FLATTEN = 'keep_flatten';

	public static function add_global_classes_snapshot( array $snapshots, $content, $template_id, array $export_data ): array {
		if ( ! is_array( $content ) ) {
			return $snapshots;
		}

		if ( ! empty( $snapshots['global_classes'] ) ) {
			return $snapshots;
		}

		$snapshot = self::build_snapshot_for_elements( $content );

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

		$content = $result['content'];

		switch ( $import_mode ) {
			case self::IMPORT_MODE_KEEP_FLATTEN:
				$content = self::flatten_elements_classes( $content, $snapshot );
				break;

			case self::IMPORT_MODE_KEEP_CREATE:
				$create_result = self::create_all_as_new( $snapshot );
				$id_map = $create_result['id_map'] ?? [];
				$classes_to_flatten = $create_result['ids_to_flatten'] ?? [];

				if ( ! empty( $id_map ) ) {
					$content = self::rewrite_elements_classes_ids( $content, $id_map );
				}

				if ( ! empty( $classes_to_flatten ) ) {
					$content = self::flatten_elements_classes( $content, $snapshot, $classes_to_flatten );
				}

				$result['updated_global_classes'] = $create_result['global_classes'] ?? null;
				break;

			case self::IMPORT_MODE_MATCH_SITE:
			default:
				$merge_result = self::merge_snapshot_and_get_id_map( $snapshot );
				$id_map = $merge_result['id_map'] ?? [];
				$classes_to_flatten = $merge_result['ids_to_flatten'] ?? [];

				if ( ! empty( $id_map ) ) {
					$content = self::rewrite_elements_classes_ids( $content, $id_map );
				}

				if ( ! empty( $classes_to_flatten ) ) {
					$content = self::flatten_elements_classes( $content, $snapshot, $classes_to_flatten );
				}

				$result['updated_global_classes'] = $merge_result['global_classes'] ?? null;
				break;
		}

		$result['content'] = $content;

		return $result;
	}

	public static function extract_used_class_ids_from_elements( array $elements ): array {
		return Template_Library_Global_Classes_Snapshot_Builder::extract_used_class_ids_from_elements( $elements );
	}

	public static function build_snapshot_for_ids( array $ids ): ?array {
		return Template_Library_Global_Classes_Snapshot_Builder::build_snapshot_for_ids( $ids );
	}

	public static function build_snapshot_for_elements( array $elements ): ?array {
		return Template_Library_Global_Classes_Snapshot_Builder::build_snapshot_for_elements( $elements );
	}

	public static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		return Template_Library_Global_Classes_Snapshot_Builder::merge_snapshot_and_get_id_map( $snapshot );
	}

	public static function rewrite_elements_classes_ids( array $elements, array $id_map ): array {
		return Template_Library_Global_Classes_Element_Transformer::rewrite_elements_classes_ids( $elements, $id_map );
	}

	public static function flatten_elements_classes( array $elements, array $global_classes, ?array $only_ids = null ): array {
		return Template_Library_Global_Classes_Element_Transformer::flatten_elements_classes( $elements, $global_classes, $only_ids );
	}

	public static function create_all_as_new( array $snapshot ): array {
		return Template_Library_Global_Classes_Snapshot_Builder::create_snapshot_as_new( $snapshot );
	}
}
