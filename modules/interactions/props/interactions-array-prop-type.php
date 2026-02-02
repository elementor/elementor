<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Interactions_Array_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'interactions-array';
	}

	protected function define_item_type(): Prop_Type {
		return Interaction_Item_Prop_Type::make();
	}
}
