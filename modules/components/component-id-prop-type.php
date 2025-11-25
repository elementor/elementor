<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Id_Prop_Type extends Number_Prop_Type {
	public static function get_key(): string {
		return 'component-id';
	}
}
