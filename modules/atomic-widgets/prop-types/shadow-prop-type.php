<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Shadow_Prop_Type extends Object_Prop_Type {
	const DEFAULT_COLOR    = 'rgba(0, 0, 0, 1)';
	const POSITION_INSET   = 'inset';
	const DEFAULT_BLUR     = [ 'size' => 10, 'unit' => Size_Constants::UNIT_PX ];

	public static function get_key(): string {
		return 'shadow';
	}

	protected function define_shape(): array {
		$units = Size_Constants::box_shadow();

		return [
			'hOffset' => Size_Prop_Type::make()->required()->units( $units )->initial_value( Size_Constants::SIZE_ZERO_PX ),
			'vOffset' => Size_Prop_Type::make()->required()->units( $units )->initial_value( Size_Constants::SIZE_ZERO_PX ),
			'blur' => Size_Prop_Type::make()->required()->units( $units )->initial_value( self::DEFAULT_BLUR ),
			'spread' => Size_Prop_Type::make()->required()->units( $units )->initial_value( Size_Constants::SIZE_ZERO_PX ),
			'color' => Color_Prop_Type::make()->required()->initial_value( self::DEFAULT_COLOR ),
			'position' => String_Prop_Type::make()->enum( [ self::POSITION_INSET ] ),
		];
	}
}
