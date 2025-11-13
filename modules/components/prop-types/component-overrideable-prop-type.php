<?php

namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\Elements\Has_Atomic_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Overridable_Prop_Type extends Plain_Prop_Type {

	public static function get_key(): string {
		return 'component-overridable';
	}

	protected function validate_value( $value ): bool {
		if ( ! isset( $value['override-key'] ) || ! is_string( $value['override-key'] ) || ! isset( $value['default'] ) || ! is_array( $value['default'] ) ) {
			return false;
		}

		return Props_Parser::make( Has_Atomic_Base::get_props_schema() )
			->validate( $value['default'] )
			->is_valid();
	}

	protected function sanitize_value( $value ): array {
		$sanitized_override_key = sanitize_text_field( $value['override-key'] );
		$sanitized_default = Props_Parser::make( Has_Atomic_Base::get_props_schema() )
			->sanitize( $value['default'] )
			->unwrap();

		return [
			'override-key' => $sanitized_override_key,
			'default' => $sanitized_default,
		];
	}
}
