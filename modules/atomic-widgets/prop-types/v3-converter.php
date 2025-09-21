<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;

class V3_Converter {
	const EXTRACT_NEGATED_KEY_REGEX = '/([\w-]+)(?:\[([\w-]+)])?/';
	const SUB_PROP_KEY_REGEX = '/([\w-]+(?:\[[\w-]+])?)?(!?)$/i';

	private $schema = null;

	/**
	 * @param array $control
	 * @return Prop_Type|null
	 */
	public function convert_control_to_prop_type( array $control ) {
		$control_type = $control['type'];

		switch ( $control_type ) {
			case 'text':
			case 'textarea':
				return String_Prop_Type::make()
					->default( $control['default'] ?? null );

			case 'select':
				$prop_type = String_Prop_Type::make()
					->default( $control['default'] ?? null );

				if ( ! isset( $control['collection_id'] ) || empty( $control['collection_id'] ) ) {
					$prop_type->enum( array_keys( $control['options'] ?? [] ) );
				}

				return $prop_type;

			case 'number':
				return Number_Prop_Type::make()
					->set_required( $control['required'] ?? false )
					->default( $control['default'] ?? null );

			case 'switcher':
				$default = $control['default'];

				return Boolean_Prop_Type::make()
					->default( 'yes' === $default || true === $default );

			case 'choose':
				return String_Prop_Type::make()
					->default( $control['default'] ?? null )
					->enum( array_keys( $control['options'] ?? [] ) );

			case 'query':
				return Query_Prop_Type::make()
					->set_required( $control['required'] ?? false )
					->default( $control['default'] ?? null );

			case 'media':
				return Image_Prop_Type::make()
					->default_url( Placeholder_Image::get_placeholder_image() )
					->default_size( 'full' );

			default:
				return null;
		}
	}

	public function add_dependencies_to_schema( $controls, $schema, $force = false ) {
		if ( $this->schema && ! $force ) {
			return $this->schema;
		}

		$this->schema = $schema;

		foreach ( $controls as $control ) {
			if ( ! isset( $control['type'] ) || 'section' === $control['type'] ) {
				continue;
			}

			$prop_type = $schema[ $control['name'] ] ?? null;

			if ( ! $prop_type ) {
				continue;
			}

			$this->schema[ $control['name'] ]->set_dependencies( $this->get_dependencies( $control ) );
		}

		return $this->schema;
	}

	private function get_dependencies( $control ) {
		if ( ! isset( $control['condition'] ) && ! isset( $control['conditions'] ) ) {
			return null;
		}

		$is_termed_condition = isset( $control['conditions'] );
		$conditions = $is_termed_condition ? $control['conditions'] : $control['condition'];
		$relation = isset( $control['relation'] ) ? $control['relation'] : Dependency_Manager::RELATION_AND;

		$dependencies = $this->convert_conditions( $conditions, $relation, $is_termed_condition );

		return $dependencies;
	}

	private function convert_conditions( $conditions, $relation, $is_termed_condition ) {
		if ( empty( $conditions ) ) {
			return null;
		}

		$dependency_manager = Dependency_Manager::make( $relation );
		$is_simple_term = true;

		if ( $is_termed_condition ) {
			if ( isset( $conditions['terms'] ) ) {
				return $this->convert_conditions( $conditions['terms'], $conditions['relation'] ?? Dependency_Manager::RELATION_AND, $is_termed_condition );
			}

			$is_simple_term = false;
		}

		foreach ( $conditions as $key => $value ) {
			if ( isset( $value['terms'] ) ) {
				$dependencies = $this->convert_conditions( $value['terms'], $value['relation'] ?? Dependency_Manager::RELATION_AND, true );

				if ( $dependencies ) {
					$dependency_manager->where( $dependencies );
				}

				continue;
			}

			if ( ! $is_simple_term ) {
				$key = $value['name'];
				$value = $value['value'];
				$operator = $this->convert_operator( $value['operator'] );

				$dependency_manager->where( [
					'operator' => $operator,
					'path' => [ $key ],
					'value' => $value['value'],
				] );

				continue;
			}

			$meta = $this->extract_meta_from_scheme( $key );

			if ( ! $meta ) {
				continue;
			}

			$is_negated = $meta['is_negated'];
			$prop_type = $meta['prop_type'];
			$path = $meta['path'];
			$operator = $is_negated ? 'ne' : 'eq';

			if ( $prop_type instanceof Boolean_Prop_Type ) {
				$operator = $is_negated ? 'exists' : 'not_exist';
			} else if ( $prop_type instanceof Array_Prop_Type || is_array( $value ) ) {
				$operator = $is_negated ? 'nin' : 'in';
			}

			$dependency_manager->where( [
				'operator' => $operator,
				'path' => $path,
				'value' => $value,
			] );
		}

		return $dependency_manager->get();
	}

	private function extract_meta_from_scheme( $key ) {
		if ( ! $this->schema ) {
			return null;
		}

		$key_parts = [];
		$sub_prop_key_parts = [];

		preg_match( self::EXTRACT_NEGATED_KEY_REGEX, $key, $key_parts );
		preg_match( self::SUB_PROP_KEY_REGEX, $key_parts[1], $sub_prop_key_parts );

		$is_negated = '!' === ( $key_parts[2] ?? null );
		$key = $sub_prop_key_parts[1] ?? null;
		$sub_key = $sub_prop_key_parts[2] ?? null;

		foreach ( $this->schema as $prop_key => $prop_type ) {
			$meta = $this->extract_prop_type_meta( $key, $prop_key, $prop_type, [] );

			if ( $meta ) {
				break;
			}
		}

		if ( ! $meta ) {
			return null;
		}

		if ( $sub_key ) {
			$meta['path'][] = $sub_key;
		}

		$meta['is_negated'] = $is_negated;

		return $meta;
	}

	private function extract_prop_type_meta( $needle, $prop_key, Prop_Type $prop_type, $meta = [ 'path' => [] ] ) {
		if ( $prop_key === $needle ) {
			return [
				'path' => [ $needle ],
				'prop_type' => $prop_type,
			];
		}

		$prop_types = [];

		if ( $prop_type instanceof Object_Prop_Type ) {
			$prop_types = $prop_type->get_shape();
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			$prop_types = $prop_type->get_prop_types();
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			$prop_types = [ $prop_type->get_item_type() ];
		}

		foreach ( $prop_types as $key => $current_prop_type ) {
			$result = $this->extract_prop_type_meta( $needle, $key, $current_prop_type, $meta );

			if ( $result ) {
				return [
					'path' => array_merge( $meta['path'], $result['path'] ),
					'prop_type' => $result['prop_type'],
				];
			}
		}

		return null;
	}

	private function convert_operator( $operator, $is_negated = false ) {
		$conversion_map = [
			'==' => 'eq',
			'!=' => 'ne',
			'>'  => 'gt',
			'>=' => 'gte',
			'<'  => 'lt',
			'<=' => 'lte',
			'in' => 'in',
			'!in' => 'nin',
			'contains' => 'contains',
			'!contains' => 'not_contains',
		];

		$negated_map = [
			'eq' => 'ne',
			'ne' => 'eq',
			'gt' => 'lte',
			'gte' => 'lt',
			'lt' => 'gte',
			'lte' => 'gt',
			'in' => 'nin',
			'nin' => 'in',
			'contains' => 'not_contains',
			'not_contains' => 'contains',
		];

		$key = $is_negated ? $negated_map[ $operator ] : $operator;

		return $conversion_map[ $key ];
	}
}
