<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/css-selector-utils.php';

class Nested_Class_Mapping_Service {

	private $class_mappings = [];
	private $parser;
	private $name_generator;

	public function __construct(
		Nested_Selector_Parser $parser = null,
		Flattened_Class_Name_Generator $name_generator = null
	) {
		$this->parser = null !== $parser ? $parser : Nested_Selector_Parser::make();
		$this->name_generator = null !== $name_generator ? $name_generator : Flattened_Class_Name_Generator::make();
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

		$target_class = $this->extract_class_name_from_target( $target );
		if ( empty( $target_class ) ) {
			return;
		}

		$flattened_class_name = $this->name_generator->generate_flattened_class_name( $parsed_selector );

		if ( $this->should_skip_flattened_class_generation( $flattened_class_name ) ) {
			return;
		}

		$this->store_class_mapping( $target_class, $flattened_class_name, $original_selector, $target, $parsed_selector );
	}

	private function extract_class_name_from_target( string $target ): string {
		return Css_Selector_Utils::extract_class_name_from_target( $target );
	}

	private function should_skip_flattened_class_generation( string $flattened_class_name ): bool {
		return empty( $flattened_class_name );
	}

	private function store_class_mapping(
		string $target_class,
		string $flattened_class_name,
		string $original_selector,
		string $target,
		array $parsed_selector
	): void {
		// EVIDENCE: Track all mappings being created
		error_log( '🔍 EVIDENCE: nested-class-mapping-service.php:' . __LINE__ . ' - Creating mapping' );
		error_log( '🔍 EVIDENCE: - target_class: ' . $target_class );
		error_log( '🔍 EVIDENCE: - flattened_class_name: ' . $flattened_class_name );
		error_log( '🔍 EVIDENCE: - original_selector: ' . $original_selector );
		error_log( '🔍 EVIDENCE: - target: ' . $target );
		
		if ( strpos( $flattened_class_name, 'fixed' ) !== false ) {
			error_log( '🚨 EVIDENCE: nested-class-mapping-service.php:' . __LINE__ . ' - FIXED MAPPING CREATED!' );
			error_log( '🚨 EVIDENCE: - Mapping ' . $target_class . ' -> ' . $flattened_class_name );
		}
		
		$this->class_mappings[ $target_class ] = [
			'original_class' => $target_class,
			'flattened_class' => $flattened_class_name,
			'original_selector' => $original_selector,
			'target' => $target,
			'context' => $parsed_selector['context'] ?? [],
			'type' => $parsed_selector['type'] ?? 'unknown',
		];
	}

	public function get_flattened_class_name( string $original_class ): ?string {
		if ( ! isset( $this->class_mappings[ $original_class ] ) ) {
			return null;
		}

		$mapping = $this->class_mappings[ $original_class ];

		return $this->extract_flattened_class_from_mapping( $mapping );
	}

	private function extract_flattened_class_from_mapping( $mapping ): ?string {
		if ( is_array( $mapping ) ) {
			return $mapping['flattened_class'] ?? null;
		}

		if ( is_string( $mapping ) ) {
			return $mapping;
		}

		return null;
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
		$flattened_classes = [];
		foreach ( $this->class_mappings as $mapping ) {
			$flattened_class = $this->extract_flattened_class_from_mapping( $mapping );
			if ( null !== $flattened_class ) {
				$flattened_classes[] = $flattened_class;
			}
		}
		return $flattened_classes;
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
		$this->class_mappings = $class_mappings;
	}
}
