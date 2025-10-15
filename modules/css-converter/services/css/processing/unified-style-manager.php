<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

use Elementor\Modules\CssConverter\Services\Css\Processing\Factories\Inline_Style_Factory;
use Elementor\Modules\CssConverter\Services\Css\Processing\Factories\Id_Style_Factory;
use Elementor\Modules\CssConverter\Services\Css\Processing\Factories\Css_Selector_Style_Factory;
use Elementor\Modules\CssConverter\Services\Css\Processing\Factories\Element_Style_Factory;
use Elementor\Modules\CssConverter\Services\Css\Processing\Factories\Reset_Element_Style_Factory;
use Elementor\Modules\CssConverter\Services\Css\Processing\Factories\Complex_Reset_Style_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Unified_Style_Manager {
	private $collected_styles = [];
	private $styles = [];
	private $specificity_calculator;
	private $property_converter;
	private $factories = [];

	public function __construct(
		Css_Specificity_Calculator $specificity_calculator,
		$property_converter = null
	) {
		$this->specificity_calculator = $specificity_calculator;
		$this->property_converter = $property_converter;
		$this->register_factories();
	}

	private function register_factories(): void {
		$this->factories['inline'] = new Inline_Style_Factory();
		$this->factories['id'] = new Id_Style_Factory();
		$this->factories['css-selector'] = new Css_Selector_Style_Factory();
		$this->factories['element'] = new Element_Style_Factory();
		$this->factories['reset-element'] = new Reset_Element_Style_Factory();
		$this->factories['complex-reset'] = new Complex_Reset_Style_Factory();
	}

	public function reset(): void {
		$this->collected_styles = [];
		$this->styles = [];
	}

	public function collect_style( Style_Interface $style ): void {
		$this->styles[] = $style;
	}

	public function collect_inline_styles( string $element_id, array $inline_styles ): void {
		$factory = $this->factories['inline'];
		$styles = $factory->create_styles([
			'element_id' => $element_id,
			'styles' => $inline_styles,
			'order_offset' => count( $this->styles ),
		]);

		foreach ( $styles as $style ) {
			$this->collect_style( $style );
		}

		// Keep backward compatibility with old array format
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

	public function collect_id_selector_styles( string $selector, array $properties, array $matched_elements = [] ) {
		error_log( "🔥 COLLECT_ID_SELECTOR: selector='$selector', properties=" . count( $properties ) . ", elements=" . count( $matched_elements ) );
		if ( strpos( $selector, '#text' ) !== false ) {
			error_log( "🔍 PROPERTY_DATA: " . json_encode( $properties ) );
		}
		foreach ( $properties as $property_data ) {
			foreach ( $matched_elements as $element_id ) {
				$this->collected_styles[] = [
					'source' => 'id-selector',
					'selector' => $selector,
					'element_id' => $element_id,
					'property' => $property_data['original_property'] ?? $property_data['property'],
					'value' => $property_data['original_value'] ?? $property_data['value'],
					'important' => $property_data['important'] ?? false,
					'specificity' => $this->calculate_id_selector_specificity( $selector, $property_data['important'] ?? false ),
					'converted_property' => $property_data['converted_property'] ?? null,
					'order' => count( $this->collected_styles ),
				];
			}
		}
	}

	public function collect_id_styles( string $id, array $properties, string $element_id ): void {
		$factory = $this->factories['id'];
		$styles = $factory->create_styles([
			'id' => $id,
			'element_id' => $element_id,
			'properties' => $properties,
			'order_offset' => count( $this->styles ),
		]);

		foreach ( $styles as $style ) {
			$this->collect_style( $style );
		}

		// Keep backward compatibility with old array format
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
		// Use pure resolution with new Style objects
		$pure_resolved = $this->resolve_styles_for_widget_pure( $widget );
		
		// Also use legacy resolution for backward compatibility
		$legacy_resolved = $this->resolve_styles_for_widget_legacy( $widget );
		
		// For now, return legacy resolution but log pure resolution for comparison
		error_log( '🔥 PURE_RESOLUTION: ' . wp_json_encode( array_keys( $pure_resolved ) ) );
		error_log( '🔥 LEGACY_RESOLUTION: ' . wp_json_encode( array_keys( $legacy_resolved ) ) );
		
		return $legacy_resolved;
	}

	public function resolve_styles_for_widget_pure( array $widget ): array {
		// Filter applicable styles using interface matching
		$applicable_styles = $this->filter_styles_for_widget_pure( $widget );

		// Group by property using interface methods
		$by_property = $this->group_by_property_pure( $applicable_styles );

		// Find winning style for each property using interface methods
		$winning_styles = [];
		foreach ( $by_property as $property => $styles ) {
			$winner = $this->find_winning_style_pure( $styles );
			if ( $winner ) {
				$winning_styles[ $property ] = $this->convert_style_to_array( $winner );
			}
		}

		return $winning_styles;
	}

	private function resolve_styles_for_widget_legacy( array $widget ): array {
		$widget_id = $this->get_widget_identifier( $widget );
		$html_id = $widget['attributes']['id'] ?? 'NO_HTML_ID';

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
			'total_pure_styles' => count( $this->styles ),
			'by_source' => [],
			'by_property' => [],
		];

		$id_selectors_processed = 0;

		// Count legacy collected styles
		foreach ( $this->collected_styles as $style ) {
			$source = $style['source'];
			$property = $style['property'];

			$stats['by_source'][ $source ] = ( $stats['by_source'][ $source ] ?? 0 ) + 1;
			$stats['by_property'][ $property ] = ( $stats['by_property'][ $property ] ?? 0 ) + 1;

			// Count ID selectors (both legacy 'id' and new 'id-selector')
			if ( 'id' === $source || 'id-selector' === $source ) {
				++$id_selectors_processed;
			}
		}

		// Count pure Style objects
		foreach ( $this->styles as $style ) {
			$source = $style->get_source();
			$property = $style->get_property();

			$stats['by_source'][ $source ] = ( $stats['by_source'][ $source ] ?? 0 ) + 1;
			$stats['by_property'][ $property ] = ( $stats['by_property'][ $property ] ?? 0 ) + 1;

			// Count ID selectors from pure styles (both legacy 'id' and new 'id-selector')
			if ( 'id' === $source || 'id-selector' === $source ) {
				++$id_selectors_processed;
			}
		}

		// Add reset styles statistics
		$stats['reset_styles'] = $this->get_reset_styles_stats();

		// Add ID selectors count for test compatibility
		$stats['id_selectors_processed'] = $id_selectors_processed;

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

	private function calculate_id_selector_specificity( string $selector, bool $important ): int {
		// Use the CSS specificity calculator for accurate compound selector calculation
		// e.g., #container.box = 100 (ID) + 10 (class) = 110
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

	private function filter_styles_for_widget_pure( array $widget ): array {
		return array_filter( $this->styles, function( Style_Interface $style ) use ( $widget ) {
			return $style->matches( $widget );
		});
	}

	private function group_by_property_pure( array $styles ): array {
		$grouped = [];

		foreach ( $styles as $style ) {
			$property = $style->get_property();
			if ( ! isset( $grouped[ $property ] ) ) {
				$grouped[ $property ] = [];
			}
			$grouped[ $property ][] = $style;
		}

		return $grouped;
	}

	private function find_winning_style_pure( array $styles ): ?Style_Interface {
		if ( empty( $styles ) ) {
			return null;
		}

		$property = ! empty( $styles ) ? $styles[0]->get_property() : 'unknown';
		if ( 'background-color' === $property || 'background_color' === $property ) {
			error_log( "  🏆 WINNER_SELECTION: Comparing " . count( $styles ) . " styles for $property" );
			foreach ( $styles as $idx => $style ) {
				$selector = method_exists( $style, 'get_selector' ) ? $style->get_selector() : 'N/A';
				error_log( "    [$idx] selector='$selector' specificity={$style->get_specificity()} order={$style->get_order()} value={$style->get_value()}" );
			}
		}

		usort( $styles, function( Style_Interface $a, Style_Interface $b ) {
			if ( $a->get_specificity() !== $b->get_specificity() ) {
				return $b->get_specificity() - $a->get_specificity();
			}
			return $b->get_order() - $a->get_order();
		});

		if ( 'background-color' === $property || 'background_color' === $property ) {
			$winner = $styles[0];
			$winner_selector = method_exists( $winner, 'get_selector' ) ? $winner->get_selector() : 'N/A';
			error_log( "    ✅ WINNER: selector='$winner_selector' specificity={$winner->get_specificity()} value={$winner->get_value()}" );
		}

		return $styles[0];
	}

	private function convert_style_to_array( Style_Interface $style ): array {
		return [
			'source' => $style->get_source(),
			'property' => $style->get_property(),
			'value' => $style->get_value(),
			'specificity' => $style->get_specificity(),
			'converted_property' => $style->get_converted_property(),
			'important' => $style->is_important(),
			'order' => $style->get_order(),
		];
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

				case 'id-selector':
					$applies = ( $style['element_id'] === $element_id );
					if ( strpos( $style['selector'], '#text' ) !== false ) {
						error_log( "🔍 ID_SELECTOR_FILTER: selector='{$style['selector']}', style_element_id='{$style['element_id']}', widget_element_id='$element_id', applies=" . ( $applies ? 'YES' : 'NO' ) );
					}
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

		// Debug styles competition for #text selector
		if ( ! empty( $styles ) && strpos( $styles[0]['selector'] ?? '', '#text' ) !== false ) {
			error_log( "🏆 STYLE_COMPETITION: " . count( $styles ) . " styles competing for property '" . ( $styles[0]['property'] ?? 'unknown' ) . "'" );
			foreach ( $styles as $i => $style ) {
				error_log( "  [$i] source='{$style['source']}', selector='{$style['selector']}', value='{$style['value']}', specificity={$style['specificity']}, important=" . ( $style['important'] ? 'true' : 'false' ) );
			}
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
