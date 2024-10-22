<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Transformable_Prop_Type extends Prop_Type {
	public static function get_key(): string;
}
