<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Query_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Tags_Converter {

	/**
	 * @param array $control
	 * @return Plain_Prop_Type|Object_Prop_Type|null
	 */
	public function convert_control_to_prop_type( array $control ) {
		$control_type = $control['type'];
		$dependencies = ! empty( $control['condition'] ) ? $this->convert_conditions_to_prop_dependencies( $control['condition'] ) : [];

		switch ( $control_type ) {
			case 'text':
			case 'textarea':
				return String_Prop_Type::make()
					->default( $control['default'] ?? null )
					->set_dependencies( $dependencies );

			case 'select':
				$string_prop = String_Prop_Type::make()
					->default( $control['default'] ?? null )
					->set_dependencies( $dependencies );

				if ( ! isset( $control['collection_id'] ) || empty( $control['collection_id'] ) ) {
					$string_prop->enum( array_keys( $control['options'] ?? [] ) );
				}

				return $string_prop;

			case 'number':
				return Number_Prop_Type::make()
					->set_required( $control['required'] ?? false )
					->default( $control['default'] ?? null )
					->set_dependencies( $dependencies );

			case 'switcher':
				$default = $control['default'];

				return Boolean_Prop_Type::make()
					->default( 'yes' === $default || true === $default )
					->set_dependencies( $dependencies );

			case 'choose':
				return String_Prop_Type::make()
					->default( $control['default'] ?? null )
					->enum( array_keys( $control['options'] ?? [] ) )
					->set_dependencies( $dependencies );

			case 'query':
				return Query_Prop_Type::make()
					->set_required( $control['required'] ?? false )
					->default( $control['default'] ?? null )
					->set_dependencies( $dependencies );

			case 'media':
				return Image_Prop_Type::make()
					->default_url( Placeholder_Image::get_placeholder_image() )
					->default_size( 'full' )
					->set_dependencies( $dependencies );

			default:
				return null;
		}
	}

	private function convert_conditions_to_prop_dependencies( array $conditions ): ?array {
		if ( empty( $conditions ) ) {
			return [];
		}

		$dependency_manager = Dependency_Manager::make( Dependency_Manager::RELATION_AND );

		foreach ( $conditions as $path => $value ) {
			$operator = $this->determine_condition_operator( $path, $value );
			$clean_path = $this->clean_path_from_operator( $path );

			$dependency_manager->where([
				'operator' => $operator,
				'path' => [ $clean_path ],
				'value' => $value,
			]);
		}

		return $dependency_manager->get();
	}

	private function determine_condition_operator( string $path, $value ): string {
		$has_negation = str_ends_with( $path, '!' );

		if ( is_array( $value ) ) {
			return $has_negation ? 'nin' : 'in';
		}

		return $has_negation ? 'ne' : 'eq';
	}

	private function clean_path_from_operator( string $path ): string {
		if ( str_ends_with( $path, '!' ) ) {
			return substr( $path, 0, -1 );
		}

		return $path;
	}
}
