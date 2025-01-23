<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

class Background_Active_Control_Overlay_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'background-active-overlay';
	}

	protected function define_shape(): array {
		return [
			'control' => String_Prop_Type::make()->enum( [ 'color', 'image' ] ),
		];
	}
}
