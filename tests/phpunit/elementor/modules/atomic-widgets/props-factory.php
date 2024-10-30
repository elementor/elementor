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

	public static function shadow( array $value ) {
		return Shadow_Prop_Type::generate( [
			'position' => $value[0],
			'hOffset' => $value[1],
			'vOffset' => $value[2],
			'blur' => $value[3],
			'spread' => $value[4],
			'color' => $value[5],
		] );
	}

	public static function box_shadow( array $value ) {
		return Box_Shadow_Prop_Type::generate( $value );
	}
}
