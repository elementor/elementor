<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Unified_Style_Manager {
	private $collected_styles = [];
	private $specificity_calculator;
	private $property_converter;

	public function __construct(
		Css_Specificity_Calculator $specificity_calculator,
		$property_converter = null
	) {
		$this->specificity_calculator = $specificity_calculator;
		$this->property_converter = $property_converter;
	}

	public function reset() {
		$this->collected_styles = [];
	}

	public function collect_inline_styles( string $element_id, array $inline_styles ) {
		foreach ( $inline_styles as $property => $style_data ) {
			$this->collected_styles[] = [
				'source' => 'inline',
				'element_id' => $element_id,
				'property' => $property,
				'value' => $style_data['value'],
				'important' => $style_data['important'] ?? false,
				'converted_property' => $style_data['converted_property'] ?? null,
				'specificity' => $this->calculate_inline_specificity( $style_data['important'] ?? false ),
				'order' => count( $this->collected_styles ),
			];
		}
	}

	public function collect_css_selector_styles( string $selector, array $properties, array $matched_elements = [] ) {
		$base_specificity = $this->specificity_calculator->calculate_specificity( $selector );

		foreach ( $properties as $property_data ) {
			foreach ( $matched_elements as $element_id ) {
				$this->collected_styles[] = [
					'source' => 'css-selector',
					'selector' => $selector,
					'element_id' => $element_id,
					'property' => $property_data['original_property'] ?? $property_data['property'],
					'value' => $property_data['original_value'] ?? $property_data['value'],
					'important' => $property_data['important'] ?? false,
					'specificity' => $this->calculate_css_specificity( $selector, $property_data['important'] ?? false ),
					'converted_property' => $property_data['converted_property'] ?? null,
					'order' => count( $this->collected_styles ),
				];
			}
		}
	}

	public function collect_id_styles( string $id, array $properties, string $element_id ) {
		foreach ( $properties as $property_data ) {
			$this->collected_styles[] = [
				'source' => 'id',
				'id' => $id,
				'element_id' => $element_id,
				'property' => $property_data['property'],
				'value' => $property_data['value'],
				'important' => $property_data['important'] ?? false,
				'specificity' => $this->calculate_id_specificity( $property_data['important'] ?? false ),
				'converted_property' => $property_data['converted_property'] ?? null,
				'order' => count( $this->collected_styles ),
			];
		}
	}

	public function collect_element_styles( string $element_type, array $properties, string $element_id ) {
		foreach ( $properties as $property_data ) {
			$this->collected_styles[] = [
				'source' => 'element',
				'element_type' => $element_type,
				'element_id' => $element_id,
				'property' => $property_data['property'],
				'value' => $property_data['value'],
				'important' => $property_data['important'] ?? false,
				'specificity' => $this->calculate_element_specificity( $property_data['important'] ?? false ),
				'converted_property' => $property_data['converted_property'] ?? null,
				'order' => count( $this->collected_styles ),
			];
		}
	}

	public function collect_direct_element_styles( string $element_id, string $selector, array $properties ) {
		foreach ( $properties as $property => $property_data ) {
			$this->collected_styles[] = [
				'source' => 'direct-element',
				'selector' => $selector,
				'element_id' => $element_id,
				'property' => $property,
				'value' => $property_data['value'],
				'important' => $property_data['important'] ?? false,
				'specificity' => $this->calculate_direct_element_specificity( $property_data['important'] ?? false ),
				'converted_property' => $property_data['converted_property'] ?? null,
				'order' => count( $this->collected_styles ),
			];
		}
	}

	/**
	 * Collect reset styles from element selectors (h1, h2, p, etc.)
	 *
	 * Reset styles are element selector styles that can be applied directly
	 * to atomic widgets without conflicts. This follows the unified-atomic
	 * mapper approach for reset style handling.
	 *
	 * @param string $element_selector Element selector (h1, p, div, etc.)
	 * @param array  $properties CSS properties for this selector
	 * @param array  $matched_widgets Widgets that match this element selector
	 * @param bool   $can_apply_directly Whether this can be applied directly to widgets
	 */
	public function collect_reset_styles(
		string $element_selector,
		array $properties,
		array $matched_widgets = [],
		bool $can_apply_directly = true
	) {
		foreach ( $properties as $property_data ) {
			foreach ( $matched_widgets as $widget_element_id ) {
				$this->collected_styles[] = [
					'source' => 'reset-element',
					'selector' => $element_selector,
					'element_id' => $widget_element_id,
					'property' => $property_data['property'] ?? $property_data['original_property'],
					'value' => $property_data['value'] ?? $property_data['original_value'],
					'important' => $property_data['important'] ?? false,
					'specificity' => $this->calculate_reset_element_specificity(
						$element_selector,
						$property_data['important'] ?? false
					),
					'converted_property' => $property_data['converted_property'] ?? null,
					'can_apply_directly' => $can_apply_directly,
					'order' => count( $this->collected_styles ),
				];
			}
		}
	}

	/**
	 * Collect complex reset styles that require CSS file generation
	 *
	 * These are element selectors that have conflicts or are too complex
	 * for direct widget application (e.g., universal selectors, descendant selectors)
	 *
	 * @param string $complex_selector Complex CSS selector
	 * @param array  $properties CSS properties
	 * @param array  $conflicts Conflict information from Reset_Style_Detector
	 */
	public function collect_complex_reset_styles(
		string $complex_selector,
		array $properties,
		array $conflicts = []
	) {
		// Complex reset styles are collected but marked for CSS file generation
		// They don't get applied directly to widgets
		foreach ( $properties as $property_data ) {
			$this->collected_styles[] = [
				'source' => 'reset-complex',
				'selector' => $complex_selector,
				'element_id' => null, // Not tied to specific element
				'property' => $property_data['property'] ?? $property_data['original_property'],
				'value' => $property_data['value'] ?? $property_data['original_value'],
				'important' => $property_data['important'] ?? false,
				'specificity' => $this->calculate_complex_reset_specificity(
					$complex_selector,
					$property_data['important'] ?? false
				),
				'converted_property' => null, // Not converted - goes to CSS file
				'can_apply_directly' => false,
				'conflicts' => $conflicts,
				'requires_css_file' => true,
				'order' => count( $this->collected_styles ),
			];
		}
	}

	public function resolve_styles_for_widget( array $widget ): array {
		$widget_id = $this->get_widget_identifier( $widget );

		// Get all styles that apply to this widget
		$applicable_styles = $this->filter_styles_for_widget( $widget );

		// Group by property
		$by_property = $this->group_by_property( $applicable_styles );

		// For each property, find the winning style based on specificity
		$winning_styles = [];
		foreach ( $by_property as $property => $styles ) {
			$winning_style = $this->find_winning_style( $styles );
			if ( $winning_style ) {
				$winning_styles[ $property ] = $winning_style;
			}
		}

		return $winning_styles;
	}

	/**
	 * Get complex reset styles that require CSS file generation
	 *
	 * @return array Complex reset styles
	 */
	public function get_complex_reset_styles(): array {
		return array_filter( $this->collected_styles, function( $style ) {
			return $style['source'] === 'reset-complex';
		});
	}

	/**
	 * Get reset styles statistics for debugging
	 *
	 * @return array Reset styles statistics
	 */
	public function get_reset_styles_stats(): array {
		$reset_element_count = 0;
		$reset_complex_count = 0;
		$direct_applicable_count = 0;

		foreach ( $this->collected_styles as $style ) {
			if ( $style['source'] === 'reset-element' ) {
				++$reset_element_count;
				if ( $style['can_apply_directly'] ?? false ) {
					++$direct_applicable_count;
				}
			} elseif ( $style['source'] === 'reset-complex' ) {
				++$reset_complex_count;
			}
		}

		return [
			'reset_element_styles' => $reset_element_count,
			'reset_complex_styles' => $reset_complex_count,
			'direct_applicable_styles' => $direct_applicable_count,
			'requires_css_file_styles' => $reset_complex_count + ( $reset_element_count - $direct_applicable_count ),
		];
	}

	public function get_debug_info(): array {
		$stats = [
			'total_styles' => count( $this->collected_styles ),
			'by_source' => [],
			'by_property' => [],
		];

		foreach ( $this->collected_styles as $style ) {
			$source = $style['source'];
			$property = $style['property'];

			$stats['by_source'][ $source ] = ( $stats['by_source'][ $source ] ?? 0 ) + 1;
			$stats['by_property'][ $property ] = ( $stats['by_property'][ $property ] ?? 0 ) + 1;
		}

		// Add reset styles statistics
		$stats['reset_styles'] = $this->get_reset_styles_stats();

		return $stats;
	}

	private function calculate_inline_specificity( bool $important ): int {
		$specificity = Css_Specificity_Calculator::INLINE_WEIGHT;
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}

	private function calculate_css_specificity( string $selector, bool $important ): int {
		$specificity = $this->specificity_calculator->calculate_specificity( $selector );
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}

	private function calculate_id_specificity( bool $important ): int {
		$specificity = Css_Specificity_Calculator::ID_WEIGHT;
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}

	private function calculate_element_specificity( bool $important ): int {
		$specificity = Css_Specificity_Calculator::ELEMENT_WEIGHT;
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}

	private function calculate_direct_element_specificity( bool $important ): int {
		// Direct element styles have slightly higher priority than standard element styles
		// but lower than class styles (ELEMENT_WEIGHT = 1, CLASS_WEIGHT = 10)
		$specificity = Css_Specificity_Calculator::ELEMENT_WEIGHT + 1;
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}

	/**
	 * Calculate specificity for reset element styles
	 *
	 * Reset element styles have the same specificity as regular element styles
	 * but are processed through the unified manager for proper conflict resolution
	 */
	private function calculate_reset_element_specificity( string $selector, bool $important ): int {
		$specificity = $this->specificity_calculator->calculate_specificity( $selector );
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}

	/**
	 * Calculate specificity for complex reset styles
	 *
	 * Complex reset styles (universal, descendant, etc.) use standard CSS specificity
	 */
	private function calculate_complex_reset_specificity( string $selector, bool $important ): int {
		$specificity = $this->specificity_calculator->calculate_specificity( $selector );
		if ( $important ) {
			$specificity += Css_Specificity_Calculator::IMPORTANT_WEIGHT;
		}
		return $specificity;
	}

	private function get_widget_identifier( array $widget ): string {
		$widget_type = $widget['widget_type'] ?? 'unknown';
		$widget_id = $widget['attributes']['id'] ?? 'no-id';
		$element_id = $widget['element_id'] ?? 'no-element-id';

		return "{$widget_type}#{$element_id}";
	}

	private function filter_styles_for_widget( array $widget ): array {
		$widget_id = $this->get_widget_identifier( $widget );
		$element_id = $widget['element_id'] ?? null;
		$html_id = $widget['attributes']['id'] ?? null;
		$classes = $widget['attributes']['class'] ?? '';
		$element_type = $widget['tag'] ?? $widget['widget_type'] ?? 'unknown';

		$applicable_styles = [];

		foreach ( $this->collected_styles as $style ) {
			$applies = false;

			switch ( $style['source'] ) {
				case 'inline':
					$applies = ( $style['element_id'] === $element_id );
					break;

				case 'id':
					$applies = ( $html_id && $style['id'] === $html_id );
					break;

				case 'css-selector':
					$applies = ( $style['element_id'] === $element_id );
					break;

				case 'element':
					$applies = ( $style['element_type'] === $element_type );
					break;

				case 'reset-element':
					// Reset element styles apply to widgets that match the element selector
					$applies = ( $style['element_id'] === $element_id );
					break;

				case 'reset-complex':
					// Complex reset styles don't apply directly to widgets
					// They are handled via CSS file generation
					$applies = false;
					break;

				case 'direct-element':
					$applies = ( $style['element_id'] === $element_id );
					break;
			}

			if ( $applies ) {
				$applicable_styles[] = $style;
			}
		}

		return $applicable_styles;
	}

	private function group_by_property( array $styles ): array {
		$grouped = [];

		foreach ( $styles as $style ) {
			$property = $style['property'];
			if ( ! isset( $grouped[ $property ] ) ) {
				$grouped[ $property ] = [];
			}
			$grouped[ $property ][] = $style;
		}

		return $grouped;
	}

	private function find_winning_style( array $styles ): ?array {
		if ( empty( $styles ) ) {
			return null;
		}

		// Sort by specificity (highest first), then by order (latest first)
		usort( $styles, function( $a, $b ) {
			if ( $a['specificity'] !== $b['specificity'] ) {
				return $b['specificity'] - $a['specificity']; // Higher specificity wins
			}
			return $b['order'] - $a['order']; // Later in cascade wins
		});

		$winner = $styles[0];

		// Debug log the competition
		if ( count( $styles ) > 1 ) {
			$competitors = array_map( function( $style ) {
				return "{$style['source']}({$style['specificity']})";
			}, $styles );
		}

		return $winner;
	}
}
