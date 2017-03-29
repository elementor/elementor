<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Base_UI_Control extends Base_Control {

	public static function get_features() {
		return [ 'ui' ];
	}
}
