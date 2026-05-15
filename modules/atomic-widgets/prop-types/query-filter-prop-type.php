<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Query_Filter_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'query-filter';
	}

	protected function define_shape(): array {
		return [
			'key'        => String_Prop_Type::make()->required(),
			'values'     => Query_Array_Prop_Type::make(),
			'taxonomies' => String_Array_Prop_Type::make(),
		];
	}
}
