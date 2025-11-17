<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'component';
	}

	protected function define_shape(): array {
		return [
			'component_id' => String_Prop_Type::make(),
			'overrides' => Array_Prop_Type::make()
		];
	}
}
