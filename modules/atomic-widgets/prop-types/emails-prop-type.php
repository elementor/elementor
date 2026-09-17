<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\DynamicTags\Module as Dynamic_Tags_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Emails_Prop_Type extends Email_Prop_Type {
	public static function get_key(): string {
		return 'emails';
	}

	protected function define_shape(): array {
		$shape = parent::define_shape();
		$shape['to'] = Union_Prop_Type::make()
			->add_prop_type( String_Array_Prop_Type::make()->required() )
			->add_prop_type(
				Dynamic_Prop_Type::make()->categories( [ Dynamic_Tags_Module::TEXT_CATEGORY ] )
			)
			->required();
		$shape['cc'] = Union_Prop_Type::make()->add_prop_type( String_Array_Prop_Type::make() )
			->add_prop_type(
				Dynamic_Prop_Type::make()->categories( [ Dynamic_Tags_Module::TEXT_CATEGORY ] )
			);
		$shape['bcc'] = Union_Prop_Type::make()->add_prop_type( String_Array_Prop_Type::make() )
			->add_prop_type(
				Dynamic_Prop_Type::make()->categories( [ Dynamic_Tags_Module::TEXT_CATEGORY ] )
			);

		return $shape;
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$to = $value['to'] ?? null;

		if ( Dynamic_Prop_Type::is_dynamic_prop_value( $to ) ) {
			return true; // dynamic prop type validates its own shape
		}

		return is_array( $to ) && ! empty( $to['value'] );
	}
}
