<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\DataFlow\State_Params;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_Write_Prop_Type extends Object_Prop_Type {
	const INPUT_VALUES = [
		'pointer' => [ 'x', 'y', 'px', 'py', 'inside' ],
		'scroll' => [ 'y', 'progress', 'velocity', 'speed' ],
		'drag' => [ 'x', 'y', 'angle', 'velocity', 'dragging' ],
		'time' => [ 't' ],
	];

	public static function get_key(): string {
		return 'state-write';
	}

	public static function all_input_values(): array {
		return array_values( array_unique( array_merge( ...array_values( self::INPUT_VALUES ) ) ) );
	}

	protected function define_shape(): array {
		return [
			'key' => String_Prop_Type::make()->regex( State_Params::KEY_PATTERN )->required()->description( 'State key to write' ),
			'from' => String_Prop_Type::make()->enum( self::all_input_values() )->required()->description( 'Input value to read. pointer: x, y (-1..1), px, py, inside. scroll: y, progress (0..1), velocity, speed. drag: x, y, angle, velocity, dragging. time: t' ),
			'map' => Range_Map_Prop_Type::make()->description( 'Maps the input range to an output range' ),
			'clamp' => Boolean_Prop_Type::make()->description( 'Clamp mapped values to the output range, default true' ),
			'smooth' => Number_Prop_Type::make()->float()->description( 'Exponential smoothing between 0 (none) and 0.99 (very smooth)' ),
			'spring' => Spring_Prop_Type::make()->description( 'Follow the value with spring physics instead of smoothing' ),
			'decay' => Number_Prop_Type::make()->float()->description( 'Hold peaks and release them by this factor per frame (0..1), e.g. 0.92 for a scroll velocity boost' ),
			'round' => Number_Prop_Type::make()->description( 'Decimal places to round the written value to' ),
		];
	}
}
