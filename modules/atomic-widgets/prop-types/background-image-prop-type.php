<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'background-image';
	}

	protected function define_item_type(): Prop_Type {
		return Color_Gradient_Prop_Type::make();
	}
}
