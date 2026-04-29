<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Emails_Prop_Type extends Email_Prop_Type {
	public static function get_key(): string {
		return 'emails';
	}

	protected function define_shape(): array {
		$shape = parent::define_shape();
		$shape['to'] = String_Array_Prop_Type::make()->required();
		$shape['cc'] = String_Array_Prop_Type::make();
		$shape['bcc'] = String_Array_Prop_Type::make();

		return $shape;
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$to = $value['to'] ?? null;

		return is_array( $to ) && ! empty( $to['value'] );
	}
}
