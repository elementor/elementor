<?php

namespace Elementor\Modules\Variables\Utils;

use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Variables {
	private static function get_variable_types(): array {
		return [
			Color_Variable_Prop_Type::get_key(),
			Font_Variable_Prop_Type::get_key(),
			Size_Variable_Prop_Type::get_key(),
			Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
		];
	}

	public static function extract_used_variable_ids_from_elements( array $elements ): array {
		$ids = [];
		$variable_types = self::get_variable_types();

		if ( empty( $elements ) ) {
			return [];
		}

		Plugin::$instance->db->iterate_data(
			$elements,
			function ( $element_data ) use ( &$ids, $variable_types ) {
				if ( ! empty( $element_data['settings'] ) && is_array( $element_data['settings'] ) ) {
					self::extract_variable_ids_recursive( $element_data['settings'], $ids, $variable_types );
				}

				if ( ! empty( $element_data['styles'] ) && is_array( $element_data['styles'] ) ) {
					self::extract_variable_ids_recursive( $element_data['styles'], $ids, $variable_types );
				}

				return $element_data;
			}
		);

		return array_values( array_unique( $ids ) );
	}

	private static function extract_variable_ids_recursive( $data, array &$ids, array $variable_types ): void {
		if ( ! is_array( $data ) ) {
			return;
		}

		if ( isset( $data['$$type'] ) && in_array( $data['$$type'], $variable_types, true ) ) {
			if ( isset( $data['value'] ) && is_string( $data['value'] ) && '' !== $data['value'] ) {
				$ids[] = $data['value'];
			}
		}

		foreach ( $data as $value ) {
			if ( is_array( $value ) ) {
				self::extract_variable_ids_recursive( $value, $ids, $variable_types );
			}
		}
	}

	public static function build_snapshot_for_ids( array $ids ): ?array {
		if ( empty( $ids ) ) {
			return null;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return null;
		}

		$ids = array_values(
			array_unique(
				array_filter( $ids, fn( $id ) => is_string( $id ) && '' !== $id )
			)
		);

		if ( empty( $ids ) ) {
			return null;
		}

		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();
		$all_data = $collection->serialize();
		$all_variables = $all_data['data'] ?? [];

		$filtered_data = [];
		foreach ( $ids as $id ) {
			if ( isset( $all_variables[ $id ] ) ) {
				$filtered_data[ $id ] = $all_variables[ $id ];
			}
		}

		if ( empty( $filtered_data ) ) {
			return null;
		}

		return [
			'data' => $filtered_data,
			'watermark' => 0,
			'version' => $all_data['version'] ?? Variables_Collection::FORMAT_VERSION_V1,
		];
	}

	public static function build_snapshot_for_elements( array $elements, ?array $global_classes_snapshot = null ): ?array {
		$ids = self::extract_used_variable_ids_from_elements( $elements );

		if ( ! empty( $global_classes_snapshot ) ) {
			$ids_from_classes = self::extract_variable_ids_from_data( $global_classes_snapshot );
			$ids = array_merge( $ids, $ids_from_classes );
		}

		$ids = array_values( array_unique( $ids ) );

		if ( empty( $ids ) ) {
			return null;
		}

		return self::build_snapshot_for_ids( $ids );
	}

	public static function extract_variable_ids_from_data( array $data ): array {
		$ids = [];
		$variable_types = self::get_variable_types();
		self::extract_variable_ids_recursive( $data, $ids, $variable_types );
		return array_values( array_unique( $ids ) );
	}

	public static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$incoming_data = $snapshot['data'] ?? [];
		if ( empty( $incoming_data ) ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();
		$current_data = $collection->serialize();
		$current_variables = $current_data['data'] ?? [];

		$existing_labels = [];
		foreach ( $current_variables as $variable ) {
			if ( isset( $variable['label'] ) && is_string( $variable['label'] ) ) {
				$existing_labels[] = $variable['label'];
			}
		}

		$id_map = [];
		$ids_to_flatten = [];
		$updated_variables = $current_variables;
		$existing_ids = array_fill_keys( array_keys( $updated_variables ), true );

		foreach ( $incoming_data as $incoming_id => $incoming_variable ) {
			if ( empty( $incoming_variable ) ) {
				continue;
			}

			$target_id = $incoming_id;

			if ( isset( $existing_ids[ $incoming_id ] ) ) {
				$is_same = Template_Library_Import_Export_Utils::items_equal( $updated_variables[ $incoming_id ], $incoming_variable );

				if ( $is_same ) {
					continue;
				}

				$target_id = Template_Library_Import_Export_Utils::generate_unique_id( array_keys( $updated_variables ), 'e-gv-' );
				$id_map[ $incoming_id ] = $target_id;
			}

			if ( self::count_active_variables( $updated_variables ) >= Variables_Collection::TOTAL_VARIABLES_COUNT ) {
				$ids_to_flatten[] = $incoming_id;
				continue;
			}

			if ( isset( $incoming_variable['label'] ) && is_string( $incoming_variable['label'] ) && '' !== $incoming_variable['label'] ) {
				$label = $incoming_variable['label'];

				if ( in_array( $label, $existing_labels, true ) ) {
					$label = Template_Library_Import_Export_Utils::generate_unique_label( $label, $existing_labels );
					$incoming_variable['label'] = $label;
				}

				$existing_labels[] = $label;
			}

			$updated_variables[ $target_id ] = $incoming_variable;
			$existing_ids[ $target_id ] = true;
		}

		$updated_collection = Variables_Collection::hydrate( [
			'data' => $updated_variables,
			'watermark' => $current_data['watermark'] ?? 0,
			'version' => $current_data['version'] ?? Variables_Collection::FORMAT_VERSION_V1,
		] );

		$repository->save( $updated_collection );

		return [
			'id_map' => $id_map,
			'ids_to_flatten' => $ids_to_flatten,
			'variables' => [
				'data' => $updated_variables,
				'watermark' => $updated_collection->watermark(),
			],
		];
	}

	private static function count_active_variables( array $variables ): int {
		$count = 0;
		foreach ( $variables as $variable ) {
			if ( empty( $variable['deleted'] ) ) {
				++$count;
			}
		}
		return $count;
	}

	public static function rewrite_elements_variable_ids( array $elements, array $id_map ): array {
		if ( empty( $elements ) || empty( $id_map ) ) {
			return $elements;
		}

		$variable_types = self::get_variable_types();

		return Plugin::$instance->db->iterate_data(
			$elements,
			function ( $element_data ) use ( $id_map, $variable_types ) {
				if ( ! empty( $element_data['settings'] ) && is_array( $element_data['settings'] ) ) {
					$element_data['settings'] = self::rewrite_variable_ids_recursive( $element_data['settings'], $id_map, $variable_types );
				}

				if ( ! empty( $element_data['styles'] ) && is_array( $element_data['styles'] ) ) {
					$element_data['styles'] = self::rewrite_variable_ids_recursive( $element_data['styles'], $id_map, $variable_types );
				}

				return $element_data;
			}
		);
	}

	private static function rewrite_variable_ids_recursive( $data, array $id_map, array $variable_types ) {
		if ( ! is_array( $data ) ) {
			return $data;
		}

		if ( isset( $data['$$type'] ) && in_array( $data['$$type'], $variable_types, true ) ) {
			if ( isset( $data['value'] ) && is_string( $data['value'] ) && isset( $id_map[ $data['value'] ] ) ) {
				$data['value'] = $id_map[ $data['value'] ];
			}
			return $data;
		}

		foreach ( $data as $key => $value ) {
			if ( is_array( $value ) ) {
				$data[ $key ] = self::rewrite_variable_ids_recursive( $value, $id_map, $variable_types );
			}
		}

		return $data;
	}

	public static function flatten_elements_variables( array $elements, array $global_variables, ?array $only_ids = null ): array {
		$variable_data = $global_variables['data'] ?? [];

		if ( empty( $elements ) || empty( $variable_data ) ) {
			return $elements;
		}

		$variable_types = self::get_variable_types();
		$ids_to_flatten = null !== $only_ids ? array_fill_keys( $only_ids, true ) : null;

		return Plugin::$instance->db->iterate_data(
			$elements,
			function ( $element_data ) use ( $variable_data, $variable_types, $ids_to_flatten ) {
				if ( ! empty( $element_data['settings'] ) && is_array( $element_data['settings'] ) ) {
					$element_data['settings'] = self::flatten_variable_refs_recursive( $element_data['settings'], $variable_data, $variable_types, $ids_to_flatten );
				}

				if ( ! empty( $element_data['styles'] ) && is_array( $element_data['styles'] ) ) {
					$element_data['styles'] = self::flatten_variable_refs_recursive( $element_data['styles'], $variable_data, $variable_types, $ids_to_flatten );
				}

				return $element_data;
			}
		);
	}

	private static function flatten_variable_refs_recursive( $data, array $variable_data, array $variable_types, ?array $ids_to_flatten = null ) {
		if ( ! is_array( $data ) ) {
			return $data;
		}

		if ( isset( $data['$$type'] ) && in_array( $data['$$type'], $variable_types, true ) ) {
			$var_id = $data['value'] ?? null;

			if ( is_string( $var_id ) && isset( $variable_data[ $var_id ] ) ) {
				if ( null !== $ids_to_flatten && ! isset( $ids_to_flatten[ $var_id ] ) ) {
					return $data;
				}

				$variable = $variable_data[ $var_id ];
				$resolved_value = $variable['value'] ?? null;
				$resolved_type = self::get_resolved_type( $data['$$type'] );

				if ( null !== $resolved_value && null !== $resolved_type ) {
					return [
						'$$type' => $resolved_type,
						'value' => $resolved_value,
					];
				}
			}

			return $data;
		}

		foreach ( $data as $key => $value ) {
			if ( is_array( $value ) ) {
				$data[ $key ] = self::flatten_variable_refs_recursive( $value, $variable_data, $variable_types, $ids_to_flatten );
			}
		}

		return $data;
	}

	private static function get_resolved_type( string $variable_type ): ?string {
		$type_map = [
			Color_Variable_Prop_Type::get_key() => 'color',
			Font_Variable_Prop_Type::get_key() => 'font-family',
			Size_Variable_Prop_Type::get_key() => 'size',
			Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY => 'size',
		];

		return $type_map[ $variable_type ] ?? null;
	}

	public static function create_all_as_new( array $snapshot ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$incoming_data = $snapshot['data'] ?? [];
		if ( empty( $incoming_data ) ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();
		$current_data = $collection->serialize();
		$current_variables = $current_data['data'] ?? [];

		$existing_labels = [];
		foreach ( $current_variables as $variable ) {
			if ( isset( $variable['label'] ) && is_string( $variable['label'] ) ) {
				$existing_labels[] = $variable['label'];
			}
		}

		$id_map = [];
		$ids_to_flatten = [];
		$updated_variables = $current_variables;

		foreach ( $incoming_data as $incoming_id => $incoming_variable ) {
			if ( empty( $incoming_variable ) ) {
				continue;
			}

			if ( self::count_active_variables( $updated_variables ) >= Variables_Collection::TOTAL_VARIABLES_COUNT ) {
				$ids_to_flatten[] = $incoming_id;
				continue;
			}

			$new_id = Template_Library_Import_Export_Utils::generate_unique_id( array_keys( $updated_variables ), 'e-gv-' );
			$id_map[ $incoming_id ] = $new_id;

			if ( isset( $incoming_variable['label'] ) && is_string( $incoming_variable['label'] ) && '' !== $incoming_variable['label'] ) {
				$label = $incoming_variable['label'];

				if ( in_array( $label, $existing_labels, true ) ) {
					$label = Template_Library_Import_Export_Utils::generate_unique_label( $label, $existing_labels );
					$incoming_variable['label'] = $label;
				}

				$existing_labels[] = $label;
			}

			$updated_variables[ $new_id ] = $incoming_variable;
		}

		$updated_collection = Variables_Collection::hydrate( [
			'data' => $updated_variables,
			'watermark' => $current_data['watermark'] ?? 0,
			'version' => $current_data['version'] ?? Variables_Collection::FORMAT_VERSION_V1,
		] );

		$repository->save( $updated_collection );

		return [
			'id_map' => $id_map,
			'ids_to_flatten' => $ids_to_flatten,
			'variables' => [
				'data' => $updated_variables,
				'watermark' => $updated_collection->watermark(),
			],
		];
	}
}
