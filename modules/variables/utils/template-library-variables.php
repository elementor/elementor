<?php

namespace Elementor\Modules\Variables\Utils;

use Elementor\Core\Utils\Template_Library_Import_Export_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Variables {

	public static function add_variables_snapshot( array $snapshots, $content, $template_id, array $export_data ): array {
		if ( ! is_array( $content ) ) {
			return $snapshots;
		}

		if ( ! empty( $snapshots['global_variables'] ) ) {
			return $snapshots;
		}

		$global_classes_snapshot = $snapshots['global_classes'] ?? null;
		$snapshot = self::build_snapshot_for_elements( $content, $global_classes_snapshot );

		if ( ! empty( $snapshot ) ) {
			$snapshots['global_variables'] = $snapshot;
		}

		return $snapshots;
	}

	public static function extract_variables_from_data( array $snapshots, array $decoded_data, array $data ): array {
		$snapshot = $decoded_data['global_variables'] ?? null;

		if ( ! empty( $snapshot ) && is_array( $snapshot ) ) {
			$snapshots['global_variables'] = $snapshot;
		}

		return $snapshots;
	}

	public static function process_variables_import( array $result, string $import_mode, array $data ): array {
		$snapshot = $data['global_variables'] ?? null;

		if ( empty( $snapshot ) || ! is_array( $snapshot ) ) {
			return $result;
		}

		$content = $result['content'];

		switch ( $import_mode ) {
			case Template_Library_Import_Export_Utils::IMPORT_MODE_KEEP_FLATTEN:
				$content = self::flatten_elements_variables( $content, $snapshot );
				break;

			case Template_Library_Import_Export_Utils::IMPORT_MODE_KEEP_CREATE:
				$create_result = self::create_all_as_new( $snapshot );
				$id_map = $create_result['id_map'] ?? [];
				$variables_to_flatten = $create_result['ids_to_flatten'] ?? [];

				if ( ! empty( $id_map ) ) {
					$content = self::rewrite_elements_variable_ids( $content, $id_map );
				}

				if ( ! empty( $variables_to_flatten ) ) {
					$content = self::flatten_elements_variables( $content, $snapshot, $variables_to_flatten );
				}

				$result['updated_global_variables'] = $create_result['variables'] ?? null;
				$result['variables_id_map'] = $id_map;
				$result['variables_to_flatten'] = $variables_to_flatten;
				$result['variables_snapshot'] = $snapshot;
				break;

			case Template_Library_Import_Export_Utils::IMPORT_MODE_MATCH_SITE:
			default:
				$merge_result = self::merge_snapshot_and_get_id_map( $snapshot );
				$id_map = $merge_result['id_map'] ?? [];
				$variables_to_flatten = $merge_result['ids_to_flatten'] ?? [];

				if ( ! empty( $id_map ) ) {
					$content = self::rewrite_elements_variable_ids( $content, $id_map );
				}

				if ( ! empty( $variables_to_flatten ) ) {
					$content = self::flatten_elements_variables( $content, $snapshot, $variables_to_flatten );
				}

				$result['updated_global_variables'] = $merge_result['variables'] ?? null;
				$result['variables_id_map'] = $id_map;
				$result['variables_to_flatten'] = $variables_to_flatten;
				$result['variables_snapshot'] = $snapshot;
				break;
		}

		$result['content'] = $content;

		return $result;
	}

	private static function build_snapshot_for_elements( array $elements, ?array $global_classes_snapshot = null ): ?array {
		return Template_Library_Variables_Snapshot_Builder::build_snapshot_for_elements( $elements, $global_classes_snapshot );
	}

	private static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		return Template_Library_Variables_Snapshot_Builder::merge_snapshot_and_get_id_map( $snapshot );
	}

	private static function rewrite_elements_variable_ids( array $elements, array $id_map ): array {
		return Template_Library_Variables_Element_Transformer::rewrite_elements_variable_ids( $elements, $id_map );
	}

	private static function flatten_elements_variables( array $elements, array $global_variables, ?array $only_ids = null ): array {
		return Template_Library_Variables_Element_Transformer::flatten_elements_variables( $elements, $global_variables, $only_ids );
	}

	private static function create_all_as_new( array $snapshot ): array {
		return Template_Library_Variables_Snapshot_Builder::create_snapshot_as_new( $snapshot );
	}

	public static function transform_variables_in_classes_snapshot( array $classes_snapshot, string $import_mode, array $result, array $data ): array {
		$variables_id_map = $result['variables_id_map'] ?? [];
		$variables_to_flatten = $result['variables_to_flatten'] ?? [];
		$variables_snapshot = $result['variables_snapshot'] ?? ( $data['global_variables'] ?? null );

		if ( Template_Library_Import_Export_Utils::IMPORT_MODE_KEEP_FLATTEN === $import_mode && ! empty( $variables_snapshot ) ) {
			$classes_snapshot = self::flatten_variables_in_classes_snapshot( $classes_snapshot, $variables_snapshot );
		} else {
			if ( ! empty( $variables_id_map ) ) {
				$classes_snapshot = self::rewrite_variable_ids_in_classes_snapshot( $classes_snapshot, $variables_id_map );
			}

			if ( ! empty( $variables_to_flatten ) && ! empty( $variables_snapshot ) ) {
				$classes_snapshot = self::flatten_variables_in_classes_snapshot( $classes_snapshot, $variables_snapshot, $variables_to_flatten );
			}
		}

		return $classes_snapshot;
	}

	public static function rewrite_variable_ids_in_classes_snapshot( array $snapshot, array $id_map ): array {
		if ( empty( $snapshot['items'] ) || empty( $id_map ) ) {
			return $snapshot;
		}

		$variable_types = Variable_Type_Keys::get_all();

		foreach ( $snapshot['items'] as $class_id => &$class_item ) {
			if ( empty( $class_item['variants'] ) || ! is_array( $class_item['variants'] ) ) {
				continue;
			}

			foreach ( $class_item['variants'] as &$variant ) {
				if ( empty( $variant['props'] ) || ! is_array( $variant['props'] ) ) {
					continue;
				}

				$variant['props'] = self::rewrite_variable_refs_recursive( $variant['props'], $id_map, $variable_types );
			}
		}

		return $snapshot;
	}

	private static function rewrite_variable_refs_recursive( array $data, array $id_map, array $variable_types ): array {
		foreach ( $data as $key => $value ) {
			if ( ! is_array( $value ) ) {
				continue;
			}

			$type = $value['$$type'] ?? null;
			$val = $value['value'] ?? null;

			if ( $type && in_array( $type, $variable_types, true ) && is_string( $val ) && isset( $id_map[ $val ] ) ) {
				$data[ $key ]['value'] = $id_map[ $val ];
				continue;
			}

			$data[ $key ] = self::rewrite_variable_refs_recursive( $value, $id_map, $variable_types );
		}

		return $data;
	}

	public static function flatten_variables_in_classes_snapshot( array $classes_snapshot, array $variables_snapshot, ?array $only_ids = null ): array {
		if ( empty( $classes_snapshot['items'] ) ) {
			return $classes_snapshot;
		}

		$variable_data = $variables_snapshot['data'] ?? [];
		$variable_types = Variable_Type_Keys::get_all();
		$type_map = Variable_Type_Keys::get_type_mappings();

		$ids_to_flatten = null !== $only_ids ? array_fill_keys( $only_ids, true ) : null;

		foreach ( $classes_snapshot['items'] as $class_id => &$class_item ) {
			if ( empty( $class_item['variants'] ) || ! is_array( $class_item['variants'] ) ) {
				continue;
			}

			foreach ( $class_item['variants'] as &$variant ) {
				if ( empty( $variant['props'] ) || ! is_array( $variant['props'] ) ) {
					continue;
				}

				$variant['props'] = self::flatten_variable_refs_in_props( $variant['props'], $variable_data, $variable_types, $type_map, $ids_to_flatten );
			}
		}

		return $classes_snapshot;
	}

	private static function flatten_variable_refs_in_props( array $data, array $variable_data, array $variable_types, array $type_map, ?array $ids_to_flatten = null ): array {
		foreach ( $data as $key => $value ) {
			if ( ! is_array( $value ) ) {
				continue;
			}

			$type = $value['$$type'] ?? null;
			$var_id = $value['value'] ?? null;

			if ( $type && in_array( $type, $variable_types, true ) && is_string( $var_id ) && isset( $variable_data[ $var_id ] ) ) {
				if ( null !== $ids_to_flatten && ! isset( $ids_to_flatten[ $var_id ] ) ) {
					continue;
				}

				$resolved_type = $type_map[ $type ] ?? null;
				$resolved_value = $variable_data[ $var_id ]['value'] ?? null;

				if ( $resolved_type && null !== $resolved_value ) {
					$data[ $key ] = [
						'$$type' => $resolved_type,
						'value' => $resolved_value,
					];
				}
				continue;
			}

			$data[ $key ] = self::flatten_variable_refs_in_props( $value, $variable_data, $variable_types, $type_map, $ids_to_flatten );
		}

		return $data;
	}
}
