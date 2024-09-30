<?php
namespace Elementor\Modules\Checklist\Traits;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Step_Utils {
	public function new_self( $module = null, $wordpress_adapter = null, $kit_adapter = null, $promotion_data = false ) {
		$class = get_called_class();
		$module = $module ?? $this->module;

		return new $class( $module, $wordpress_adapter, $kit_adapter, $promotion_data );
	}
}
