<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_Class_Modifier_Service {

	private $usage_tracker;
	private $mapping_service;
	private $compound_mappings = [];
	private $duplicate_class_mappings = [];

	public function __construct(
		Css_Class_Usage_Tracker $usage_tracker = null,
		Nested_Class_Mapping_Service $mapping_service = null
	) {
		$this->usage_tracker = $usage_tracker ?? Css_Class_Usage_Tracker::make();
		$this->mapping_service = $mapping_service ?? Nested_Class_Mapping_Service::make();
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

	public function initialize_with_modifiers( array $modifiers ): void {
		foreach ( $modifiers as $modifier ) {
			$type = $modifier['type'] ?? '';
			$mappings = $modifier['mappings'] ?? [];
			$metadata = $modifier['metadata'] ?? [];

			switch ( $type ) {
				case 'flattening':
					$this->apply_flattening_modifiers( $mappings, $metadata );
					break;
				case 'compound':
					$this->apply_compound_modifiers( $mappings, $metadata );
					break;
				default:
					$this->apply_generic_modifiers( $type, $mappings, $metadata );
			}
		}
	}

	private function apply_flattening_modifiers( array $mappings, array $metadata ): void {
		$classes_with_direct_styles = $metadata['classes_with_direct_styles'] ?? [];
		$classes_only_in_nested = $metadata['classes_only_in_nested'] ?? [];

		$this->usage_tracker->initialize_with_class_lists(
			$classes_with_direct_styles,
			$classes_only_in_nested
		);
		$this->mapping_service->initialize_with_mappings( $mappings );
	}

	private function apply_compound_modifiers( array $mappings, array $metadata ): void {
		$this->compound_mappings = $mappings;
	}

	private function apply_generic_modifiers( string $type, array $mappings, array $metadata ): void {
		// Future processor types can be handled here
	}

	/**
	 * @deprecated Use initialize_with_modifiers() instead
	 */
	public function initialize_with_flattening_results(
		array $class_mappings,
		array $classes_with_direct_styles,
		array $classes_only_in_nested
	): void {
		$modifiers = [
			[
				'type' => 'flattening',
				'mappings' => $class_mappings,
				'metadata' => [
					'classes_with_direct_styles' => $classes_with_direct_styles,
					'classes_only_in_nested' => $classes_only_in_nested,
				],
			],
		];
		$this->initialize_with_modifiers( $modifiers );
	}

	/**
	 * @deprecated Use initialize_with_modifiers() instead
	 */
	public function initialize_with_compound_results( array $compound_mappings ): void {
		$modifiers = [
			[
				'type' => 'compound',
				'mappings' => $compound_mappings,
				'metadata' => [],
			],
		];
		$this->initialize_with_modifiers( $modifiers );
	}

	public function set_duplicate_class_mappings( array $duplicate_class_mappings ): void {
		$this->duplicate_class_mappings = $duplicate_class_mappings;
	}

	public function modify_element_classes( array $element ): array {
		$original_classes = $this->extract_classes_from_element( $element );
		$modified_classes = [];

		// EVIDENCE: Track if fixed classes are being processed
		$has_fixed_class = false;
		foreach ( $original_classes as $class ) {
			if ( strpos( $class, 'fixed' ) !== false ) {
				$has_fixed_class = true;
				break;
			}
		}
		if ( $has_fixed_class ) {
		}

		foreach ( $original_classes as $class_name ) {
			$modified_class = $this->process_single_class( $class_name );
			if ( null !== $modified_class ) {
				$modified_classes[] = $modified_class;

				// EVIDENCE: Track what class was modified to what
				if ( $class_name !== $modified_class ) {
					if ( strpos( $modified_class, 'fixed' ) !== false ) {
					}
				}
			}
		}

		$element_tag = $element['original_tag'] ?? $element['tag'] ?? '';

		if ( ! empty( $element_tag ) ) {
			$element_pseudo_class = '.' . $element_tag;
			if ( $this->mapping_service->has_mapping_for_class( $element_pseudo_class ) ) {
				$flattened_element_class = $this->mapping_service->get_flattened_class_name( $element_pseudo_class );
				if ( ! empty( $flattened_element_class ) ) {
					$modified_classes[] = $flattened_element_class;
				}
			}
		}

		$compound_classes = $this->apply_compound_classes( $original_classes );

		// EVIDENCE: Track compound classes being added
		if ( ! empty( $compound_classes ) ) {
			foreach ( $compound_classes as $compound_class ) {
				if ( strpos( $compound_class, 'fixed' ) !== false ) {
				}
			}
		}

		$modified_classes = array_merge( $modified_classes, $compound_classes );

		// EVIDENCE: Track final result if fixed classes involved
		if ( $has_fixed_class ) {
			$final_element = $this->update_element_with_classes( $element, $modified_classes );
			return $final_element;
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
		// Check if this class has a duplicate class mapping first (highest priority)
		if ( isset( $this->duplicate_class_mappings[ $class_name ] ) ) {
			$mapped_name = $this->duplicate_class_mappings[ $class_name ];
			return $mapped_name;
		}

		// Check if this class has a flattened mapping
		if ( $this->mapping_service->has_mapping_for_class( $class_name ) ) {
			// Replace with flattened class name
			$flattened_name = $this->mapping_service->get_flattened_class_name( $class_name );

			// EVIDENCE: Track flattened mapping
			if ( strpos( $flattened_name, 'fixed' ) !== false ) {
			}

			return $flattened_name;
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

	private function apply_compound_classes( array $widget_classes ): array {
		$compound_classes_to_add = [];

		foreach ( $this->compound_mappings as $flattened_name => $compound_info ) {
			$required_classes = $compound_info['requires'] ?? [];

			if ( empty( $required_classes ) ) {
				continue;
			}

			$matches = $this->check_compound_requirements( $widget_classes, $required_classes );

			if ( $matches ) {
				$compound_classes_to_add[] = $flattened_name;
			}
		}

		return $compound_classes_to_add;
	}

	private function check_compound_requirements( array $widget_classes, array $required_classes ): bool {
		foreach ( $required_classes as $required_class ) {
			if ( ! in_array( $required_class, $widget_classes, true ) ) {
				return false;
			}
		}

		return true;
	}
}
