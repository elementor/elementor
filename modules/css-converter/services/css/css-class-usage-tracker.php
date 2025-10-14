<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Class_Usage_Tracker {

	private $class_usage_map = [];
	private $nested_selectors = [];

	public static function make(): self {
		return new self();
	}

	public function track_css_rules( array $css_rules ): void {
		$this->class_usage_map = [];
		$this->nested_selectors = [];

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( empty( $selector ) ) {
				continue;
			}

			$this->analyze_selector( $selector );
		}
	}

	private function analyze_selector( string $selector ): void {
		$selector = trim( $selector );

		// Check if this is a nested selector (contains space or >)
		if ( $this->is_nested_selector( $selector ) ) {
			$this->track_nested_selector( $selector );
		} else {
			$this->track_direct_selector( $selector );
		}
	}

	private function is_nested_selector( string $selector ): bool {
		// Pattern 1: Descendant selector (space)
		if ( preg_match( '/\s(?![^()]*\)|[^\[]*\]|[^"]*")/', $selector ) ) {
			return true;
		}
		
		// Pattern 2: Child selector (>)
		if ( preg_match( '/>(?![^()]*\)|[^\[]*\]|[^"]*")/', $selector ) ) {
			return true;
		}
		
		return false;
	}

	private function track_nested_selector( string $selector ): void {
		$this->nested_selectors[] = $selector;

		// Extract all class names from nested selector
		$class_names = $this->extract_class_names_from_selector( $selector );
		
		foreach ( $class_names as $class_name ) {
			// Mark classes that appear in nested selectors
			// These might not have direct styles
			if ( ! isset( $this->class_usage_map[ $class_name ] ) ) {
				$this->class_usage_map[ $class_name ] = [
					'has_direct_styles' => false,
					'appears_in_nested' => true,
					'selectors' => [ $selector ],
				];
			} else {
				$this->class_usage_map[ $class_name ]['appears_in_nested'] = true;
				$this->class_usage_map[ $class_name ]['selectors'][] = $selector;
			}
		}
	}

	private function track_direct_selector( string $selector ): void {
		$class_names = $this->extract_class_names_from_selector( $selector );
		
		foreach ( $class_names as $class_name ) {
			// Mark classes that have direct styles
			if ( ! isset( $this->class_usage_map[ $class_name ] ) ) {
				$this->class_usage_map[ $class_name ] = [
					'has_direct_styles' => true,
					'appears_in_nested' => false,
					'selectors' => [ $selector ],
				];
			} else {
				$this->class_usage_map[ $class_name ]['has_direct_styles'] = true;
				$this->class_usage_map[ $class_name ]['selectors'][] = $selector;
			}
		}
	}

	private function extract_class_names_from_selector( string $selector ): array {
		$class_names = [];
		
		// Match all class selectors (.classname)
		if ( preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $selector, $matches ) ) {
			$class_names = $matches[1]; // Get captured groups (class names without dots)
		}
		
		return array_unique( $class_names );
	}

	public function should_keep_class( string $class_name ): bool {
		if ( ! isset( $this->class_usage_map[ $class_name ] ) ) {
			// Class not found in CSS - remove it
			return false;
		}

		// Keep class if it has direct styles
		return $this->class_usage_map[ $class_name ]['has_direct_styles'];
	}

	public function get_class_usage_info( string $class_name ): ?array {
		return $this->class_usage_map[ $class_name ] ?? null;
	}

	public function get_all_tracked_classes(): array {
		return array_keys( $this->class_usage_map );
	}

	public function get_classes_with_direct_styles(): array {
		$classes_with_styles = [];
		
		foreach ( $this->class_usage_map as $class_name => $usage_info ) {
			if ( $usage_info['has_direct_styles'] ) {
				$classes_with_styles[] = $class_name;
			}
		}
		
		return $classes_with_styles;
	}

	public function get_classes_only_in_nested_selectors(): array {
		$nested_only_classes = [];
		
		foreach ( $this->class_usage_map as $class_name => $usage_info ) {
			if ( ! $usage_info['has_direct_styles'] && $usage_info['appears_in_nested'] ) {
				$nested_only_classes[] = $class_name;
			}
		}
		
		return $nested_only_classes;
	}

	public function get_nested_selectors(): array {
		return $this->nested_selectors;
	}

	public function get_usage_summary(): array {
		return [
			'total_classes_tracked' => count( $this->class_usage_map ),
			'classes_with_direct_styles' => count( $this->get_classes_with_direct_styles() ),
			'classes_only_in_nested' => count( $this->get_classes_only_in_nested_selectors() ),
			'nested_selectors_found' => count( $this->nested_selectors ),
		];
	}

	public function initialize_with_class_lists( 
		array $classes_with_direct_styles, 
		array $classes_only_in_nested 
	): void {
		// Clear existing data
		$this->class_usage_map = [];
		$this->nested_selectors = [];
		
		// Initialize classes with direct styles
		foreach ( $classes_with_direct_styles as $class_name ) {
			$this->class_usage_map[ $class_name ] = [
				'has_direct_styles' => true,
				'appears_in_nested' => false,
			];
		}
		
		// Initialize classes that only appear in nested selectors
		foreach ( $classes_only_in_nested as $class_name ) {
			$this->class_usage_map[ $class_name ] = [
				'has_direct_styles' => false,
				'appears_in_nested' => true,
			];
		}
	}
}
