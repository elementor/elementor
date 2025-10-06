<?php

namespace Elementor\Modules\CssConverter\Services\Widgets\AtomicVariants;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;

class Css_Converter_Atomic_Paragraph extends Atomic_Paragraph {
	use Atomic_Variant_Base;
	
	public static function get_element_type(): string {
		return 'e-paragraph';
	}
}
