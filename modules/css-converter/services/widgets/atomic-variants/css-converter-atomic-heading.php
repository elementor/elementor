<?php

namespace Elementor\Modules\CssConverter\Services\Widgets\AtomicVariants;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;

class Css_Converter_Atomic_Heading extends Atomic_Heading {
	use Atomic_Variant_Base;
	
	public static function get_element_type(): string {
		return 'e-heading';
	}
}
