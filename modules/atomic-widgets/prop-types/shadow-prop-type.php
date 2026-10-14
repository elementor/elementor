<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Shadow_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'shadow';
	}

	protected function define_shape(): array {
		$units = Size_Constants::box_shadow();
		$size = [
			'size' => 0,
			'unit' => Size_Constants::UNIT_PX,
		];
		$blur = [
			'size' => 10,
			'unit' => Size_Constants::UNIT_PX,
		];

		return [
			'hOffset' => Size_Prop_Type::make()->required()->units( $units )->initial_value( $size ),
			'vOffset' => Size_Prop_Type::make()->required()->units( $units )->initial_value( $size ),
			'blur' => Size_Prop_Type::make()->required()->units( $units )->initial_value( $blur ),
			'spread' => Size_Prop_Type::make()->required()->units( $units )->initial_value( $size ),
			'color' => Color_Prop_Type::make()->required()->initial_value( 'rgba(0, 0, 0, 1)' ),
			'position' => String_Prop_Type::make()->enum( [ 'inset' ] ),
		];
	}
}
