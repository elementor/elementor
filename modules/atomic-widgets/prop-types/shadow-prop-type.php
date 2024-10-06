<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/** @example
```
$shadow = [
	'$$type' => 'shadow',
	'value' => [
		'color' => Color_Prop_Type,
		'horizontal' => Size_Prop_Type,
		'vertical' => Size_Prop_Type,
		'blur' => Size_Prop_Type,
		'spread' => Size_Prop_Type,
		'position' => 'inset' | 'outset',
	],
];
```
*/
class Shadow_Prop_Type extends Transformable_Prop_Type {

	public static function get_key(): string {
		return 'shadow';
	}

	public function __construct() {
		$this->internal_types['color'] = Color_Prop_Type::make();
		$this->internal_types['horizontal'] = Size_Prop_Type::make();
		$this->internal_types['vertical'] = Size_Prop_Type::make();
		$this->internal_types['blur'] = Size_Prop_Type::make();
		$this->internal_types['spread'] = Size_Prop_Type::make();
		$this->internal_types['position'] = String_Prop_Type::make()->enum( [ 'inset', 'outset' ] );
	}

	protected function validate_value( $value ): void {
		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array.' );
		}

		foreach ( $this->internal_types as $key => $type ) {
			if ( ! array_key_exists( $key, $value ) ) {
				throw new \Exception( "Value must have a `$key` key." );
			}

			$type->validate_with_additional( $value[ $key ] );
		}
	}
}
