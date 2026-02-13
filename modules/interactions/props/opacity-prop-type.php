<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Opacity_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'opacity';
	}

	protected function define_shape(): array {
		return [
			'size' => Size_Prop_Type::make(),
		];
	}
}
