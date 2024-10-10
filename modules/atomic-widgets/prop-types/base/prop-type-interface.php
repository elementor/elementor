<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Prop_Type_Interface {
	public function get_default();
	public function get_meta(): array;
	public function generate_value( $value );
	public function validate( $value ): bool;
}
