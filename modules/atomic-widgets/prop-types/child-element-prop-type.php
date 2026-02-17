<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Child_Element_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'child-element';
	}

	protected function define_shape(): array {
		return [
			'id' => String_Prop_Type::make(),
			'type' => String_Prop_Type::make(),
			'content' => String_Prop_Type::make(),
		];
	}
}
