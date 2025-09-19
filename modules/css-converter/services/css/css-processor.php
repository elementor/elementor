<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Css_Specificity_Calculator;
use Elementor\Modules\CssConverter\Services\Class\Class_Conversion_Service;
use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Parsers\Simple_Css_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

class Css_Processor {
	private $specificity_calculator;
	private $class_conversion_service;
	private $css_parser;
	private $global_classes_repository;

	public function __construct() {
		$this->specificity_calculator = new Css_Specificity_Calculator();
		$this->class_conversion_service = new Class_Conversion_Service();
		$this->css_parser = new CssParser();
		
		// Initialize Global Classes Repository if available
		if ( class_exists( 'Elementor\Modules\GlobalClasses\Global_Classes_Repository' ) ) {
			$this->global_classes_repository = new Global_Classes_Repository();
		}
	}

	public function process_css_for_widgets( $css, $widgets ) {
		$processing_result = [
			'global_classes' => [],
			'widget_styles' => [],
			'element_styles' => [],
			'stats' => [
				'rules_processed' => 0,
				'properties_converted' => 0,
				'global_classes_created' => 0,
				'unsupported_properties' => [],
				'warnings' => [],
			],
		];

		try {
			// Parse CSS into rules
			if ( $this->css_parser instanceof Simple_Css_Parser ) {
				// Simple parser returns rules directly
				$css_rules = $this->css_parser->parse( $css );
			} else {
				// Sabberworm parser returns parsed CSS object
				$parsed_css = $this->css_parser->parse( $css );
				$css_rules = $this->extract_css_rules( $parsed_css );
			}
			
			$processing_result['stats']['rules_processed'] = count( $css_rules );

			// Process each CSS rule
			foreach ( $css_rules as $rule ) {
				$this->process_css_rule( $rule, $processing_result );
			}

			// Create global classes (HVV: threshold = 1)
			$this->create_global_classes( $processing_result );

		} catch ( \Exception $e ) {
			$processing_result['stats']['warnings'][] = [
				'type' => 'css_processing_error',
				'message' => $e->getMessage(),
			];
		}

		return $processing_result;
	}

	private function extract_css_rules( $parsed_css ) {
		$rules = [];
		
		if ( ! $parsed_css || ! method_exists( $parsed_css, 'get_document' ) ) {
			return $rules;
		}

		$document = $parsed_css->get_document();
		if ( ! $document || ! method_exists( $document, 'getAllRuleSets' ) ) {
			return $rules;
		}

		foreach ( $document->getAllRuleSets() as $rule_set ) {
			$selectors = [];
			
			// Get all selectors for this rule set
			foreach ( $rule_set->getSelectors() as $selector ) {
				$selectors[] = $selector->getSelector();
			}

			// Get all declarations for this rule set
			foreach ( $rule_set->getRules() as $rule ) {
				if ( method_exists( $rule, 'getProperty' ) && method_exists( $rule, 'getValue' ) ) {
					$property = $rule->getProperty();
					$value = $rule->getValue();
					$is_important = $rule->getIsImportant();

					foreach ( $selectors as $selector ) {
						$rules[] = [
							'selector' => trim( $selector ),
							'property' => $property,
							'value' => (string) $value,
							'important' => $is_important,
						];
					}
				}
			}
		}

		return $rules;
	}

	private function process_css_rule( $rule, &$processing_result ) {
		$categorized_rule = $this->specificity_calculator->categorize_css_rule(
			$rule['selector'],
			$rule['property'],
			$rule['value'],
			$rule['important']
		);

		// Route to appropriate processing based on target type
		switch ( $categorized_rule['target'] ) {
			case 'widget_props':
				$this->process_widget_prop_rule( $categorized_rule, $processing_result );
				break;
			case 'global_classes':
				$this->process_global_class_rule( $categorized_rule, $processing_result );
				break;
			case 'element_styles':
				$this->process_element_style_rule( $categorized_rule, $processing_result );
				break;
		}
	}

	private function process_widget_prop_rule( $rule, &$processing_result ) {
		// Convert CSS property to Elementor widget property using existing converters
		try {
			$converted_property = $this->convert_css_property( 
				$rule['property'], 
				$rule['value'] 
			);

			if ( $converted_property ) {
				$processing_result['widget_styles'][] = [
					'selector' => $rule['selector'],
					'original_property' => $rule['property'],
					'original_value' => $rule['value'],
					'converted_property' => $converted_property,
					'specificity' => $rule['specificity'],
					'important' => $rule['important'],
				];
				$processing_result['stats']['properties_converted']++;
			} else {
				$processing_result['stats']['unsupported_properties'][] = [
					'property' => $rule['property'],
					'value' => $rule['value'],
					'selector' => $rule['selector'],
					'reason' => 'No converter available',
				];
			}
		} catch ( \Exception $e ) {
			$processing_result['stats']['unsupported_properties'][] = [
				'property' => $rule['property'],
				'value' => $rule['value'],
				'selector' => $rule['selector'],
				'reason' => $e->getMessage(),
			];
		}
	}

	private function process_global_class_rule( $rule, &$processing_result ) {
		// Extract class name from selector
		$class_names = $this->extract_class_names( $rule['selector'] );
		
		foreach ( $class_names as $class_name ) {
			// HVV Decision: threshold = 1, create global class for every CSS class
			if ( ! isset( $processing_result['global_classes'][ $class_name ] ) ) {
				$processing_result['global_classes'][ $class_name ] = [
					'class_name' => $class_name,
					'properties' => [],
					'selectors' => [],
				];
			}

			// Convert CSS property using existing class conversion service
			try {
				$converted_property = $this->convert_css_property( 
					$rule['property'], 
					$rule['value'] 
				);

				if ( $converted_property ) {
					$processing_result['global_classes'][ $class_name ]['properties'][] = [
						'original_property' => $rule['property'],
						'original_value' => $rule['value'],
						'converted_property' => $converted_property,
						'important' => $rule['important'],
					];
					$processing_result['stats']['properties_converted']++;
				}
			} catch ( \Exception $e ) {
				$processing_result['stats']['unsupported_properties'][] = [
					'property' => $rule['property'],
					'value' => $rule['value'],
					'class' => $class_name,
					'reason' => $e->getMessage(),
				];
			}

			$processing_result['global_classes'][ $class_name ]['selectors'][] = $rule['selector'];
		}
	}

	private function process_element_style_rule( $rule, &$processing_result ) {
		// Store element styles for potential application to widgets
		$processing_result['element_styles'][] = [
			'selector' => $rule['selector'],
			'property' => $rule['property'],
			'value' => $rule['value'],
			'specificity' => $rule['specificity'],
			'important' => $rule['important'],
		];
	}

	private function convert_css_property( $property, $value ) {
		// HVV Decision: "Exactly the same as Class import. This should be a shared functionality."
		// Use existing class conversion service
		
		try {
			$css_declaration = $property . ': ' . $value . ';';
			$conversion_result = $this->class_conversion_service->convert_css_to_classes( 
				'.' . 'temp-class { ' . $css_declaration . ' }', 
				false // Don't store, just convert
			);

			if ( ! empty( $conversion_result['classes'] ) ) {
				$temp_class = reset( $conversion_result['classes'] );
				if ( ! empty( $temp_class['properties'] ) ) {
					return reset( $temp_class['properties'] );
				}
			}
		} catch ( \Exception $e ) {
			// Return null to indicate conversion failed
			return null;
		}

		return null;
	}

	private function extract_class_names( $selector ) {
		$class_names = [];
		
		// Extract class names from selector (e.g., ".btn.primary" -> ["btn", "primary"])
		preg_match_all( '/\.([a-zA-Z][\w-]*)/', $selector, $matches );
		
		if ( ! empty( $matches[1] ) ) {
			$class_names = $matches[1];
		}

		return $class_names;
	}

	private function create_global_classes( &$processing_result ) {
		if ( ! $this->global_classes_repository ) {
			$processing_result['stats']['warnings'][] = [
				'type' => 'global_classes_unavailable',
				'message' => 'Global Classes Repository not available',
			];
			return;
		}

		foreach ( $processing_result['global_classes'] as $class_name => $class_data ) {
			try {
				// Prepare global class data in the format expected by Global Classes Repository
				$global_class_data = [
					'id' => sanitize_title( $class_name ),
					'label' => $class_name,
					'type' => 'class',
					'variants' => [
						[
							'meta' => $this->convert_properties_to_meta( $class_data['properties'] ),
						],
					],
				];

				// Create or update global class
				$result = $this->global_classes_repository->create( $global_class_data );
				
				if ( $result ) {
					$processing_result['stats']['global_classes_created']++;
				}

			} catch ( \Exception $e ) {
				$processing_result['stats']['warnings'][] = [
					'type' => 'global_class_creation_failed',
					'class_name' => $class_name,
					'message' => $e->getMessage(),
				];
			}
		}
	}

	private function convert_properties_to_meta( $properties ) {
		$meta = [];
		
		foreach ( $properties as $property_data ) {
			if ( ! empty( $property_data['converted_property'] ) ) {
				$converted = $property_data['converted_property'];
				
				// Merge converted properties into meta
				if ( is_array( $converted ) ) {
					$meta = array_merge( $meta, $converted );
				}
			}
		}

		return $meta;
	}

	public function apply_styles_to_widget( $widget, $processing_result ) {
		$widget_styles = [];
		$applied_classes = [];

		// Apply widget-specific styles (high specificity)
		foreach ( $processing_result['widget_styles'] as $style ) {
			if ( $this->style_applies_to_widget( $style, $widget ) ) {
				$widget_styles[] = $style;
			}
		}

		// Apply global classes (class selectors)
		if ( ! empty( $widget['attributes']['class'] ) ) {
			$widget_classes = explode( ' ', $widget['attributes']['class'] );
			
			foreach ( $widget_classes as $class_name ) {
				$class_name = trim( $class_name );
				if ( ! empty( $class_name ) && isset( $processing_result['global_classes'][ $class_name ] ) ) {
					$applied_classes[] = $class_name;
				}
			}
		}

		// Apply element styles (lowest specificity)
		$element_styles = [];
		foreach ( $processing_result['element_styles'] as $style ) {
			if ( $this->style_applies_to_widget( $style, $widget ) ) {
				$element_styles[] = $style;
			}
		}

		return [
			'widget_styles' => $widget_styles,
			'global_classes' => $applied_classes,
			'element_styles' => $element_styles,
			'computed_styles' => $this->compute_final_styles( $widget_styles, $element_styles, $widget ),
		];
	}

	private function style_applies_to_widget( $style, $widget ) {
		$selector = $style['selector'];
		
		// Check if selector matches widget's ID
		if ( ! empty( $widget['attributes']['id'] ) ) {
			$widget_id = $widget['attributes']['id'];
			if ( strpos( $selector, '#' . $widget_id ) !== false ) {
				return true;
			}
		}

		// Check if selector matches widget's classes
		if ( ! empty( $widget['attributes']['class'] ) ) {
			$widget_classes = explode( ' ', $widget['attributes']['class'] );
			foreach ( $widget_classes as $class_name ) {
				$class_name = trim( $class_name );
				if ( ! empty( $class_name ) && strpos( $selector, '.' . $class_name ) !== false ) {
					return true;
				}
			}
		}

		// Check if selector matches widget's tag
		if ( strpos( $selector, $widget['original_tag'] ) !== false ) {
			return true;
		}

		return false;
	}

	private function compute_final_styles( $widget_styles, $element_styles, $widget ) {
		$all_styles = array_merge( $element_styles, $widget_styles );
		
		// Add inline styles (highest specificity after !important)
		if ( ! empty( $widget['inline_css'] ) ) {
			foreach ( $widget['inline_css'] as $property => $style_data ) {
				$all_styles[] = [
					'property' => $property,
					'value' => $style_data['value'],
					'specificity' => $style_data['important'] ? 
						Css_Specificity_Calculator::IMPORTANT_WEIGHT + Css_Specificity_Calculator::INLINE_WEIGHT :
						Css_Specificity_Calculator::INLINE_WEIGHT,
					'important' => $style_data['important'],
					'source' => 'inline',
				];
			}
		}

		// Group by property and find winning style for each
		$grouped_styles = [];
		foreach ( $all_styles as $index => $style ) {
			$property = $style['original_property'] ?? $style['property'];
			if ( ! isset( $grouped_styles[ $property ] ) ) {
				$grouped_styles[ $property ] = [];
			}
			$style['order'] = $index; // For cascade order
			$grouped_styles[ $property ][] = $style;
		}

		// Compute final value for each property
		$computed_styles = [];
		foreach ( $grouped_styles as $property => $styles ) {
			$winning_style = $this->specificity_calculator->get_winning_style( $styles );
			if ( $winning_style ) {
				$computed_styles[ $property ] = $winning_style;
			}
		}

		return $computed_styles;
	}

	public function fetch_css_from_urls( $css_urls, $follow_imports = false ) {
		$all_css = '';
		$fetched_urls = [];
		$errors = [];

		foreach ( $css_urls as $url ) {
			try {
				$css_content = $this->fetch_single_css_url( $url );
				if ( $css_content ) {
					$all_css .= "/* CSS from: {$url} */\n" . $css_content . "\n\n";
					$fetched_urls[] = $url;

					// Follow @import statements if requested
					if ( $follow_imports ) {
						$import_urls = $this->extract_import_urls( $css_content, $url );
						foreach ( $import_urls as $import_url ) {
							if ( ! in_array( $import_url, $fetched_urls, true ) ) {
								$import_css = $this->fetch_single_css_url( $import_url );
								if ( $import_css ) {
									$all_css .= "/* CSS from import: {$import_url} */\n" . $import_css . "\n\n";
									$fetched_urls[] = $import_url;
								}
							}
						}
					}
				}
			} catch ( \Exception $e ) {
				$errors[] = [
					'url' => $url,
					'error' => $e->getMessage(),
				];
			}
		}

		return [
			'css' => $all_css,
			'fetched_urls' => $fetched_urls,
			'errors' => $errors,
		];
	}

	private function fetch_single_css_url( $url ) {
		$timeout = apply_filters( 'elementor_widget_converter_timeout', 30 );
		
		$response = wp_remote_get( $url, [
			'timeout' => $timeout,
			'headers' => [
				'Accept' => 'text/css,*/*;q=0.1',
				'User-Agent' => 'Elementor Widget Converter/1.0',
			],
		] );

		if ( is_wp_error( $response ) ) {
			throw new \Exception( 'Failed to fetch CSS: ' . $response->get_error_message() );
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( $status_code !== 200 ) {
			throw new \Exception( 'HTTP error: ' . $status_code );
		}

		return wp_remote_retrieve_body( $response );
	}

	private function extract_import_urls( $css_content, $base_url ) {
		$import_urls = [];
		
		preg_match_all( '/@import\s+(?:url\()?["\']?([^"\'()]+)["\']?\)?/i', $css_content, $matches );
		
		if ( ! empty( $matches[1] ) ) {
			foreach ( $matches[1] as $import_url ) {
				// Convert relative URLs to absolute
				if ( ! preg_match( '/^https?:\/\//', $import_url ) ) {
					$import_url = $this->resolve_relative_url( $import_url, $base_url );
				}
				$import_urls[] = $import_url;
			}
		}

		return $import_urls;
	}

	private function resolve_relative_url( $relative_url, $base_url ) {
		$base_parts = parse_url( $base_url );
		
		if ( strpos( $relative_url, '/' ) === 0 ) {
			// Absolute path
			return $base_parts['scheme'] . '://' . $base_parts['host'] . $relative_url;
		} else {
			// Relative path
			$base_path = dirname( $base_parts['path'] );
			return $base_parts['scheme'] . '://' . $base_parts['host'] . $base_path . '/' . $relative_url;
		}
	}
}
