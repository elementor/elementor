<?php
namespace Elementor\Modules\CssConverter\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Variable_Conversion_Service;
use Elementor\Modules\CssConverter\ClassConvertors\Class_Property_Mapper_Registry;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

class Class_Conversion_Service {
	private $css_parser;
	private $variable_conversion_service;
	private $property_mapper_registry;
	private $warnings = [];
	private $supported_properties = [ 'color', 'font-size' ];

	public function __construct() {
		$this->css_parser = new CssParser();
		$this->variable_conversion_service = new Variable_Conversion_Service();
		$this->property_mapper_registry = new Class_Property_Mapper_Registry();
	}

	public function convert_css_to_global_classes( string $css ): array {
		try {
			$parsed = $this->css_parser->parse( $css );
			$classes = $this->css_parser->extract_classes( $parsed );
			
			return $this->process_classes( $classes );
			
		} catch ( CssParseException $e ) {
			throw new Class_Conversion_Exception( 'Failed to parse CSS: ' . $e->getMessage() );
		}
	}

	private function process_classes( array $classes ): array {
		$results = [
			'converted_classes' => [],
			'skipped_classes' => [],
			'css_variables' => [],
			'warnings' => [],
			'stats' => [
				'total_classes_found' => count( $classes ),
				'classes_converted' => 0,
				'classes_skipped' => 0,
				'properties_converted' => 0,
				'properties_skipped' => 0,
				'variables_converted' => 0
			]
		];

		$existing_class_names = $this->get_existing_global_class_names();

		foreach ( $classes as $css_class ) {
			$class_name = $this->extract_class_name( $css_class['selector'] );

			if ( in_array( $class_name, $existing_class_names, true ) ) {
				$this->add_warning( "Skipped duplicate class: {$css_class['selector']}" );
				$results['skipped_classes'][] = [
					'selector' => $css_class['selector'],
					'reason' => 'duplicate'
				];
				$results['stats']['classes_skipped']++;
				continue;
			}

			$converted = $this->convert_single_class( $css_class, $results['stats'] );

			if ( ! empty( $converted['variants']['desktop'] ) ) {
				$results['converted_classes'][] = $converted;
				$results['stats']['classes_converted']++;
				$existing_class_names[] = $class_name;
			} else {
				$results['skipped_classes'][] = [
					'selector' => $css_class['selector'],
					'reason' => 'no_supported_properties'
				];
				$results['stats']['classes_skipped']++;
			}
		}

		$results['warnings'] = $this->warnings;
		return $results;
	}

	private function convert_single_class( array $css_class, array &$stats ): array {
		$schema_properties = [];
		$css_variables = [];

		foreach ( $css_class['properties'] as $property => $value ) {
			if ( 0 === strpos( $property, '--' ) ) {
				$css_variables[] = [ 'name' => $property, 'value' => $value ];
				continue;
			}

			if ( false !== strpos( $value, 'var(' ) ) {
				$value = $this->resolve_css_variables( $value, $css_variables );
			}

			if ( in_array( $property, $this->supported_properties, true ) ) {
				$mapper = $this->property_mapper_registry->resolve( $property, $value );

				if ( $mapper ) {
					$mapped = $mapper->map_to_schema( $property, $value );
					$schema_properties = array_merge( $schema_properties, $mapped );
					$stats['properties_converted']++;
				} else {
					$this->add_warning( "Failed to map property: {$property} with value: {$value}" );
					$stats['properties_skipped']++;
				}
			} else {
				$this->add_warning( "Skipped unsupported property: {$property} in {$css_class['selector']}" );
				$stats['properties_skipped']++;
			}
		}

		if ( ! empty( $css_variables ) ) {
			$converted_variables = $this->variable_conversion_service->convert_to_editor_variables( $css_variables );
			$stats['variables_converted'] += count( $converted_variables );
		}

		return [
			'id' => $this->generate_class_id( $css_class['selector'] ),
			'type' => 'class',
			'label' => $this->generate_class_label( $css_class['selector'] ),
			'variants' => [
				'desktop' => $schema_properties
			]
		];
	}

	private function resolve_css_variables( string $value, array $css_variables ): string {
		if ( 1 === preg_match_all( '/var\(\s*(--[\w-]+)\s*\)/', $value, $matches ) ) {
			foreach ( $matches[1] as $var_name ) {
				foreach ( $css_variables as $css_var ) {
					if ( $css_var['name'] === $var_name ) {
						$value = str_replace( "var({$var_name})", $css_var['value'], $value );
						break;
					}
				}
			}
		}
		
		return $value;
	}

	private function get_existing_global_class_names(): array {
		try {
			$repository = Global_Classes_Repository::make();
			$classes = $repository->all();
			return array_keys( $classes->get_items()->all() );
		} catch ( \Exception $e ) {
			return [];
		}
	}

	private function generate_class_id( string $selector ): string {
		$class_name = $this->extract_class_name( $selector );
		return sanitize_title( $class_name );
	}

	private function generate_class_label( string $selector ): string {
		$class_name = $this->extract_class_name( $selector );
		return ucwords( str_replace( [ '-', '_' ], ' ', $class_name ) );
	}

	private function extract_class_name( string $selector ): string {
		return ltrim( trim( $selector ), '.' );
	}

	private function add_warning( string $message ): void {
		$this->warnings[] = $message;
	}

	public function get_warnings(): array {
		return $this->warnings;
	}

	public function clear_warnings(): void {
		$this->warnings = [];
	}
}
