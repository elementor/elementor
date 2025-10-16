<?php
namespace Elementor\Modules\CssConverter\Services\GlobalClasses;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Services\Variables\Variable_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Registry;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Css_Property_Convertor_Config;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

class Class_Conversion_Service {
	private $css_parser;
	private $variable_conversion_service;
	private $property_conversion_service;
	private $config;
	private $warnings = [];
	private $duplicate_detector;

	public function __construct( $css_parser = null, $variable_conversion_service = null, $property_conversion_service = null, $config = null, $duplicate_detector = null ) {
		$this->css_parser = $css_parser ? $css_parser : new CssParser();
		$this->variable_conversion_service = $variable_conversion_service ? $variable_conversion_service : new Variable_Conversion_Service();
		$this->property_conversion_service = $property_conversion_service ? $property_conversion_service : new Css_Property_Conversion_Service();
		$this->config = $config ? $config : Css_Property_Convertor_Config::get_instance();
		$this->duplicate_detector = $duplicate_detector ? $duplicate_detector : new Duplicate_Detection_Service();
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
			'reused_classes' => [],
			'skipped_classes' => [],
			'css_variables' => [],
			'warnings' => [],
			'stats' => [
				'total_classes_found' => count( $classes ),
				'classes_converted' => 0,
				'classes_reused' => 0,
				'classes_skipped' => 0,
				'properties_converted' => 0,
				'properties_skipped' => 0,
				'variables_converted' => 0,
			],
		];

		$existing_classes_cache = $this->get_existing_classes_for_cache();

		foreach ( $classes as $css_class ) {
			$converted = $this->convert_single_class( $css_class, $results['stats'] );

			if ( empty( $converted['variants'][0]['props'] ) ) {
				$results['skipped_classes'][] = [
					'selector' => $css_class['selector'],
					'reason' => 'no_supported_properties',
				];
				++$results['stats']['classes_skipped'];
				continue;
			}

			$detection_result = $this->duplicate_detector->find_or_create_class(
				$converted,
				$existing_classes_cache
			);

			if ( 'reused' === $detection_result['action'] ) {
				$results['reused_classes'][] = [
					'original_selector' => $css_class['selector'],
					'matched_class_id' => $detection_result['class_id'],
					'matched_class_label' => $detection_result['class_label'],
				];
				++$results['stats']['classes_reused'];
			} else {
				$results['converted_classes'][] = $detection_result['class_data'];
				++$results['stats']['classes_converted'];

				$existing_classes_cache[ $detection_result['class_data']['id'] ] = $detection_result['class_data'];
			}
		}

		$results['warnings'] = $this->warnings;
		$results['performance'] = $this->duplicate_detector->get_performance_stats();

		return $results;
	}

	private function get_existing_classes_for_cache(): array {
		try {
			$repository = Global_Classes_Repository::make();
			$classes = $repository->all();
			return $classes->get_items()->all();
		} catch ( \Exception $e ) {
			$this->add_warning( 'Failed to fetch existing classes for duplicate detection: ' . $e->getMessage() );
			return [];
		}
	}

	private function convert_single_class( array $css_class, array &$stats ): array {
		$schema_properties = [];
		$css_variables = [];

		foreach ( $css_class['properties'] as $property => $value ) {
			if ( 0 === strpos( $property, '--' ) ) {
				$css_variables[] = [
					'name' => $property,
					'value' => $value,
				];
				continue;
			}

			if ( false !== strpos( $value, 'var(' ) ) {
				$value = $this->resolve_css_variables( $value, $css_variables );
			}

			if ( $this->property_conversion_service->supports_v4_conversion( $property, $value ) ) {
				$mapped = $this->property_conversion_service->convert_property_to_v4_atomic( $property, $value );

				if ( $mapped ) {
					$schema_properties = array_merge( $schema_properties, [ $property => $mapped ] );
					++$stats['properties_converted'];
				} else {
					$this->add_warning( "Failed to map property: {$property} with value: {$value}" );
					++$stats['properties_skipped'];
				}
			} else {
				$this->add_warning( "Skipped unsupported property: {$property} in {$css_class['selector']}" );
				++$stats['properties_skipped'];
			}
		}

		if ( ! empty( $css_variables ) ) {
			$converted_variables = $this->variable_conversion_service->convert_to_editor_variables( $css_variables );
			$stats['variables_converted'] += count( $converted_variables );
		}

		return [
			'id' => $this->generate_class_id(),
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


	private function generate_class_id(): string {
		do {
			$hash = substr( dechex( wp_rand() ), 0, 7 );
			$id = 'g-' . $hash;
		} while ( $this->class_id_exists( $id ) );

		return $id;
	}

	private function class_id_exists( string $id ): bool {
		try {
			$repository = Global_Classes_Repository::make();
			$classes = $repository->all();
			$existing_ids = array_keys( $classes->get_items()->all() );
			return in_array( $id, $existing_ids, true );
		} catch ( \Exception $e ) {
			return false;
		}
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
