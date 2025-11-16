<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Date_Time_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'date-time';
	}

	protected function define_shape(): array {
		return [
			'date' => String_Prop_Type::make(),
			'time' => String_Prop_Type::make(),
		];
	}

	public function get_default() {
		return null;
	}
}
