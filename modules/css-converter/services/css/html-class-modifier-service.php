<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_Class_Modifier_Service {

	private $usage_tracker;
	private $mapping_service;

	public function __construct(
		Css_Class_Usage_Tracker $usage_tracker = null,
		Nested_Class_Mapping_Service $mapping_service = null
	) {
		$this->usage_tracker = $usage_tracker ?: Css_Class_Usage_Tracker::make();
		$this->mapping_service = $mapping_service ?: Nested_Class_Mapping_Service::make();
	}

	public static function make(): self {
		return new self();
	}

	public function initialize_from_css_rules( array $css_rules ): void {
		// Track which classes have styles
		$this->usage_tracker->track_css_rules( $css_rules );

		// Build mappings for nested selectors
		$nested_selectors = $this->usage_tracker->get_nested_selectors();
		$this->mapping_service->build_class_mappings( $nested_selectors );
	}

	public function initialize_with_flattening_results(
		array $class_mappings,
		array $classes_with_direct_styles,
		array $classes_only_in_nested
	): void {
		// Direct initialization with pre-computed flattening results
		$this->usage_tracker->initialize_with_class_lists(
			$classes_with_direct_styles,
			$classes_only_in_nested
		);
		$this->mapping_service->initialize_with_mappings( $class_mappings );
	}

	public function modify_element_classes( array $element ): array {
		$original_classes = $this->extract_classes_from_element( $element );
		$modified_classes = [];

		// Process existing class attributes
		foreach ( $original_classes as $class_name ) {
			$modified_class = $this->process_single_class( $class_name );
			if ( null !== $modified_class ) {
				$modified_classes[] = $modified_class;
			}
		}

		// Check if element tag has a flattened mapping (Pattern 5: Element Selectors)
		$element_tag = $element['original_tag'] ?? $element['tag'] ?? '';

		if ( ! empty( $element_tag ) ) {
			// CRITICAL FIX: Check for element tag mapping using pseudo-class format
			$element_pseudo_class = '.' . $element_tag;
			if ( $this->mapping_service->has_mapping_for_class( $element_pseudo_class ) ) {
				$flattened_element_class = $this->mapping_service->get_flattened_class_name( $element_pseudo_class );
				if ( ! empty( $flattened_element_class ) ) {
					$modified_classes[] = $flattened_element_class;
				}
			}
		}

		return $this->update_element_with_classes( $element, $modified_classes );
	}

	private function extract_classes_from_element( array $element ): array {
		$class_attribute = $element['attributes']['class'] ?? '';
		if ( empty( $class_attribute ) ) {
			return [];
		}

		// Split class attribute by spaces and filter out empty values
		$classes = array_filter( explode( ' ', $class_attribute ), function( $class ) {
			return ! empty( trim( $class ) );
		});

		return array_map( 'trim', $classes );
	}

	private function process_single_class( string $class_name ): ?string {
		// Check if this class has a flattened mapping
		if ( $this->mapping_service->has_mapping_for_class( $class_name ) ) {
			// Replace with flattened class name
			return $this->mapping_service->get_flattened_class_name( $class_name );
		}

		// Check if this class should be kept (has direct styles)
		if ( $this->usage_tracker->should_keep_class( $class_name ) ) {
			// Keep original class name
			return $class_name;
		}

		// Class has no styles and no mapping - remove it
		return null;
	}

	private function update_element_with_classes( array $element, array $classes ): array {
		if ( empty( $classes ) ) {
			// Remove class attribute entirely if no classes remain
			if ( isset( $element['attributes']['class'] ) ) {
				unset( $element['attributes']['class'] );
			}
		} else {
			// Update class attribute with modified classes
			$element['attributes']['class'] = implode( ' ', $classes );
		}

		return $element;
	}

	public function get_modification_summary(): array {
		$usage_summary = $this->usage_tracker->get_usage_summary();
		$mapping_summary = $this->mapping_service->get_mapping_summary();

		return [
			'usage_tracking' => $usage_summary,
			'class_mappings' => $mapping_summary,
			'classes_to_remove' => $this->usage_tracker->get_classes_only_in_nested_selectors(),
			'classes_to_keep' => $this->usage_tracker->get_classes_with_direct_styles(),
			'classes_to_flatten' => $this->mapping_service->get_original_classes(),
		];
	}

	public function should_keep_class( string $class_name ): bool {
		return $this->usage_tracker->should_keep_class( $class_name );
	}

	public function get_flattened_class_name( string $original_class ): ?string {
		return $this->mapping_service->get_flattened_class_name( $original_class );
	}

	public function has_mapping_for_class( string $class_name ): bool {
		return $this->mapping_service->has_mapping_for_class( $class_name );
	}
}
