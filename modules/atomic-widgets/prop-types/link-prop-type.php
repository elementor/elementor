<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'link';
	}

	protected function define_shape(): array {
		return [
			'destination' => Union_Prop_Type::make()
				->add_prop_type( Link_Control_Url_Prop_Type::make() )
				->add_prop_type( Number_Prop_Type::make() )
				->required(),
			'label' => Union_Prop_Type::make()
				->add_prop_type( String_Prop_Type::make() ),
			'isTargetBlank' => Boolean_Prop_Type::make(),
		];
	}
}
