<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Base_Tag;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Query_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Tags_Schemas {
	private array $tags_schemas = [];

	public function get( string $tag_name ) {
		if ( isset( $this->tags_schemas[ $tag_name ] ) ) {
			return $this->tags_schemas[ $tag_name ];
		}

		$tag = $this->get_tag( $tag_name );

		$this->tags_schemas[ $tag_name ] = [];

		foreach ( $tag->get_controls() as $control ) {
			if ( ! isset( $control['type'] ) || 'section' === $control['type'] ) {
				continue;
			}

			$prop_type = $this->convert_control_to_prop_type( $control );

			if ( ! $prop_type ) {
				continue;
			}

			$this->tags_schemas[ $tag_name ][ $control['name'] ] = $prop_type;
		}

		return $this->tags_schemas[ $tag_name ];
	}

	private function get_tag( string $tag_name ): Base_Tag {
		$tag_info = Plugin::$instance->dynamic_tags->get_tag_info( $tag_name );

		if ( ! $tag_info || empty( $tag_info['instance'] ) ) {
			throw new \Exception( 'Tag not found' );
		}

		if ( ! $tag_info['instance'] instanceof Base_Tag ) {
			throw new \Exception( 'Tag is not an instance of Tag' );
		}

		return $tag_info['instance'];
	}

	private function convert_control_to_prop_type( array $control ) {
		$control_type = $control['type'];

		switch ( $control_type ) {
			case 'text':
			case 'textarea':
				$prop_type = String_Prop_Type::make()
					->default( $control['default'] ?? null );
				break;

			case 'select':
				$prop_type = String_Prop_Type::make()
					->default( $control['default'] ?? null );

				if ( ! isset( $control['collection_id'] ) || empty( $control['collection_id'] ) ) {
					$prop_type->enum( array_keys( $control['options'] ?? [] ) );
				}
				break;

			case 'number':
				$prop_type = Number_Prop_Type::make()
					->set_required( $control['required'] ?? false )
					->default( $control['default'] ?? null );
				break;

			case 'switcher':
				$default = $control['default'];

				$prop_type = Boolean_Prop_Type::make()
					->default( 'yes' === $default || true === $default );
				break;

			case 'query':
				$prop_type = Query_Prop_Type::make()
					->set_required( $control['required'] ?? false )
					->default( $control['default'] ?? null );
				break;

			default:
				return null;
		}

		$prop_type->set_dependencies( $this->create_dependencies_from_condition( $control['condition'] ?? null ) );

		return $prop_type;
	}

	private function create_dependencies_from_condition( $condition ): ?array {
		if ( ! is_array( $condition ) || empty( $condition ) ) {
			return null;
		}
		$manager = Dependency_Manager::make( Dependency_Manager::RELATION_AND );

		foreach ( $condition as $raw_key => $value ) {
			$is_negated = false !== strpos( (string) $raw_key, '!' );
			$key = rtrim( (string) $raw_key, '!' );
			$path = $this->parse_condition_path( $key );

			if ( is_array( $value ) ) {
				$manager->where( [
					'operator' => $is_negated ? 'nin' : 'in',
					'path' => $path,
					'value' => $value,
				] );
				continue;
			}

			$manager->where( [
				'operator' => $is_negated ? 'ne' : 'eq',
				'path' => $path,
				'value' => $value,
			] );
		}

		return $manager->get();
	}

	private function parse_condition_path( string $key ): array {
		if ( false === strpos( $key, '[' ) ) {
			return [ $key ];
		}

		$key = str_replace( ']', '', $key );
		$tokens = explode( '[', $key );

		return array_values( array_filter( $tokens, static fn( $t ) => '' !== $t ) );
	}
}
