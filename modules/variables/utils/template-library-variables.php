<?php

namespace Elementor\Modules\Variables\Utils;

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
	const LABEL_PREFIX = 'DUP_';
	const MAX_LABEL_LENGTH = 50;

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
				self::extract_variable_ids_recursive( $element_data, $ids, $variable_types );
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
			return;
		}

		foreach ( $data as $value ) {
			self::extract_variable_ids_recursive( $value, $ids, $variable_types );
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

	public static function build_snapshot_for_elements( array $elements ): ?array {
		$ids = self::extract_used_variable_ids_from_elements( $elements );

		if ( empty( $ids ) ) {
			return null;
		}

		return self::build_snapshot_for_ids( $ids );
	}

	public static function merge_snapshot_and_get_id_map( array $snapshot ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return [ 'id_map' => [] ];
		}

		$incoming_data = $snapshot['data'] ?? [];
		if ( empty( $incoming_data ) ) {
			return [ 'id_map' => [] ];
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
		$updated_variables = $current_variables;
		$existing_ids = array_fill_keys( array_keys( $updated_variables ), true );

		foreach ( $incoming_data as $incoming_id => $incoming_variable ) {
			if ( empty( $incoming_variable ) ) {
				continue;
			}

			$target_id = $incoming_id;

			if ( isset( $existing_ids[ $incoming_id ] ) ) {
				$is_same = self::variables_equal( $updated_variables[ $incoming_id ], $incoming_variable );

				if ( $is_same ) {
					continue;
				}

				$target_id = self::generate_unique_id( array_keys( $updated_variables ) );
				$id_map[ $incoming_id ] = $target_id;
			}

			if ( isset( $incoming_variable['label'] ) && is_string( $incoming_variable['label'] ) && '' !== $incoming_variable['label'] ) {
				$label = $incoming_variable['label'];

				if ( in_array( $label, $existing_labels, true ) ) {
					$label = self::generate_unique_label( $label, $existing_labels );
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
			'variables' => [
				'data' => $updated_variables,
				'watermark' => $updated_collection->watermark(),
			],
		];
	}

	public static function rewrite_elements_variable_ids( array $elements, array $id_map ): array {
		if ( empty( $elements ) || empty( $id_map ) ) {
			return $elements;
		}

		$variable_types = self::get_variable_types();

		return Plugin::$instance->db->iterate_data(
			$elements,
			function ( $element_data ) use ( $id_map, $variable_types ) {
				$element_data = self::rewrite_variable_ids_recursive( $element_data, $id_map, $variable_types );
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
			$data[ $key ] = self::rewrite_variable_ids_recursive( $value, $id_map, $variable_types );
		}

		return $data;
	}

	private static function variables_equal( array $a, array $b ): bool {
		$a = self::recursive_ksort( $a );
		$b = self::recursive_ksort( $b );

		return wp_json_encode( $a ) === wp_json_encode( $b );
	}

	private static function recursive_ksort( $value ) {
		if ( is_array( $value ) ) {
			foreach ( $value as $k => $v ) {
				$value[ $k ] = self::recursive_ksort( $v );
			}
			ksort( $value );
		}

		return $value;
	}

	private static function generate_unique_id( array $existing_ids ): string {
		$existing = array_fill_keys( $existing_ids, true );

		do {
			$random = substr( strtolower( dechex( wp_rand( 0, PHP_INT_MAX ) ) ), 0, 7 );
			$id = 'e-gv-' . $random;
		} while ( isset( $existing[ $id ] ) );

		return $id;
	}

	private static function generate_unique_label( string $original_label, array $existing_labels ): string {
		$prefix = self::LABEL_PREFIX;
		$max_length = self::MAX_LABEL_LENGTH;

		$has_prefix = 0 === strpos( $original_label, $prefix );

		if ( $has_prefix ) {
			$base_label = substr( $original_label, strlen( $prefix ) );
			$counter = 1;
			$new_label = $prefix . $base_label . $counter;

			while ( in_array( $new_label, $existing_labels, true ) ) {
				++$counter;
				$new_label = $prefix . $base_label . $counter;
			}

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix . $counter );
				$base_label = substr( $base_label, 0, $available_length );
				$new_label = $prefix . $base_label . $counter;
			}
		} else {
			$new_label = $prefix . $original_label;

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix );
				$new_label = $prefix . substr( $original_label, 0, $available_length );
			}

			$counter = 1;
			$base_label = substr( $original_label, 0, $available_length ?? strlen( $original_label ) );

			while ( in_array( $new_label, $existing_labels, true ) ) {
				$new_label = $prefix . $base_label . $counter;

				if ( strlen( $new_label ) > $max_length ) {
					$available_length = $max_length - strlen( $prefix . $counter );
					$base_label = substr( $original_label, 0, $available_length );
					$new_label = $prefix . $base_label . $counter;
				}

				++$counter;
			}
		}

		return $new_label;
	}
}
