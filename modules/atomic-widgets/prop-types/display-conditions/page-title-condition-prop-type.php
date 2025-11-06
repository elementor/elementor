<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Display_Conditions;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Page_Title_Condition_Prop_Type extends Object_Prop_Type {

	public static function get_key(): string {
		return 'page-title-condition';
	}

	protected function validate_value( $value ): bool {
		return true;
	}

	protected function define_shape(): array {
		return [
			'operator' => String_Prop_Type::make()
				->enum( [ '==', '!=' ] )
				->default( '==' )
				->required(),
			'value' => String_Prop_Type::make()
				->required(),
		];
	}
}
