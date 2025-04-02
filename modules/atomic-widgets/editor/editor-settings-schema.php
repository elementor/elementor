<?php

namespace Elementor\Modules\AtomicWidgets\Editor;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

class Editor_Settings_Schema {
	public static function get() {
		return [
			'title' => String_Prop_Type::make(),
		];
	}
}
