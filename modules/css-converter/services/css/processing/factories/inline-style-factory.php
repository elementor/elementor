<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Factories;

use Elementor\Modules\CssConverter\Services\Css\Processing\Style_Factory_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Styles\Inline_Style;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Inline_Style_Factory implements Style_Factory_Interface {

	public function create_styles( array $data ): array {
		$styles = [];
		$element_id = $data['element_id'];
		$inline_styles = $data['styles'];
		$order_offset = $data['order_offset'] ?? 0;

		foreach ( $inline_styles as $property => $style_data ) {
			$specificity = $this->calculate_specificity( $style_data['important'] ?? false );

			$styles[] = new Inline_Style([
				'property' => $property,
				'value' => $style_data['value'],
				'specificity' => $specificity,
				'order' => $order_offset++,
				'converted_property' => $style_data['converted_property'] ?? null,
				'important' => $style_data['important'] ?? false,
				'element_id' => $element_id,
			]);
		}

		return $styles;
	}

	public function get_specificity_weight(): int {
		return Css_Specificity_Calculator::INLINE_WEIGHT;
	}

	private function calculate_specificity( bool $important ): int {
		$specificity = $this->get_specificity_weight();
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}
}
