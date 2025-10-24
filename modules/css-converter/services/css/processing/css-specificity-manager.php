<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Specificity_Manager {
	private $specificity_calculator;

	public function __construct( Css_Specificity_Calculator $specificity_calculator ) {
		$this->specificity_calculator = $specificity_calculator;
	}

	public function merge_all_styles_with_specificity( array $style_sources, array $widget ): array {
		$all_styles = [];

		$this->add_element_styles( $all_styles, $style_sources );
		$this->add_direct_element_styles( $all_styles, $style_sources );
		$this->add_class_styles( $all_styles, $style_sources, $widget );
		$this->add_widget_styles( $all_styles, $style_sources );
		$this->add_id_styles( $all_styles, $style_sources );
		$this->add_inline_styles( $all_styles, $widget );

		return $all_styles;
	}

	private function add_element_styles( array &$all_styles, array $style_sources ): void {
		if ( empty( $style_sources['element_styles'] ) ) {
			return;
		}

		foreach ( $style_sources['element_styles'] as $style ) {
			$all_styles[] = [
				'property' => $style['property'],
				'value' => $style['value'],
				'specificity' => $style['specificity'] ?? Css_Specificity_Calculator::ELEMENT_WEIGHT,
				'important' => $style['important'] ?? false,
				'source' => 'element',
				'converted_property' => $style['converted_property'] ?? null,
			];
		}
	}

	private function add_direct_element_styles( array &$all_styles, array $style_sources ): void {
		if ( empty( $style_sources['direct_element_styles'] ) ) {
			return;
		}

		foreach ( $style_sources['direct_element_styles'] as $style ) {
			$all_styles[] = [
				'property' => $style['property'],
				'value' => $style['value'],
				'specificity' => $style['specificity'] ?? Css_Specificity_Calculator::ELEMENT_WEIGHT,
				'important' => $style['important'] ?? false,
				'source' => 'direct_element',
				'converted_property' => $style['converted_property'] ?? null,
			];
		}
	}

	private function add_class_styles( array &$all_styles, array $style_sources, array $widget ): void {
		if ( empty( $style_sources['global_classes'] ) ) {
			return;
		}

		$applied_classes = $style_sources['global_classes'];
		if ( empty( $applied_classes ) ) {
			return;
		}

		if ( empty( $style_sources['processing_result']['global_classes'] ) ) {
			return;
		}

		$global_classes_data = $style_sources['processing_result']['global_classes'];

		foreach ( $applied_classes as $class_name ) {
			if ( ! isset( $global_classes_data[ $class_name ] ) ) {
				continue;
			}

			$class_styles = $global_classes_data[ $class_name ];

			foreach ( $class_styles as $style ) {
				$all_styles[] = [
					'property' => $style['property'],
					'value' => $style['value'],
					'specificity' => $style['specificity'] ?? Css_Specificity_Calculator::CLASS_WEIGHT,
					'important' => $style['important'] ?? false,
					'source' => 'class',
					'class_name' => $class_name,
					'converted_property' => $style['converted_property'] ?? null,
				];
			}
		}
	}

	private function add_widget_styles( array &$all_styles, array $style_sources ): void {
		if ( empty( $style_sources['widget_styles'] ) ) {
			return;
		}

		foreach ( $style_sources['widget_styles'] as $style ) {
			$all_styles[] = [
				'property' => $style['property'],
				'value' => $style['value'],
				'specificity' => $style['specificity'] ?? Css_Specificity_Calculator::CLASS_WEIGHT,
				'important' => $style['important'] ?? false,
				'source' => 'widget',
				'converted_property' => $style['converted_property'] ?? null,
			];
		}
	}

	private function add_id_styles( array &$all_styles, array $style_sources ): void {
		if ( empty( $style_sources['id_styles'] ) ) {
			return;
		}

		foreach ( $style_sources['id_styles'] as $style ) {
			if ( ! isset( $style['converted_property'] ) ) {
				continue;
			}

			$all_styles[] = [
				'property' => $style['converted_property']['property'],
				'value' => $style['converted_property']['value'],
				'specificity' => $style['specificity'] ?? Css_Specificity_Calculator::ID_WEIGHT,
				'important' => $style['important'] ?? false,
				'source' => 'id',
				'converted_property' => $style['converted_property'],
			];
		}
	}

	private function add_inline_styles( array &$all_styles, array $widget ): void {
		if ( empty( $widget['inline_css'] ) ) {
			return;
		}

		foreach ( $widget['inline_css'] as $property => $style_data ) {
			// Convert inline style to atomic format (same as CSS rules)
			$converted_property = $this->convert_inline_property_to_atomic( $property, $style_data['value'] );

			$all_styles[] = [
				'property' => $property,
				'value' => $style_data['value'],
				'specificity' => $style_data['important'] ?
					Css_Specificity_Calculator::IMPORTANT_WEIGHT + Css_Specificity_Calculator::INLINE_WEIGHT :
					Css_Specificity_Calculator::INLINE_WEIGHT,
				'important' => $style_data['important'],
				'source' => 'inline',
				'original_property' => $property,
				'converted_property' => $converted_property, // Add the missing converted_property field
			];
		}
	}

	private function convert_inline_property_to_atomic( string $property, $value ): ?array {
		// Use the same conversion service as CSS rules
		$conversion_service = new Css_Property_Conversion_Service();
		return $conversion_service->convert_property_to_v4_atomic( $property, $value );
	}

	public function compute_winning_styles( array $all_styles ): array {
		$grouped_styles = $this->group_styles_by_property( $all_styles );

		$computed_styles = [];
		foreach ( $grouped_styles as $property => $styles ) {
			$winning_style = $this->specificity_calculator->get_winning_style( $styles );
			if ( $winning_style ) {
				$computed_styles[ $property ] = $winning_style;
			}
		}

		return $computed_styles;
	}

	private function group_styles_by_property( array $all_styles ): array {
		$grouped_styles = [];

		foreach ( $all_styles as $index => $style ) {
			$property = $style['original_property'] ?? $style['property'];

			if ( ! isset( $grouped_styles[ $property ] ) ) {
				$grouped_styles[ $property ] = [];
			}

			$style['order'] = $index;
			$grouped_styles[ $property ][] = $style;
		}

		return $grouped_styles;
	}

	public function get_specificity_info( array $style ): array {
		return [
			'specificity' => $style['specificity'] ?? 0,
			'important' => $style['important'] ?? false,
			'source' => $style['source'] ?? 'unknown',
			'order' => $style['order'] ?? 0,
		];
	}
}
