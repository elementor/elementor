<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Utils\Variable_Type_Keys;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Variable_Prop_Value_Transformer {
	private Variables_Service $variables_service;

	public function __construct( Variables_Service $variables_service ) {
		$this->variables_service = $variables_service;
	}

	/**
	 * @param array<int, array{property: string, value: string, declaration: string}> $rules
	 * @return array{props: array, custom_css: string[], rejected: string[]}
	 */
	public function eject_unresolved_var_props( array $props, array $schema, array $rules ): array {
		$custom_css = [];
		$rejected = [];

		foreach ( $props as $key => $prop_value ) {
			if ( ! isset( $schema[ $key ] ) || ! ( $schema[ $key ] instanceof Prop_Type ) ) {
				continue;
			}

			$reference = $this->find_var_reference_in_value( $prop_value, $schema[ $key ] );

			if ( null === $reference ) {
				continue;
			}

			$variable = $this->variables_service->find_by_label_or_id( $reference );

			if (
				null !== $variable
				&& $this->variable_fits_prop_type( $schema[ $key ], $variable['type'] ?? '' )
			) {
				continue;
			}

			unset( $props[ $key ] );

			$declaration = $this->declaration_for_ejected_prop( $rules, $key );

			if ( null === $declaration ) {
				continue;
			}

			$declaration = $declaration . ';';

			if ( null === $variable ) {
				$custom_css[] = $declaration;
				continue;
			}

			$rejected[] = $declaration;
		}

		return [
			'props' => $props,
			'custom_css' => $custom_css,
			'rejected' => $rejected,
		];
	}

	public function transform( array $props, array $schema ): array {
		$transformed = [];

		foreach ( $props as $key => $prop_value ) {
			if ( ! isset( $schema[ $key ] ) || ! ( $schema[ $key ] instanceof Prop_Type ) ) {
				$transformed[ $key ] = $prop_value;
				continue;
			}

			$transformed[ $key ] = $this->transform_value( $prop_value, $schema[ $key ] );
		}

		return $transformed;
	}

	/**
	 * @param mixed $prop_value
	 * @return mixed
	 */
	private function transform_value( $prop_value, Prop_Type $prop_type ) {
		if ( ! is_array( $prop_value ) || ! isset( $prop_value['$$type'] ) ) {
			return $prop_value;
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			$promoted = $this->try_promote_to_variable( $prop_value, $prop_type );

			if ( null !== $promoted ) {
				return $promoted;
			}

			$branch = $prop_type->get_prop_type( $prop_value['$$type'] );

			if ( ! $branch ) {
				return $prop_value;
			}

			return $this->transform_value( $prop_value, $branch );
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			if ( ! is_array( $prop_value['value'] ?? null ) ) {
				return $prop_value;
			}

			$shape = $prop_type->get_shape();

			foreach ( $shape as $field => $field_type ) {
				if ( ! isset( $prop_value['value'][ $field ] ) ) {
					continue;
				}

				$prop_value['value'][ $field ] = $this->transform_value(
					$prop_value['value'][ $field ],
					$field_type
				);
			}

			return $prop_value;
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			if ( ! is_array( $prop_value['value'] ?? null ) ) {
				return $prop_value;
			}

			foreach ( $prop_value['value'] as $index => $item ) {
				$prop_value['value'][ $index ] = $this->transform_value(
					$item,
					$prop_type->get_item_type()
				);
			}

			return $prop_value;
		}

		return $prop_value;
	}

	private function try_promote_to_variable( array $prop_value, Union_Prop_Type $union ): ?array {
		$reference = $this->extract_var_reference( $prop_value );

		if ( null === $reference ) {
			return null;
		}

		$variable = $this->variables_service->find_by_label_or_id( $reference );

		if ( null === $variable ) {
			return null;
		}

		$variable_type = $this->resolve_variable_prop_type_key( $variable['type'] ?? '', $union );

		if ( null === $variable_type ) {
			return null;
		}

		$id = $variable['id'] ?? '';

		if ( '' === $id ) {
			return null;
		}

		return [
			'$$type' => $variable_type,
			'value' => $id,
		];
	}

	private function extract_var_reference( array $prop_value ): ?string {
		$type = $prop_value['$$type'] ?? '';
		$value = $prop_value['value'] ?? null;

		if ( in_array( $type, [ 'color', 'string' ], true ) && is_string( $value ) ) {
			return Css_Var_Reference::parse( $value );
		}

		if ( 'size' === $type && is_array( $value ) ) {
			$unit = $value['unit'] ?? '';

			if ( Size_Constants::UNIT_CUSTOM !== $unit || ! is_string( $value['size'] ?? null ) ) {
				return null;
			}

			return Css_Var_Reference::parse( $value['size'] );
		}

		return null;
	}

	/**
	 * @param mixed $prop_value
	 */
	private function find_var_reference_in_value( $prop_value, Prop_Type $prop_type ): ?string {
		if ( ! is_array( $prop_value ) || ! isset( $prop_value['$$type'] ) ) {
			return null;
		}

		if ( Variable_Type_Keys::is_variable_type( $prop_value['$$type'] ) ) {
			return null;
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			$reference = $this->extract_var_reference( $prop_value );

			if ( null !== $reference ) {
				return $reference;
			}

			$branch = $prop_type->get_prop_type( $prop_value['$$type'] );

			if ( ! $branch ) {
				return null;
			}

			return $this->find_var_reference_in_value( $prop_value, $branch );
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			if ( ! is_array( $prop_value['value'] ?? null ) ) {
				return null;
			}

			foreach ( $prop_type->get_shape() as $field => $field_type ) {
				if ( ! isset( $prop_value['value'][ $field ] ) ) {
					continue;
				}

				$reference = $this->find_var_reference_in_value(
					$prop_value['value'][ $field ],
					$field_type
				);

				if ( null !== $reference ) {
					return $reference;
				}
			}

			return null;
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			if ( ! is_array( $prop_value['value'] ?? null ) ) {
				return null;
			}

			foreach ( $prop_value['value'] as $item ) {
				$reference = $this->find_var_reference_in_value(
					$item,
					$prop_type->get_item_type()
				);

				if ( null !== $reference ) {
					return $reference;
				}
			}

			return null;
		}

		return $this->extract_var_reference( $prop_value );
	}

	private function variable_fits_prop_type( Prop_Type $prop_type, string $variable_type ): bool {
		if ( '' === $variable_type ) {
			return false;
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			return null !== $this->resolve_variable_prop_type_key( $variable_type, $prop_type );
		}

		$resolved_type = Variable_Type_Keys::get_resolved_type( $variable_type );

		return null !== $resolved_type && $resolved_type === $prop_type::get_key();
	}

	/**
	 * @param array<int, array{property: string, value: string, declaration: string}> $rules
	 */
	private function declaration_for_ejected_prop( array $rules, string $property ): ?string {
		$declaration = $this->declaration_for_property( $rules, $property );

		if ( null !== $declaration ) {
			return $declaration;
		}

		$longhands_by_aggregate = [
			'background' => [
				'background-color',
				'background-clip',
				'background-image',
				'background-repeat',
				'background-attachment',
				'background-position',
				'background-size',
			],
		];

		foreach ( $longhands_by_aggregate[ $property ] ?? [] as $longhand ) {
			$declaration = $this->declaration_for_property( $rules, $longhand );

			if ( null !== $declaration ) {
				return $declaration;
			}
		}

		return null;
	}

	/**
	 * @param array<int, array{property: string, value: string, declaration: string}> $rules
	 */
	private function declaration_for_property( array $rules, string $property ): ?string {
		foreach ( $rules as $rule ) {
			if ( $rule['property'] === $property ) {
				return $rule['declaration'];
			}
		}

		return null;
	}

	private function resolve_variable_prop_type_key( string $variable_type, Union_Prop_Type $union ): ?string {
		if ( '' === $variable_type ) {
			return null;
		}

		if ( $union->get_prop_type( $variable_type ) ) {
			return $variable_type;
		}

		if (
			Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY === $variable_type
			&& $union->get_prop_type( Size_Variable_Prop_Type::get_key() )
		) {
			return Size_Variable_Prop_Type::get_key();
		}

		return null;
	}
}
