<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Factories;
use Elementor\Modules\CssConverter\Services\Css\Processing\Style_Factory_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Styles\Css_Selector_Style;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Css_Selector_Style_Factory implements Style_Factory_Interface {
	public function create_styles( array $data ): array {
		$styles = [];
		$selector = $data['selector'];
		$element_id = $data['element_id'];
		$properties = $data['properties'];
		$order_offset = $data['order_offset'] ?? 0;
		foreach ( $properties as $property_data ) {
			$specificity = $this->calculate_specificity( $selector, $property_data['important'] ?? false );
			if ( 'background-color' === $property_data['property'] || 'background_color' === $property_data['property'] ) {
			}
			$styles[] = new Css_Selector_Style([
				'property' => $property_data['property'],
				'value' => $property_data['value'],
				'specificity' => $specificity,
				'order' => $order_offset++,
				'converted_property' => $property_data['converted_property'] ?? null,
				'important' => $property_data['important'] ?? false,
				'selector' => $selector,
				'element_id' => $element_id,
			]);
		}
		return $styles;
	}
	public function get_specificity_weight(): int {
		return Css_Specificity_Calculator::CLASS_WEIGHT;
	}
	private function calculate_specificity( string $selector, bool $important ): int {
		$calculator = new Css_Specificity_Calculator();
		return $calculator->calculate_specificity( $selector, $important );
	}
}
