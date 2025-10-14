<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Nested_Class_Mapping_Service {

	private $class_mappings = [];
	private $parser;
	private $name_generator;

	public function __construct( 
		Nested_Selector_Parser $parser = null,
		Flattened_Class_Name_Generator $name_generator = null
	) {
		$this->parser = $parser ?: Nested_Selector_Parser::make();
		$this->name_generator = $name_generator ?: Flattened_Class_Name_Generator::make();
	}

	public static function make(): self {
		return new self();
	}

	public function build_class_mappings( array $nested_selectors ): void {
		$this->class_mappings = [];

		foreach ( $nested_selectors as $selector ) {
			if ( ! $this->parser->is_nested_selector( $selector ) ) {
				continue;
			}

			$parsed_selector = $this->parser->parse_nested_selector( $selector );
			if ( null === $parsed_selector ) {
				continue;
			}

			$this->create_mapping_for_parsed_selector( $parsed_selector );
		}
	}

	private function create_mapping_for_parsed_selector( array $parsed_selector ): void {
		$target = $parsed_selector['target'];
		$original_selector = $parsed_selector['original_selector'];

		// Extract the target class name (remove . prefix)
		$target_class = $this->extract_class_name_from_target( $target );
		if ( empty( $target_class ) ) {
			return;
		}

		// Generate flattened class name
		$flattened_class_name = $this->name_generator->generate_flattened_class_name( $parsed_selector );

		// Store the mapping
		$this->class_mappings[ $target_class ] = [
			'original_class' => $target_class,
			'flattened_class' => $flattened_class_name,
			'original_selector' => $original_selector,
			'target' => $target,
			'context' => $parsed_selector['context'] ?? [],
			'type' => $parsed_selector['type'] ?? 'unknown',
		];
	}

	private function extract_class_name_from_target( string $target ): string {
		// Handle various target formats:
		// .second -> second
		// h1 -> h1 (element selector)
		// .second.active -> second (first class)
		
		$target = trim( $target );
		
		// If it starts with a dot, it's a class selector
		if ( strpos( $target, '.' ) === 0 ) {
			// Extract first class name
			if ( preg_match( '/^\.([a-zA-Z0-9_-]+)/', $target, $matches ) ) {
				return $matches[1];
			}
		}
		
		// If it's an element selector (h1, p, div, etc.)
		if ( preg_match( '/^([a-zA-Z][a-zA-Z0-9]*)\b/', $target, $matches ) ) {
			return $matches[1];
		}
		
		return '';
	}

	public function get_flattened_class_name( string $original_class ): ?string {
		if ( ! isset( $this->class_mappings[ $original_class ] ) ) {
			return null;
		}

		// Return the flattened class name directly (it's a string, not an array)
		return $this->class_mappings[ $original_class ];
	}

	public function has_mapping_for_class( string $class_name ): bool {
		return isset( $this->class_mappings[ $class_name ] );
	}

	public function get_mapping_info( string $class_name ): ?array {
		return $this->class_mappings[ $class_name ] ?? null;
	}

	public function get_all_mappings(): array {
		return $this->class_mappings;
	}

	public function get_original_classes(): array {
		return array_keys( $this->class_mappings );
	}

	public function get_flattened_classes(): array {
		// Return the flattened class names (values) from the mappings
		return array_values( $this->class_mappings );
	}

	public function get_mapping_summary(): array {
		return [
			'total_mappings' => count( $this->class_mappings ),
			'original_classes' => $this->get_original_classes(),
			'flattened_classes' => $this->get_flattened_classes(),
		];
	}

	public function clear_mappings(): void {
		$this->class_mappings = [];
	}

	public function initialize_with_mappings( array $class_mappings ): void {
		// Direct initialization with pre-computed mappings
		$this->class_mappings = $class_mappings;
	}
}
