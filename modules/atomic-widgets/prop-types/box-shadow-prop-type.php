<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/** @example
```
$box_shadow = [
	'$$type' => 'box-shadow',
    'value' => Shadow_Prop_Type[]
];
```
*/
class Box_Shadow_Prop_Type extends Transformable_Prop_Type {

	public static function get_key(): string {
		return 'box-shadow';
	}

	public function __construct() {
		$this->internal_types['shadow'] = Shadow_Prop_Type::make();
	}

	protected function validate_value( $value ): void {
		if ( ! is_array( $value ) ) {
			throw new \Exception( 'Value must be an array.' );
		}

		foreach ( $value as $shadow ) {
			$this->internal_types['shadow']->validate_with_additional( $shadow );
		}
	}
}
