<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Transform;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Traits\Dimensional_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Transform_Skew_Prop_Type extends Object_Prop_Type {
	use Dimensional_Prop_Type;

	public static function get_key(): string {
		return 'transform-skew';
	}

	protected function get_default_size(): array {
		return [
			'size' => 0,
			'unit' => 'deg',
		];
	}

	protected function get_prop_type(): Prop_Type {
		return Size_Prop_Type::make()
			->units( Size_Constants::transform() )
			->default_unit( Size_Constants::UNIT_ANGLE_DEG );
	}
}
