<?php
namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\Elements\Has_Atomic_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Override_Prop_type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'component-override';
	}

	protected function validate_value( $value ): bool {
		if ( ! isset( $value['override-key'] ) || ! is_string( $value['override-key'] ) || ! isset( $value['value'] ) || ! is_array( $value['value'] ) ) {
			return false;
		}

		return Props_Parser::make( Has_Atomic_Base::get_props_schema() )
			->validate( $value['value'] )
			->is_valid();
	}

	protected function sanitize_value( $value ) {
		return [
			'override-key' => sanitize_text_field( $value['override-key'] ),
			'value' => Props_Parser::make( Has_Atomic_Base::get_props_schema() )
				->sanitize( $value['value'] )
				->unwrap(),
		];
	}
}