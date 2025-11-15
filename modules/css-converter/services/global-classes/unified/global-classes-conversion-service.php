<?php

namespace Elementor\Modules\CssConverter\Services\GlobalClasses\Unified;

use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Conversion_Service {

	private Css_Property_Conversion_Service $property_conversion_service;
	private Custom_Css_Collector $custom_css_collector;

	public function __construct( Css_Property_Conversion_Service $property_conversion_service = null, Custom_Css_Collector $custom_css_collector = null ) {
		$this->custom_css_collector = $custom_css_collector ?: new Custom_Css_Collector();
		$this->property_conversion_service = $property_conversion_service ?: new Css_Property_Conversion_Service( $this->custom_css_collector );
	}

	public function convert_to_atomic_props( array $detected_classes, array $css_variable_definitions = [] ): array {
		$converted_classes = [];

		foreach ( $detected_classes as $class_name => $class_data ) {
			
			$result = $this->convert_properties_to_atomic_with_fallback(
				$class_data['properties'],
				$class_name,
				$css_variable_definitions
			);

			$atomic_props = $result['atomic_props'];
			$custom_css = $result['custom_css'];

			// Include class even if only custom CSS (no atomic props)
			if ( ! empty( $atomic_props ) || ! empty( $custom_css ) ) {
				$converted_classes[ $class_name ] = [
					'atomic_props' => $atomic_props,
					'custom_css' => $custom_css,
					'source' => $class_data['source'],
					'original_selector' => $class_data['selector'],
				];
			}
		}

		return $converted_classes;
	}

	private function convert_properties_to_atomic_with_fallback( array $properties, string $class_name, array $css_variable_definitions = [] ): array {
		$atomic_props = [];
		
		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';
			$important = $property_data['important'] ?? false;

			if ( empty( $property ) || empty( $value ) ) {
				continue;
			}

			$has_var_reference = strpos( $value, 'var(' ) !== false;
			
			if ( 'brxw-intro-02' === $class_name && in_array( $property, [ 'display', 'grid-gap', 'grid-template-columns', 'align-items' ], true ) ) {
				error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 property: ' . $property . ' = ' . $value . ' (has_var: ' . ( $has_var_reference ? 'YES' : 'NO' ) . ')' );
			}
			
			if ( $has_var_reference ) {
				$variable_info = $this->get_variable_id_from_var_reference( $value );
				
				if ( $variable_info ) {
					if ( 'brxw-intro-02' === $class_name ) {
						error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 variable_info found: ' . print_r( $variable_info, true ) );
					}
					
					$resolved_value = $this->resolve_css_variable_for_custom_css( $value, $css_variable_definitions );
					$this->custom_css_collector->add_property( $class_name, $property, $resolved_value, $important );
					if ( 'brxw-intro-02' === $class_name && in_array( $property, [ 'grid-gap', 'grid-template-columns' ], true ) ) {
						error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 ALSO adding (early path) ' . $property . ' to custom CSS (resolved): ' . $resolved_value );
					}
					
					$target_property_name = $this->get_target_property_name( $property );
					$variable_type = $variable_info['type'];
					
					if ( 'background-color' === $property ) {
						$atomic_props[ $target_property_name ] = [
							'$$type' => 'background',
							'value' => [
								'color' => [
									'$$type' => $variable_type,
									'value' => $variable_info['id'],
								],
							],
						];
					} else {
						$atomic_props[ $target_property_name ] = [
							'$$type' => $variable_type,
							'value' => $variable_info['id'],
						];
					}
					
					if ( 'brxw-intro-02' === $class_name ) {
						error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 added to atomic_props: ' . $target_property_name );
					}
					
					continue;
				}
				
				if ( 'brxw-intro-02' === $class_name ) {
					error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 variable_info NOT found, checking should_resolve' );
				}
				
				if ( ! empty( $css_variable_definitions ) && $this->should_resolve_variable( $value ) ) {
					$resolved_value = $this->resolve_css_variable( $value, $css_variable_definitions );
					if ( 'brxw-intro-02' === $class_name ) {
						error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 resolved: ' . $value . ' -> ' . $resolved_value );
					}
					$value = $resolved_value;
				} else {
					if ( 'brxw-intro-02' === $class_name ) {
						error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 NOT resolving variable (should_resolve: ' . ( $this->should_resolve_variable( $value ) ? 'YES' : 'NO' ) . ', has_definitions: ' . ( ! empty( $css_variable_definitions ) ? 'YES' : 'NO' ) . ')' );
					}
				}
			}
			
			$converted = $this->property_conversion_service->convert_property_to_v4_atomic(
				$property,
				$value,
				$class_name,
				$important
			);

			if ( 'brxw-intro-02' === $class_name && in_array( $property, [ 'display', 'grid-gap', 'grid-template-columns', 'align-items' ], true ) ) {
				error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 conversion result: ' . ( $converted && isset( $converted['$$type'] ) ? 'SUCCESS' : 'FAILED' ) );
				if ( $converted ) {
					error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 converted: ' . print_r( $converted, true ) );
				} else {
					error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 conversion FAILED for: ' . $property . ' = ' . $value );
					$has_custom = $this->custom_css_collector->has_custom_css( $class_name );
					error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 has_custom_css after failed conversion: ' . ( $has_custom ? 'YES' : 'NO' ) );
				}
			}

			if ( $converted && isset( $converted['$$type'] ) ) {
				if ( $has_var_reference ) {
					$resolved_value = $this->resolve_css_variable_for_custom_css( $value, $css_variable_definitions );
					$this->custom_css_collector->add_property( $class_name, $property, $resolved_value, $important );
					if ( 'brxw-intro-02' === $class_name && in_array( $property, [ 'grid-gap', 'grid-template-columns' ], true ) ) {
						error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 ALSO adding ' . $property . ' to custom CSS (resolved): ' . $resolved_value );
					}
				}
				$target_property_name = $this->get_target_property_name( $property );
				$atomic_props[ $target_property_name ] = $converted;
			} elseif ( ! $converted && $has_var_reference ) {
				$resolved_value = $this->resolve_css_variable_for_custom_css( $value, $css_variable_definitions );
				if ( 'brxw-intro-02' === $class_name && 'grid-template-columns' === $property ) {
					error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 resolving variable: ' . $value . ' -> ' . $resolved_value );
				}
				
				if ( $this->custom_css_collector->has_custom_css( $class_name ) ) {
					$existing_css = $this->custom_css_collector->get_custom_css_for_widget( $class_name );
					if ( strpos( $existing_css, $property ) !== false ) {
						if ( 'brxw-intro-02' === $class_name && 'grid-template-columns' === $property ) {
							error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 grid-template-columns already in custom CSS, replacing with resolved value' );
						}
						$this->custom_css_collector->add_property( $class_name, $property, $resolved_value, $important );
					} else {
						$this->custom_css_collector->add_property( $class_name, $property, $resolved_value, $important );
						if ( 'brxw-intro-02' === $class_name && 'grid-template-columns' === $property ) {
							error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 explicitly added grid-template-columns to custom CSS with resolved value' );
						}
					}
				} else {
					$this->custom_css_collector->add_property( $class_name, $property, $resolved_value, $important );
					if ( 'brxw-intro-02' === $class_name && 'grid-template-columns' === $property ) {
						error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 explicitly added grid-template-columns to custom CSS with resolved value' );
					}
				}
			}
		}

		if ( 'brxw-intro-02' === $class_name ) {
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 BEFORE retrieving custom CSS from collector' );
			$has_custom_check = $this->custom_css_collector->has_custom_css( $class_name );
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 has_custom_css: ' . ( $has_custom_check ? 'YES' : 'NO' ) );
		}

		$has_custom = $this->custom_css_collector->has_custom_css( $class_name );
		
		$custom_css = $has_custom 
			? $this->custom_css_collector->get_custom_css_for_widget( $class_name )
			: '';

		if ( 'brxw-intro-02' === $class_name ) {
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 final result:' );
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 atomic_props count: ' . count( $atomic_props ) );
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 atomic_props keys: ' . implode( ', ', array_keys( $atomic_props ) ) );
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 custom_css length: ' . strlen( $custom_css ) );
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 custom_css: ' . ( $custom_css ? $custom_css : 'EMPTY' ) );
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 has grid-template-columns: ' . ( strpos( $custom_css, 'grid-template-columns' ) !== false ? 'YES' : 'NO' ) );
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 has grid-gap: ' . ( strpos( $custom_css, 'grid-gap' ) !== false ? 'YES' : 'NO' ) );
			error_log( 'CSS_CONVERTER_DEBUG: Conversion Service - brxw-intro-02 has align-items: ' . ( strpos( $custom_css, 'align-items' ) !== false ? 'YES' : 'NO' ) );
		}

		return [
			'atomic_props' => $atomic_props,
			'custom_css' => $custom_css,
		];
	}

	private function convert_properties_to_atomic( array $properties ): array {
		$atomic_props = [];

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';

			if ( empty( $property ) || empty( $value ) ) {
				continue;
			}

			$converted = $this->property_conversion_service->convert_property_to_v4_atomic(
				$property,
				$value
			);

			// DEBUG: Log conversion attempts
			if ( $converted && isset( $converted['$$type'] ) ) {
				$atomic_props[ $property ] = $converted;
			} else {
			}
		}

		return $atomic_props;
	}

	private function resolve_css_variable( string $value, array $variable_definitions ): string {
		return preg_replace_callback(
			'/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
			function ( $matches ) use ( $variable_definitions ) {
				$var_name = trim( $matches[1] );
				$fallback = isset( $matches[2] ) ? trim( $matches[2] ) : '';
				$original_var = $matches[0];

				$resolved_value = $this->get_variable_value( $var_name, $variable_definitions );

				if ( $resolved_value !== null ) {
					return $resolved_value;
				}

				if ( ! empty( $fallback ) ) {
					return $fallback;
				}

				return $original_var;
			},
			$value
		);
	}

	private function get_variable_value( string $var_name, array $variable_definitions ): ?string {
		$clean_name = $this->clean_variable_name( $var_name );

		if ( isset( $variable_definitions[ $clean_name ] ) ) {
			$var_value = $variable_definitions[ $clean_name ]['value'] ?? '';

			if ( ! empty( $var_value ) ) {
				return $var_value;
			}
		}

		return null;
	}

	private function resolve_css_variable_for_custom_css( string $value, array $variable_definitions, int $recursion_depth = 0 ): string {
		if ( empty( $variable_definitions ) || $recursion_depth > 5 ) {
			return $value;
		}

		$resolved = preg_replace_callback(
			'/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
			function ( $matches ) use ( $variable_definitions ) {
				$var_name = trim( $matches[1] );
				$fallback = isset( $matches[2] ) ? trim( $matches[2] ) : '';
				$original_var = $matches[0];

				$resolved_value = $this->get_variable_value( $var_name, $variable_definitions );

				if ( $resolved_value !== null ) {
					return $resolved_value;
				}

				if ( ! empty( $fallback ) ) {
					return $fallback;
				}

				return $original_var;
			},
			$value
		);

		if ( $resolved !== $value && strpos( $resolved, 'var(' ) !== false ) {
			return $this->resolve_css_variable_for_custom_css( $resolved, $variable_definitions, $recursion_depth + 1 );
		}

		return $resolved;
	}

	private function should_resolve_variable( string $value ): bool {
		if ( preg_match( '/var\s*\(\s*(--[a-zA-Z0-9_-]+)/', $value, $matches ) ) {
			$var_name = $matches[1];
			return $this->is_elementor_global_variable( $var_name );
		}
		return false;
	}

	private function is_elementor_global_variable( string $var_name ): bool {
		$global_prefixes = [
			'--e-global-color-',
			'--e-global-typography-',
			'--e-global-size-',
		];

		foreach ( $global_prefixes as $prefix ) {
			if ( strpos( $var_name, $prefix ) === 0 ) {
				return true;
			}
		}

		return false;
	}

	private function clean_variable_name( string $variable_name ): string {
		$clean = trim( $variable_name );
		if ( 0 === strpos( $clean, '--' ) ) {
			$clean = substr( $clean, 2 );
		}
		return $clean;
	}

	private function get_target_property_name( string $css_property ): string {
		$factory = \Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory::get_registry();
		$mapper = $factory->resolve( $css_property, '' );
		
		if ( $mapper && method_exists( $mapper, 'get_target_property_name' ) ) {
			return $mapper->get_target_property_name( $css_property );
		}
		
		return $css_property;
	}

	public function get_conversion_stats( array $detected_classes ): array {
		$total_classes = count( $detected_classes );
		$converted_classes = 0;
		$skipped_classes = 0;
		$total_properties = 0;
		$converted_properties = 0;
		$skipped_properties = 0;

		foreach ( $detected_classes as $class_name => $class_data ) {
			$properties = $class_data['properties'] ?? [];
			$total_properties += count( $properties );

			$atomic_props = $this->convert_properties_to_atomic( $properties );

			if ( empty( $atomic_props ) ) {
				++$skipped_classes;
				$skipped_properties += count( $properties );
			} else {
				++$converted_classes;
				$converted_properties += count( $atomic_props );
				$skipped_properties += count( $properties ) - count( $atomic_props );
			}
		}

		return [
			'total_classes' => $total_classes,
			'converted_classes' => $converted_classes,
			'skipped_classes' => $skipped_classes,
			'total_properties' => $total_properties,
			'converted_properties' => $converted_properties,
			'skipped_properties' => $skipped_properties,
			'conversion_rate' => $total_properties > 0 ? round( ( $converted_properties / $total_properties ) * 100, 2 ) : 0,
		];
	}

	public function validate_atomic_props( array $atomic_props ): array {
		$validation_result = [
			'valid' => true,
			'errors' => [],
		];

		foreach ( $atomic_props as $property => $atomic_prop ) {
			if ( ! is_array( $atomic_prop ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Property '{$property}' is not an array";
				continue;
			}

			if ( ! isset( $atomic_prop['$$type'] ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Property '{$property}' missing $$type";
				continue;
			}

			if ( ! isset( $atomic_prop['value'] ) ) {
				$validation_result['valid'] = false;
				$validation_result['errors'][] = "Property '{$property}' missing value";
				continue;
			}
		}

		return $validation_result;
	}

	private function get_variables_repository() {
		if ( ! defined( 'ELEMENTOR_VERSION' ) || ! class_exists( '\Elementor\Modules\Variables\Storage\Repository' ) ) {
			return null;
		}

		try {
			$kit = \Elementor\Plugin::$instance->kits_manager->get_active_kit();
			if ( ! $kit ) {
				return null;
			}
			return new \Elementor\Modules\Variables\Storage\Repository( $kit );
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function get_variable_id_from_var_reference( string $value ): ?array {
		$repository = $this->get_variables_repository();
		if ( ! $repository ) {
			return null;
		}

		if ( ! preg_match( '/var\s*\(\s*(--[a-zA-Z0-9_-]+)/', $value, $matches ) ) {
			return null;
		}

		$var_name = $matches[1];
		$clean_label = $this->clean_variable_name( $var_name );

		try {
			$variables = $repository->variables();
			foreach ( $variables as $id => $variable ) {
				if ( isset( $variable['deleted'] ) && $variable['deleted'] ) {
					continue;
				}
				$variable_label = $variable['label'] ?? '';
				if ( strtolower( $variable_label ) === strtolower( $clean_label ) ) {
					return [
						'id' => $id,
						'type' => $variable['type'] ?? 'color',
					];
				}
			}
		} catch ( \Exception $e ) {
			return null;
		}

		return null;
	}
}
