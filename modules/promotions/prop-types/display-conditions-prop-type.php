<?php
namespace Elementor\Modules\Promotions\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Display_Conditions_Prop_Type extends Array_Prop_Type {

	private const KEY = 'display-conditions';

	public static function get_key(): string {
		return self::KEY;
	}

	protected function define_item_type(): Prop_Type {
		return String_Prop_Type::make();
	}
}
