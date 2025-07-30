<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Transform;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Move_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'transform-move';
	}

	protected function define_shape(): array {
		return [
			'x' => Size_Prop_Type::make()->default( [
				'size' => 0,
				'unit' => 'px',
			] ),
			'y' => Size_Prop_Type::make()->default( [
				'size' => 0,
				'unit' => 'px',
			] ),
			'z' => Size_Prop_Type::make()->default( [
				'size' => 0,
				'unit' => 'px',
			] ),
		];
	}
}
