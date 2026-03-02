<?php

namespace Elementor\Modules\Variables\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Variables_Element_Transformer {

	public static function rewrite_elements_variable_ids( array $elements, array $id_map ): array {
		if ( empty( $elements ) || empty( $id_map ) ) {
			return $elements;
		}

		$variable_types = Variable_Type_Keys::get_all();

		return Template_Library_Element_Iterator::iterate(
			$elements,
			function ( $element_data ) use ( $id_map, $variable_types ) {
				return self::rewrite_variable_ids_in_element( $element_data, $id_map, $variable_types );
			}
		);
	}

	public static function flatten_elements_variables( array $elements, array $global_variables, ?array $only_ids = null ): array {
		$variable_data = $global_variables['data'] ?? [];

		if ( empty( $elements ) || empty( $variable_data ) ) {
			return $elements;
		}

		$variable_types = Variable_Type_Keys::get_all();
		$ids_to_flatten = null !== $only_ids ? array_fill_keys( $only_ids, true ) : null;

		return Template_Library_Element_Iterator::iterate(
			$elements,
			function ( $element_data ) use ( $variable_data, $variable_types, $ids_to_flatten ) {
				return self::flatten_variable_refs_in_element( $element_data, $variable_data, $variable_types, $ids_to_flatten );
			}
		);
	}

	private static function rewrite_variable_ids_in_element( array $element_data, array $id_map, array $variable_types ): array {
		if ( ! empty( $element_data['settings'] ) && is_array( $element_data['settings'] ) ) {
			$element_data['settings'] = self::rewrite_variable_ids_recursive( $element_data['settings'], $id_map, $variable_types );
		}

		if ( ! empty( $element_data['styles'] ) && is_array( $element_data['styles'] ) ) {
			$element_data['styles'] = self::rewrite_variable_ids_recursive( $element_data['styles'], $id_map, $variable_types );
		}

		return $element_data;
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

	private static function flatten_variable_refs_in_element( array $element_data, array $variable_data, array $variable_types, ?array $ids_to_flatten ): array {
		if ( ! empty( $element_data['settings'] ) && is_array( $element_data['settings'] ) ) {
			$element_data['settings'] = self::flatten_variable_refs_recursive( $element_data['settings'], $variable_data, $variable_types, $ids_to_flatten );
		}

		if ( ! empty( $element_data['styles'] ) && is_array( $element_data['styles'] ) ) {
			$element_data['styles'] = self::flatten_variable_refs_recursive( $element_data['styles'], $variable_data, $variable_types, $ids_to_flatten );
		}

		return $element_data;
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
				$resolved_type = Variable_Type_Keys::get_resolved_type( $data['$$type'] );

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
}
