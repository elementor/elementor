<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Schema {
	private const MODE_BASIC = 'basic';
	private const MODE_SIZE = 'size';

	public function augment( array $schema ): array {
		return $this->augment_size( $this->augment_basic( $schema ) );
	}

	public function augment_basic( array $schema ): array {
		return $this->augment_schema( $schema, self::MODE_BASIC );
	}

	public function augment_size( array $schema ): array {
		return $this->augment_schema( $schema, self::MODE_SIZE );
	}

	public function augment_schema( array $schema, string $mode ): array {
		foreach ( $schema as $key => $prop_type ) {
			$schema[ $key ] = $this->update_prop_type( $prop_type, $mode );
			$this->preserve_meta( $prop_type, $schema[ $key ] );
		}

		if ( $mode === self::MODE_BASIC && isset( $schema['font-family'] ) ) {
			$schema['font-family'] = $this->update_font_family( $schema['font-family'] );
		}

		return $schema;
	}

	private function update_prop_type( $prop_type, string $mode ) {
		if ( $mode === self::MODE_BASIC && $prop_type instanceof Color_Prop_Type ) {
			return $this->update_color( $prop_type );
		}

		if ( $mode === self::MODE_SIZE && $prop_type instanceof Size_Prop_Type ) {
			return $this->update_size( $prop_type );
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			return $this->update_union( $prop_type, $mode );
		}

		if ( $prop_type instanceof Object_Prop_Type ) {
			return $this->update_object( $prop_type, $mode );
		}

		if ( $prop_type instanceof Array_Prop_Type ) {
			return $this->update_array( $prop_type, $mode );
		}

		return $prop_type;
	}

	private function update_font_family( String_Prop_Type $prop_type ): Union_Prop_Type {
		return Union_Prop_Type::create_from( $prop_type )
			->add_prop_type( Font_Variable_Prop_Type::make() );
	}

	private function update_color( Color_Prop_Type $color_prop_type ): Union_Prop_Type {
		return Union_Prop_Type::create_from( $color_prop_type )
			->add_prop_type( Color_Variable_Prop_Type::make() );
	}

	private function update_size( Size_Prop_Type $size_prop_type ): Union_Prop_Type {
		return Union_Prop_Type::create_from( $size_prop_type )
			->add_prop_type( Size_Variable_Prop_Type::make() );
	}

	private function update_array( Array_Prop_Type $array_prop_type, string $mode ): Array_Prop_Type {
		$item_type = $array_prop_type->get_item_type();
		$updated_item_type = $this->update_prop_type( $item_type, $mode );

		return $array_prop_type->set_item_type( $updated_item_type );
	}

	private function update_object( Object_Prop_Type $object_prop_type, string $mode ): Object_Prop_Type {
		$shape = $object_prop_type->get_shape();
		$augmented_shape = $mode === self::MODE_BASIC
			? $this->augment_basic( $shape )
			: $this->augment_size( $shape );

		return $object_prop_type->set_shape( $augmented_shape );
	}

	private function update_union( Union_Prop_Type $union_prop_type, string $mode ): Union_Prop_Type {
		foreach ( $union_prop_type->get_prop_types() as $prop_type ) {
			$updated = $this->update_prop_type( $prop_type, $mode );

			if ( $updated instanceof Union_Prop_Type ) {
				foreach ( $updated->get_prop_types() as $updated_prop_type ) {
					$union_prop_type->add_prop_type( $updated_prop_type );
				}
			}
		}

		return $union_prop_type;
	}

	private function preserve_meta( $source, $target ): void {
		if ( ! method_exists( $source, 'get_meta' ) || ! method_exists( $target, 'meta' ) ) {
			return;
		}

		$meta = $source->get_meta() ?? [];
		foreach ( $meta as $meta_key => $meta_value ) {
			$target->meta( $meta_key, $meta_value );
		}
	}
}
