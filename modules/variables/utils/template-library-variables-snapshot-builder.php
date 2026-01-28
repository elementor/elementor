<?php

namespace Elementor\Modules\Variables\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;
use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Core\Utils\Template_Library_Snapshot_Utils;
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

class Template_Library_Variables_Snapshot_Builder {

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

		Template_Library_Element_Iterator::iterate(
			$elements,
			function ( $element_data ) use ( &$ids, $variable_types ) {
				self::collect_variable_ids_from_element( $element_data, $ids, $variable_types );
				return $element_data;
			}
		);

		return array_values( array_unique( $ids ) );
	}

	public static function build_snapshot_for_ids( array $ids ): ?array {
		if ( empty( $ids ) ) {
			return null;
		}

		$repository = self::get_repository_or_null();
		if ( ! $repository ) {
			return null;
		}

		$ids = Template_Library_Snapshot_Utils::normalize_string_ids( $ids );
		if ( empty( $ids ) ) {
			return null;
		}

		$all_data = self::load_repository_data( $repository );
		$all_variables = $all_data['data'] ?? [];
		$filtered_data = Template_Library_Snapshot_Utils::filter_items_by_ids( $all_variables, $ids );

		if ( empty( $filtered_data ) ) {
			return null;
		}

		return self::build_snapshot_from_data(
			$filtered_data,
			$all_data['version'] ?? Variables_Collection::FORMAT_VERSION_V1
		);
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
		$repository = self::get_repository_or_null();
		if ( ! $repository ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$incoming_data = $snapshot['data'] ?? [];
		if ( empty( $incoming_data ) ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$current_data = self::load_repository_data( $repository );
		$current_variables = $current_data['data'] ?? [];

		$existing_labels = Template_Library_Import_Export_Utils::extract_labels( $current_variables );

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

			self::add_variable_with_label(
				$incoming_variable,
				$target_id,
				$updated_variables,
				$existing_ids,
				$existing_labels
			);
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

	public static function create_all_as_new( array $snapshot ): array {
		$repository = self::get_repository_or_null();
		if ( ! $repository ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$incoming_data = $snapshot['data'] ?? [];
		if ( empty( $incoming_data ) ) {
			return [ 'id_map' => [], 'ids_to_flatten' => [] ];
		}

		$current_data = self::load_repository_data( $repository );
		$current_variables = $current_data['data'] ?? [];

		$existing_labels = Template_Library_Import_Export_Utils::extract_labels( $current_variables );

		$id_map = [];
		$ids_to_flatten = [];
		$updated_variables = $current_variables;
		$existing_ids = array_fill_keys( array_keys( $updated_variables ), true );

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

			self::add_variable_with_label(
				$incoming_variable,
				$new_id,
				$updated_variables,
				$existing_ids,
				$existing_labels
			);
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

	private static function collect_variable_ids_from_element( array $element_data, array &$ids, array $variable_types ): void {
		if ( ! empty( $element_data['settings'] ) && is_array( $element_data['settings'] ) ) {
			self::extract_variable_ids_recursive( $element_data['settings'], $ids, $variable_types );
		}

		if ( ! empty( $element_data['styles'] ) && is_array( $element_data['styles'] ) ) {
			self::extract_variable_ids_recursive( $element_data['styles'], $ids, $variable_types );
		}
	}

	private static function get_repository_or_null(): ?Variables_Repository {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( ! $kit ) {
			return null;
		}

		return new Variables_Repository( $kit );
	}

	private static function load_repository_data( Variables_Repository $repository ): array {
		$collection = $repository->load();
		return $collection->serialize();
	}

	private static function build_snapshot_from_data( array $data, int $version ): array {
		return [
			'data' => $data,
			'watermark' => 0,
			'version' => $version,
		];
	}

	private static function add_variable_with_label( array $incoming_variable, string $target_id, array &$updated_variables, array &$existing_ids, array &$existing_labels ): void {
		$incoming_variable = Template_Library_Import_Export_Utils::apply_unique_label( $incoming_variable, $existing_labels );
		$updated_variables[ $target_id ] = $incoming_variable;
		$existing_ids[ $target_id ] = true;
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
}
