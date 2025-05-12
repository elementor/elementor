<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Border_Width_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'border-width';
	}

	protected function define_shape(): array {
		return [
			'block-start' => Size_Prop_Type::make()->required(),
			'block-end' => Size_Prop_Type::make()->required(),
			'inline-start' => Size_Prop_Type::make()->required(),
			'inline-end' => Size_Prop_Type::make()->required(),
		];
	}

	/**
	 * @param 'block-start'|'block-end'|'inline-start'|'inline-end'|null $dynamic_key
	 * @return string
	 */
	public static function get_path_to_value( ?string $dynamic_key = null ): string {
		return $dynamic_key ? "value/{$dynamic_key}/value" : 'value';
	}
}
