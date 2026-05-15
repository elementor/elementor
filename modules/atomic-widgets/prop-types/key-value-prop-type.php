<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Key_Value_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'key-value';
	}

	protected function define_shape(): array {
		return [
			'key' => String_Prop_Type::make(),
			'value' => String_Prop_Type::make(),
		];
	}

	public function sanitize_value( $value ) {
		$prop_type = String_Prop_Type::make();
		if ( isset( $value['key'] ) ) {
			$clean_key = esc_attr( $prop_type->sanitize( $value['key'] )['value'] );
			$value['key'] = String_Prop_Type::generate( $clean_key );
		}
		if ( isset( $value['value'] ) ) {
			$clean_value = esc_attr( $prop_type->sanitize( $value['value'] )['value'] );
			$value['value'] = String_Prop_Type::generate( $clean_value );
		}
		return $value;
	}
}
