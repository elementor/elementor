<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\BlurFilter_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\BrightnessFilter_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Filter_Prop_Type extends Array_Prop_Type {

	public static function get_key(): string {
		return 'filter';
	}

	protected function define_item_type(): Prop_Type {
		return Union_Prop_Type::make()
				->add_prop_type( BlurFilter_Prop_Type::make() )
				->add_prop_type( BrightnessFilter_Prop_Type::make() );
	}
}
