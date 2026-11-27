<?php

namespace Elementor\Modules\Interactions\Validators;

use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Validators\String_Value as StringValueValidator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Trigger_Value {
	public static function is_valid( $trigger_prop_value ) {
		return StringValueValidator::is_valid( $trigger_prop_value, Presets::triggers_options() );
	}
}
