<?php
namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Overrides_Prop_type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'component-overrides';
	}

	protected function define_item_type(): Prop_Type {
		return Component_Override_Prop_type::make();
	}

	
}