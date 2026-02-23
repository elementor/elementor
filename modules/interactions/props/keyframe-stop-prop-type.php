<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Keyframe_Stop_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'keyframe-stop';
	}

	protected function define_shape(): array {
		return [
			'stop' => Size_Prop_Type::make()
				->default_unit( Size_Constants::UNIT_PERCENT )
				->required(),
			'settings' => Keyframe_Stop_Settings_Prop_Type::make()
				->required(),
		];
	}
}
