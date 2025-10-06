<?php

namespace Elementor\Modules\CssConverter\Services\Widgets;

use Elementor\Modules\CssConverter\Services\Widgets\AtomicVariants\Css_Converter_Atomic_Heading;
use Elementor\Modules\CssConverter\Services\Widgets\AtomicVariants\Css_Converter_Atomic_Paragraph;
use Elementor\Modules\CssConverter\Services\Widgets\AtomicVariants\Css_Converter_Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;

class Widget_Class_Resolver {
	private $use_zero_defaults;
	private $variant_mapping;
	private $standard_mapping;
	
	public function __construct( $use_zero_defaults = false ) {
		$this->use_zero_defaults = $use_zero_defaults;
		$this->init_mappings();
	}
	
	private function init_mappings() {
		$this->variant_mapping = [
			'e-heading' => Css_Converter_Atomic_Heading::class,
			'e-paragraph' => Css_Converter_Atomic_Paragraph::class,
			'e-button' => Css_Converter_Atomic_Button::class,
		];
		
		$this->standard_mapping = [
			'e-heading' => Atomic_Heading::class,
			'e-paragraph' => Atomic_Paragraph::class,
			'e-button' => Atomic_Button::class,
		];
	}
	
	public function resolve( $widget_type ) {
		$mapping = $this->use_zero_defaults 
			? $this->variant_mapping 
			: $this->standard_mapping;
		
		return $mapping[ $widget_type ] ?? null;
	}
	
	public function get_supported_types(): array {
		return array_keys( $this->variant_mapping );
	}
	
	public function supports_zero_defaults( $widget_type ): bool {
		return isset( $this->variant_mapping[ $widget_type ] );
	}
}
