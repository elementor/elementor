<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_Class_Modifier_Processor implements Css_Processor_Interface {
	private $html_class_modifier;

	public function __construct( $html_class_modifier = null ) {
		$this->html_class_modifier = $html_class_modifier;

		if ( null === $this->html_class_modifier ) {
			$this->initialize_html_class_modifier();
		}
	}

	private function initialize_html_class_modifier(): void {
		$this->html_class_modifier = new \Elementor\Modules\CssConverter\Services\Css\Html_Class_Modifier_Service();
	}

	public function get_processor_name(): string {
		return 'html_class_modifier';
	}

	public function get_priority(): int {
		return 101; // CRITICAL FIX: After style resolution (100) to preserve class modifications
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
		$class_name_mappings = $context->get_metadata( 'class_name_mappings', [] );
		$widgets = $context->get_widgets();

		return ! empty( $css_class_modifiers ) || ! empty( $class_name_mappings ) || ! empty( $widgets );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
		$class_name_mappings = $context->get_metadata( 'class_name_mappings', [] );
		$overflow_styles = $context->get_metadata( 'overflow_styles_when_maximum_number_of_global_classes_has_been_reached', [] );
		$widgets = $context->get_widgets();

		foreach ( $css_class_modifiers as $index => $modifier ) {
			$type = $modifier['type'] ?? 'unknown';
			$mappings_count = count( $modifier['mappings'] ?? [] );

			if ( $type === 'flattening' && ! empty( $modifier['mappings'] ) ) {
			}
		}

		// Initialize HTML class modifier with unified modifiers
		if ( ! empty( $css_class_modifiers ) ) {
			$this->html_class_modifier->initialize_with_modifiers( $css_class_modifiers );
		}

		if ( ! empty( $overflow_styles ) ) {
			$this->html_class_modifier->set_overflow_classes( $overflow_styles );
		}

		// Apply class name mappings from duplicate detection
		$widgets_with_final_class_names = $this->apply_class_name_mappings_to_widgets( $widgets, $class_name_mappings );

		// Apply HTML class modifications (flattening, compound, duplicate mappings)
		$widgets_with_applied_classes = $this->apply_html_class_modifications_to_widgets( $widgets_with_final_class_names );

		// Get modification summary
		$html_modification_summary = $this->html_class_modifier->get_modification_summary();

		// Update widgets in context
		$context->set_widgets( $widgets_with_applied_classes );
		$context->set_metadata( 'html_class_modifications', $html_modification_summary );
		$context->set_metadata( 'html_class_modifier', $this->html_class_modifier );

		// Add statistics
		$context->add_statistic( 'widgets_with_class_modifications', $this->count_widgets_with_modifications( $widgets_with_applied_classes ) );
		$context->add_statistic( 'class_mappings_applied', count( $class_name_mappings ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'widgets_with_class_modifications',
			'class_mappings_applied',
		];
	}

	private function apply_class_name_mappings_to_widgets( array $widgets, array $class_name_mappings ): array {
		if ( empty( $class_name_mappings ) ) {
			return $widgets;
		}

		foreach ( $class_name_mappings as $original => $mapped ) {
			if ( strpos( $original, 'brxw-intro-02' ) !== false || strpos( $mapped, 'brxw-intro-02' ) !== false ) {
			}
		}

		// Set the mappings on the HTML class modifier
		$this->html_class_modifier->set_duplicate_class_mappings( $class_name_mappings );

		return $widgets; // The actual modification happens in apply_html_class_modifications_to_widgets
	}

	private function apply_html_class_modifications_to_widgets( array $widgets ): array {
		$modified_widgets = [];

		foreach ( $widgets as $widget ) {
			$modified_widget = $this->apply_html_class_modifications_to_widget_recursively( $widget );
			$modified_widgets[] = $modified_widget;
		}

		return $modified_widgets;
	}

	private function apply_html_class_modifications_to_widget_recursively( array $widget ): array {
		$modified_widget = $this->html_class_modifier->modify_element_classes( $widget );

		if ( ! empty( $modified_widget['children'] ) && is_array( $modified_widget['children'] ) ) {
			$modified_children = [];
			foreach ( $modified_widget['children'] as $child ) {
				$modified_children[] = $this->apply_html_class_modifications_to_widget_recursively( $child );
			}
			$modified_widget['children'] = $modified_children;
		}

		return $modified_widget;
	}

	private function count_widgets_with_modifications( array $widgets ): int {
		$count = 0;

		foreach ( $widgets as $widget ) {
			// Check if widget has class modifications
			if ( $this->widget_has_class_modifications( $widget ) ) {
				++$count;
			}

			// Count children recursively
			if ( ! empty( $widget['children'] ) ) {
				$count += $this->count_widgets_with_modifications( $widget['children'] );
			}
		}

		return $count;
	}

	private function widget_has_class_modifications( array $widget ): bool {
		$classes = $widget['attributes']['class'] ?? '';

		return ! empty( $classes );
	}
}
