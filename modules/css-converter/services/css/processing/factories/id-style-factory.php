<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Factories;

use Elementor\Modules\CssConverter\Services\Css\Processing\Style_Factory_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Styles\Id_Style;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Id_Style_Factory implements Style_Factory_Interface {

	public function create_styles( array $data ): array {
		$styles = [];
		$id = $data['id'];
		$element_id = $data['element_id'];
		$properties = $data['properties'];
		$order_offset = $data['order_offset'] ?? 0;

		foreach ( $properties as $property_data ) {
			$specificity = $this->calculate_specificity( $property_data['important'] ?? false );

			$styles[] = new Id_Style([
				'property' => $property_data['property'],
				'value' => $property_data['value'],
				'specificity' => $specificity,
				'order' => $order_offset++,
				'converted_property' => $property_data['converted_property'] ?? null,
				'important' => $property_data['important'] ?? false,
				'id' => $id,
				'element_id' => $element_id,
			]);
		}

		return $styles;
	}

	public function get_specificity_weight(): int {
		return Css_Specificity_Calculator::ID_WEIGHT;
	}

	private function calculate_specificity( bool $important ): int {
		$specificity = $this->get_specificity_weight();
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}
}



