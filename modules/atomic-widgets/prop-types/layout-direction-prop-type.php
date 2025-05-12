<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Layout_Direction_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'layout-direction';
	}

	protected function define_shape(): array {
		return [
			'column' => Size_Prop_Type::make(),
			'row' => Size_Prop_Type::make(),
		];
	}

	/**
	 * @param 'column'|'row'|null $dynamic_key
	 * @return string
	 */
	public static function get_path_to_value( ?string $dynamic_key = null ): string {
		return $dynamic_key ? "value/{$dynamic_key}" : 'value';
	}
}
