<?php

namespace Elementor\Modules\CssConverter\Services\Widgets\AtomicVariants;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;

class Css_Converter_Atomic_Button extends Atomic_Button {
	use Atomic_Variant_Base;
	
	public static function get_element_type(): string {
		return 'e-button';
	}
}
