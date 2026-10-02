<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_Writes_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'state-writes';
	}

	protected function define_item_type(): Prop_Type {
		return State_Write_Prop_Type::make();
	}
}
