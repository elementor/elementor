<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Drop_Shadow_Filter_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'drop-shadow';
	}

	protected function define_shape(): array {
		return [
			'xAxis' => Size_Prop_Type::make()->default( [
				'size' => 0,
				'unit' => 'px',
			] )->required(),
			'yAxis' => Size_Prop_Type::make()->default( [
				'size' => 0,
				'unit' => 'px',
			] )->required(),
			'blur'  => Size_Prop_Type::make()->default( [
				'size' => 10,
				'unit' => 'px',
			] )->required(),
			'color' => Color_Prop_Type::make()->default( 'rgba(0, 0, 0, 1)' )->required(),
		];
	}
}
