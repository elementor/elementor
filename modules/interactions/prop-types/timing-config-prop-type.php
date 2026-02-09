<?php

namespace Elementor\Modules\Interactions\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\Interactions\Concerns\Has_Preset;

class Timing_Config_Prop_Type extends Object_Prop_Type {
	use Has_Preset;

	public static function get_key(): string {
		return 'timing-config';
	}

	protected function define_shape(): array {
		$default_unit = Size_Constants::UNIT_MILLI_SECOND;
		$units = [
			Size_Constants::UNIT_MILLI_SECOND,
			Size_Constants::UNIT_SECOND,
		];

		return [
			'duration' => Size_Prop_Type::make()->units( $units )->default_unit( $default_unit ),
			'delay' => Size_Prop_Type::make()->units( $units )->default_unit( $default_unit ),
		];
	}
}
