<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Processing\Reset_Style_Detector;
use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reset_Styles_Processor implements Css_Processor_Interface {

	private $reset_style_detector;
	private $property_converter;

	public function __construct(
		Reset_Style_Detector $reset_style_detector,
		Css_Property_Conversion_Service $property_converter
	) {
		$this->reset_style_detector = $reset_style_detector;
		$this->property_converter = $property_converter;
	}

	public function get_processor_name(): string {
		return 'reset-styles';
	}

	public function get_priority(): int {
		return 12; // Early: After CSS parsing, before nested element processing
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		// Early execution: We'll create our own unified_style_manager if needed
		return ! empty( $css_rules ) && ! empty( $widgets );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();
		$unified_style_manager = $context->get_metadata( 'unified_style_manager' );

		// DEBUG: Log CSS rules before processing
		foreach ( $css_rules as $index => $rule ) {
			$selector = $rule['selector'] ?? 'unknown';
			$properties_count = count( $rule['properties'] ?? [] );
		}

		// Create unified_style_manager if it doesn't exist (early execution)
		if ( ! $unified_style_manager ) {
			$unified_style_manager = new \Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager(
				new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator(),
				$this->property_converter
			);
			$context->set_metadata( 'unified_style_manager', $unified_style_manager );
		}

		if ( empty( $css_rules ) || empty( $widgets ) ) {
			return $context;
		}

		$element_rules = $this->reset_style_detector->extract_element_selector_rules( $css_rules );

		if ( empty( $element_rules ) ) {
			return $context;
		}

		$conflict_analysis = $this->reset_style_detector->analyze_element_selector_conflicts(
			$element_rules,
			$css_rules
		);

		$reset_element_styles = 0;
		$reset_complex_styles = 0;
		$complex_reset_styles = [];

		foreach ( $element_rules as $selector => $rules ) {
			$can_apply_directly = $this->reset_style_detector->can_apply_directly_to_widgets(
				$selector,
				$conflict_analysis
			);

			if ( $can_apply_directly ) {
				$styles_applied = $this->apply_reset_styles_directly_to_widgets(
					$selector,
					$rules,
					$widgets,
					$unified_style_manager
				);
				$reset_element_styles += $styles_applied;
			} else {
				$this->collect_complex_reset_styles_for_css_file(
					$selector,
					$rules,
					$conflict_analysis[ $selector ] ?? [],
					$unified_style_manager
				);
				++$reset_complex_styles;
				$complex_reset_styles[] = [
					'selector' => $selector,
					'rules' => $rules,
					'conflicts' => $conflict_analysis[ $selector ] ?? [],
				];
			}
		}

		// CRITICAL FIX: Remove processed element selector rules from css_rules
		// This prevents other processors from processing the same rules as "element" styles
		// which was causing H5/H6 font-weight:400 to be applied to ALL heading widgets including H1
		$remaining_rules = $this->remove_processed_element_rules( $css_rules, $element_rules );

		// DEBUG: Log what rules are being removed
		$removed_count = count( $css_rules ) - count( $remaining_rules );

		// SPECIFIC DEBUG: Check if our target selectors are being removed
		$target_selectors_removed = [];
		if ( $removed_count > 0 ) {
			foreach ( $css_rules as $rule ) {
				$selector = $rule['selector'] ?? 'unknown';
				if ( isset( $element_rules[ $selector ] ) ) {
					$target_selectors_removed[] = $selector;
				}
			}
		}

		$context->set_metadata( 'css_rules', $remaining_rules );

		$context->set_metadata( 'reset_styles_stats', [
			'reset_element_styles' => $reset_element_styles,
			'reset_complex_styles' => $reset_complex_styles,
		] );
		$context->set_metadata( 'complex_reset_styles', $complex_reset_styles );

		$context->add_statistic( 'reset_element_styles_applied', $reset_element_styles );
		$context->add_statistic( 'reset_complex_styles_detected', $reset_complex_styles );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'reset_element_styles_applied',
			'reset_complex_styles_detected',
		];
	}

	private function remove_processed_element_rules( array $css_rules, array $element_rules ): array {
		$remaining_rules = [];

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			// Keep rules that are NOT simple element selectors processed by this processor
			if ( ! isset( $element_rules[ $selector ] ) ) {
				$remaining_rules[] = $rule;
			}
		}

		return $remaining_rules;
	}

	private function apply_reset_styles_directly_to_widgets(
		string $selector,
		array $rules,
		array $widgets,
		Unified_Style_Manager $unified_style_manager
	): int {
		$matching_widgets = $this->find_widgets_by_element_type( $selector, $widgets );

		if ( empty( $matching_widgets ) ) {
			return 0;
		}

		$properties = [];
		foreach ( $rules as $rule ) {
			if ( isset( $rule['properties'] ) && is_array( $rule['properties'] ) ) {
				foreach ( $rule['properties'] as $property_data ) {
					$property = $property_data['property'] ?? '';
					$value = $property_data['value'] ?? '';

					$converted = $this->convert_property_if_needed( $property, $value );
					$properties[] = [
						'property' => $property,
						'value' => $value,
						'important' => $property_data['important'] ?? false,
						'converted_property' => $converted,
					];
				}
			} elseif ( isset( $rule['property'] ) && isset( $rule['value'] ) ) {
				$property = $rule['property'];
				$value = $rule['value'];

				$converted = $this->convert_property_if_needed( $property, $value );
				$properties[] = [
					'property' => $property,
					'value' => $value,
					'important' => $rule['important'] ?? false,
					'converted_property' => $converted,
				];
			}
		}

		$unified_style_manager->collect_reset_styles(
			$selector,
			$properties,
			$matching_widgets,
			true
		);

		return count( $matching_widgets );
	}

	private function collect_complex_reset_styles_for_css_file(
		string $selector,
		array $rules,
		array $conflicts,
		Unified_Style_Manager $unified_style_manager
	): void {
		$properties = [];
		foreach ( $rules as $rule ) {
			foreach ( $rule['properties'] ?? [] as $property_data ) {
				$properties[] = [
					'property' => $property_data['property'],
					'value' => $property_data['value'],
					'important' => $property_data['important'] ?? false,
				];
			}
		}

		$unified_style_manager->collect_complex_reset_styles(
			$selector,
			$properties,
			$conflicts
		);
	}

	private function find_widgets_by_element_type( string $element_selector, array $widgets ): array {
		$matching_widget_ids = [];
		$element_to_widget_map = $this->get_html_element_to_atomic_widget_mapping();
		$target_widget_type = $element_to_widget_map[ $element_selector ] ?? $element_selector;

		foreach ( $widgets as $widget ) {
			$widget_tag = $widget['original_tag'] ?? $widget['tag'] ?? '';
			$element_id = $widget['element_id'] ?? null;
			$widget_type = $widget['widget_type'] ?? 'unknown';

			// FIXED: Only match exact original_tag, not widget_type
			// This prevents h1 selector from matching h2, h3, h4, h5, h6 widgets
			if ( $widget_tag === $element_selector && $element_id ) {
				$matching_widget_ids[] = $element_id;
			}

			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_widgets_by_element_type( $element_selector, $widget['children'] );
				$matching_widget_ids = array_merge( $matching_widget_ids, $child_matches );
			}
		}

		return $matching_widget_ids;
	}

	private function get_html_element_to_atomic_widget_mapping(): array {
		return [
			'h1' => 'e-heading',
			'h2' => 'e-heading',
			'h3' => 'e-heading',
			'h4' => 'e-heading',
			'h5' => 'e-heading',
			'h6' => 'e-heading',
			'p' => 'e-paragraph',
			'span' => 'e-paragraph',
			'a' => 'e-button',
			'button' => 'e-button',
			'div' => 'e-flexbox',
			'section' => 'e-flexbox',
			'article' => 'e-flexbox',
			'aside' => 'e-flexbox',
			'header' => 'e-flexbox',
			'footer' => 'e-flexbox',
			'main' => 'e-flexbox',
			'nav' => 'e-flexbox',
			'img' => 'e-image',
			'ul' => 'e-flexbox',
			'ol' => 'e-flexbox',
			'li' => 'e-paragraph',
		];
	}

	private function convert_property_if_needed( string $property, string $value ) {
		if ( ! $this->property_converter ) {
			return null;
		}

		try {
			return $this->property_converter->convert_property_to_v4_atomic( $property, $value );
		} catch ( \Exception $e ) {
			return null;
		}
	}
}
