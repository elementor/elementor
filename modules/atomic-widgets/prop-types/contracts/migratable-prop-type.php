<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Migratable_Prop_Type {
	/**
	 * @return array<string> Array of compatible prop type keys
	 */
	public function get_compatible_type_keys(): array;
}
