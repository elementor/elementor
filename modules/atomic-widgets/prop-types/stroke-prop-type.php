<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Stroke_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'stroke';
	}

	protected function define_shape(): array {
		return [
			'color' => Color_Prop_Type::make(),
			'width' => Size_Prop_Type::make(),
		];
	}

	/**
	 * @param 'color'|'width'|null $dynamic_key
	 * @return string
	 */
	public static function get_path_to_value( ?string $dynamic_key = null ): string {
		return $dynamic_key ? "value/{$dynamic_key}/value" : 'value';
	}
}
