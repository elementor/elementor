<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Props_Factory {
	public static function size( int $size, string $unit = 'px' ) {
		return Size_Prop_Type::generate( [
			'size' => $size,
			'unit' => $unit,
		] );
	}

	public static function color( string $value ) {
		return Color_Prop_Type::generate( $value );
	}

	public static function shadow( ...$args ) {
		return Shadow_Prop_Type::generate( [
			'hOffset' => $args[0],
			'vOffset' => $args[1],
			'blur' => $args[2],
			'spread' => $args[3],
			'color' => $args[4],
			'position' => $args[5],
		] );
	}

	public static function box_shadow( array $value ) {
		return Box_Shadow_Prop_Type::generate( $value );
	}
}
