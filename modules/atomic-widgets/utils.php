<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Utils {
	public static function is_atomic( $element_instance ): bool {
		return $element_instance instanceof Atomic_Element_Base ||
			$element_instance instanceof Atomic_Widget_Base;
	}
}
