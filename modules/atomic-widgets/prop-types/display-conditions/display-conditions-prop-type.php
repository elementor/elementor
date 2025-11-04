<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Display_Conditions;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Display_Conditions\Page_Title_Condition_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Display_Conditions\Time_Of_Day_Condition_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Display_Conditions_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'display-conditions';
	}

	protected function define_item_type(): Prop_Type {
		return Union_Prop_Type::make()
		->add_prop_type( Page_Title_Condition_Prop_Type::make() )
		->add_prop_type( Time_Of_Day_Condition_Prop_Type::make() );
	}
}
