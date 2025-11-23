<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dimensions_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'dimensions';
	}

	protected function define_shape(): array {
		return static::create_shape_with_units();
	}

	public static function make_with_units( $units = null ) {
		return static::make()->set_shape( static::create_shape_with_units( $units ) );
	}

	private static function create_shape_with_units( $units = null ) {
		$size_prop_type = Size_Prop_Type::make();

		if ( null !== $units ) {
			$size_prop_type->units( $units );
		}

		return [
			'block-start' => ( clone $size_prop_type )->description( 'The size for the block-start (top in LTR languages) side in Size PropType format.' ),
			'inline-end' => ( clone $size_prop_type )->description( 'The size for the inline-end (right in LTR languages) side in Size PropType format.' ),
			'block-end' => ( clone $size_prop_type )->description( 'The size for the block-end (bottom in LTR languages) side in Size PropType format.' ),
			'inline-start' => ( clone $size_prop_type )->description( 'The size for the inline-start (left in LTR languages) side in Size PropType format.' ),
		];
	}
}
