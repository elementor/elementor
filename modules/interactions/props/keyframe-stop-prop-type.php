<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Keyframe_Stop_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'animation-keyframe-stop';
	}

	protected function define_shape(): array {
		return [
            'settings' => Keyframe_Stop_Settings_Prop_Type::make()
        ];
	}
}
