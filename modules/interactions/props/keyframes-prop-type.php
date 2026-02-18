<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Keyframes_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'animation-keyframes';
	}

	protected function define_item_type(): Prop_Type {
		return Keyframe_Stop_Prop_Type::make();
	}
}
