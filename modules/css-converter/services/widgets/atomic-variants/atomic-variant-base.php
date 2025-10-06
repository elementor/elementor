<?php

namespace Elementor\Modules\CssConverter\Services\Widgets\AtomicVariants;

trait Atomic_Variant_Base {
	
	protected function define_base_styles(): array {
		return [];
	}
	
	protected function get_variant_type(): string {
		return 'css-converter';
	}
	
	public function is_css_converter_variant(): bool {
		return true;
	}
}
