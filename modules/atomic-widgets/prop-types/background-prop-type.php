<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'background';
	}

	protected function define_shape(): array {
		return [
			'background-overlay' => Background_Overlay_Prop_Type::make(),
			'color' => Color_Prop_Type::make(),
		];
	}
}
