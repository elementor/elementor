<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Actions_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'actions';
	}

	protected function define_item_type(): Prop_Type {
		return Union_Prop_Type::make()
			->add_prop_type( Event_Action_Prop_Type::make() )
			->add_prop_type( Input_Action_Prop_Type::make() );
	}
}
