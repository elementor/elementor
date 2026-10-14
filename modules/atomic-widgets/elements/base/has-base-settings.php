<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Has_Atomic_Base
 */
trait Has_Base_Settings {
	public function get_base_settings(): array {
		return $this->define_base_settings();
	}

	protected function define_base_settings(): array {
		return [];
	}
}
