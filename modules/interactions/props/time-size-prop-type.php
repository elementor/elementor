<?php

namespace Elementor\Modules\Interactions\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Time_Size_Prop_Type extends Size_Prop_Type {
	public static function make() {
		return parent::make()->units( Size_Constants::TIME_UNITS )->default_unit( Size_Constants::UNIT_MILLI_SECOND );
	}
}
