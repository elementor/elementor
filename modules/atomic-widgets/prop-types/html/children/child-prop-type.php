<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Html\Children;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Unknown_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Child_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'html-child';
	}

	protected function define_shape(): array {
		return [
			'type' => String_Prop_Type::make(),
			'mark' => Mark_Prop_Type::make(),
			'text' => String_Prop_Type::make(),
			'data' => Unknown_Prop_Type::make(),
		];
	}
}
