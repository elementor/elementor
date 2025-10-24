<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Factories;

use Elementor\Modules\CssConverter\Services\Css\Processing\Style_Factory_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Styles\Reset_Element_Style;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reset_Element_Style_Factory implements Style_Factory_Interface {

	public function create_styles( array $data ): array {
		$styles = [];
		$element_type = $data['element_type'];
		$properties = $data['properties'];
		$order_offset = $data['order_offset'] ?? 0;

		foreach ( $properties as $property_data ) {
			$specificity = $this->calculate_specificity( $property_data['important'] ?? false );

			$styles[] = new Reset_Element_Style([
				'property' => $property_data['property'],
				'value' => $property_data['value'],
				'specificity' => $specificity,
				'order' => $order_offset++,
				'converted_property' => $property_data['converted_property'] ?? null,
				'important' => $property_data['important'] ?? false,
				'element_type' => $element_type,
			]);
		}

		return $styles;
	}

	public function get_specificity_weight(): int {
		return Css_Specificity_Calculator::ELEMENT_WEIGHT;
	}

	private function calculate_specificity( bool $important ): int {
		$specificity = $this->get_specificity_weight();
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}
}
