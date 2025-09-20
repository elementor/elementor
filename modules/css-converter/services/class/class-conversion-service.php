<?php
namespace Elementor\Modules\CssConverter\Services\Class;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Services\Variable\Variable_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Convertors\Classes\Class_Property_Mapper_Registry;
use Elementor\Modules\CssConverter\Convertors\Classes\Class_Property_Mapper_Factory;
use Elementor\Modules\CssConverter\Config\Class_Converter_Config;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

class Class_Conversion_Service {
	private $css_parser;
	private $variable_conversion_service;
	private $property_conversion_service;
	private $config;
	private $warnings = [];

	public function __construct( $css_parser = null, $variable_conversion_service = null, $property_conversion_service = null, $config = null ) {
		$this->css_parser = $css_parser ?: new CssParser();
		$this->variable_conversion_service = $variable_conversion_service ?: new Variable_Conversion_Service();
		$this->property_conversion_service = $property_conversion_service ?: new Css_Property_Conversion_Service();
		$this->config = $config ?: Class_Converter_Config::get_instance();
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
		$existing_labels = $this->get_existing_global_class_labels();
		$seen_labels = [];

		foreach ( $classes as $css_class ) {
			$class_name = $this->extract_class_name( $css_class['selector'] );
			$label = $this->generate_class_label( $css_class['selector'] );

			if ( in_array( $label, $existing_labels, true ) || in_array( $label, $seen_labels, true ) ) {
				$this->add_warning( "Skipped duplicate class: {$css_class['selector']}" );
				$results['skipped_classes'][] = [
					'selector' => $css_class['selector'],
					'reason' => 'duplicate'
				];
				$results['stats']['classes_skipped']++;
				continue;
			}

			$converted = $this->convert_single_class( $css_class, $results['stats'] );

			if ( ! empty( $converted['variants'][0]['props'] ) ) {
				$results['converted_classes'][] = $converted;
				$results['stats']['classes_converted']++;
				$existing_class_names[] = $class_name;
				$seen_labels[] = $label;
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

			if ( $this->property_conversion_service->is_property_supported( $property, $value ) ) {
				$mapped = $this->property_conversion_service->convert_property_to_schema( $property, $value );

				if ( $mapped ) {
					$schema_properties = array_merge( $schema_properties, [ $property => $mapped ] );
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
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $schema_properties,
					'custom_css' => null,
				],
			],
		];
	}

	private function resolve_css_variables( string $value, array $css_variables ): string {
		if ( 1 === preg_match_all( '/var\(\s*(--[\w-]+)\s*\)/', $value, $matches ) ) {
			// Create a lookup map for better performance
			$variable_map = [];
			foreach ( $css_variables as $css_var ) {
				$variable_map[ $css_var['name'] ] = $css_var['value'];
			}

			foreach ( $matches[1] as $var_name ) {
				if ( isset( $variable_map[ $var_name ] ) ) {
					$value = str_replace( "var({$var_name})", $variable_map[ $var_name ], $value );
				}
			}
		}
		
		return $value;
	}

	private function get_existing_global_class_names(): array {
		static $cached_names = null;
		
		if ( null === $cached_names ) {
			try {
				$repository = Global_Classes_Repository::make();
				$classes = $repository->all();
				$cached_names = array_keys( $classes->get_items()->all() );
			} catch ( \Exception $e ) {
				$cached_names = [];
			}
		}
		
		return $cached_names;
	}

	private function get_existing_global_class_labels(): array {
		static $cached_labels = null;
		if ( null === $cached_labels ) {
			$cached_labels = [];
			try {
				$repository = Global_Classes_Repository::make();
				$classes = $repository->all();
				$items = $classes->get_items()->all();
				foreach ( $items as $item ) {
					if ( isset( $item['label'] ) && is_string( $item['label'] ) ) {
						$cached_labels[] = $item['label'];
					}
				}
			} catch ( \Exception $e ) {
				$cached_labels = [];
			}
		}
		return $cached_labels;
	}

	private function generate_class_id( string $selector ): string {
		$class_name = $this->extract_class_name( $selector );
		$existing_ids = $this->get_existing_global_class_names();
		
		// Generate ID with g- prefix and hash like Elementor's native system
		do {
			$hash = substr( dechex( mt_rand() ), 0, 7 );
			$id = 'g-' . $hash;
		} while ( in_array( $id, $existing_ids, true ) );
		
		return $id;
	}

	private function generate_class_label( string $selector ): string {
		$class_name = $this->extract_class_name( $selector );
		$normalized = strtolower( trim( $class_name ) );
		$normalized = str_replace( '_', '-', $normalized );
		$normalized = preg_replace( '/[^a-z0-9\-]+/', '-', $normalized );
		$normalized = preg_replace( '/-+/', '-', $normalized );
		$normalized = trim( $normalized, '-' );
		if ( '' === $normalized ) {
			$normalized = 'class';
		}
		if ( preg_match( '/^[0-9]/', $normalized ) ) {
			$normalized = 'c-' . $normalized;
		}
		return $normalized;
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
