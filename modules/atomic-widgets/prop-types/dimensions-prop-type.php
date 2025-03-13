<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dimensions_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'dimensions';
	}

	protected function define_shape(): array {
		return [
			'block-start' => Union_Prop_Type::make()
				->add_prop_type( Size_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make()->enum( [ 'auto' ] ) ),
			'inline-end' => Union_Prop_Type::make()
				->add_prop_type( Size_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make()->enum( [ 'auto' ] ) ),
			'block-end' => Union_Prop_Type::make()
				->add_prop_type( Size_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make()->enum( [ 'auto' ] ) ),
			'inline-start' => Union_Prop_Type::make()
				->add_prop_type( Size_Prop_Type::make() )
				->add_prop_type( String_Prop_Type::make()->enum( [ 'auto' ] ) ),
		];
	}
}
