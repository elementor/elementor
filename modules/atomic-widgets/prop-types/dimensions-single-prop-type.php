<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dimensions_Single_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'dimensions-single';
	}

	public static function make_with_units( $units = null ) {
		return static::make()->set_shape( static::create_shape_with_units( $units ) );
	}

	protected function define_shape(): array {
		return static::create_shape_with_units();
	}

	private static function create_shape_with_units( $units = null ) {
		$size_prop_type = Size_Prop_Type::make();

		if ( null !== $units ) {
			$size_prop_type->units( $units );
		}

		return [
			'size' => $size_prop_type,
		];
	}
}
