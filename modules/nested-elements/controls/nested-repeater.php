<?php
namespace Elementor\Modules\NestedElements\Controls;

use Elementor\Control_Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Used to override the default repeater control behavior. since `updateActiveRow` should work via:
 * 'nested-elements/nested-repeater/select` command to support history.
 */
class Nested_Repeater extends Control_Repeater {

	const CONTROL_TYPE = 'nested-elements-repeater';

	public function get_type() {
		return self::CONTROL_TYPE;
	}
}
