<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Move_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Rotate_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Scale_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Skew_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Keyframe_Stop_Settings_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'keyframe-stop-settings';
	}

	protected function define_shape(): array {
		return [
            'opacity' => Opacity_Prop_Type::make(),
            'move' => Transform_Move_Prop_Type::make(),
            'rotate' => Transform_Rotate_Prop_Type::make(),
            'scale' => Transform_Scale_Prop_Type::make(),
            'skew' => Transform_Skew_Prop_Type::make(),
        ];
	}
}
