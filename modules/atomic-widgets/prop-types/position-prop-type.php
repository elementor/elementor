<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Position_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'position';
	}

	protected function define_shape(): array {
		return [
			'position' => Union_Prop_Type::make()
				->add_prop_type( String_Prop_Type::make()->enum( self::get_position_enum_values() ) )
				->add_prop_type( Position_Custom_Prop_Type::make() ),
		];
	}

	private static function get_position_enum_values(): array {
		return [
			'center center',
			'center left',
			'center right',
			'top center',
			'top left',
			'top right',
			'bottom center',
			'bottom left',
			'bottom right',
			'custom',
		];
	}
}
