<?php
namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class String_Array_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'string-array';
	}

	protected function define_item_type(): Prop_Type {
		return String_Prop_Type::make();
	}
}
