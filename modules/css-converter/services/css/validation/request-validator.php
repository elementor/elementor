<?php
namespace Elementor\Modules\CssConverter\Services\Css\Validation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WP_REST_Request;
use WP_REST_Response;

class Request_Validator {
	private $validation_rules;
	private $security_config;

	public function __construct() {
		$this->validation_rules = $this->get_validation_rules();
		$this->security_config = $this->get_security_config();
	}

	public function validate_widget_conversion_request( WP_REST_Request $request ) {
		$errors = [];
		
		// Validate required parameters
		$required_validation = $this->validate_required_parameters( $request );
		if ( $required_validation ) {
			return $required_validation;
		}
		
		// Validate parameter types and formats
		$type_validation = $this->validate_parameter_types( $request );
		if ( $type_validation ) {
			return $type_validation;
		}
		
		// Validate content size limits
		$size_validation = $this->validate_content_size( $request );
		if ( $size_validation ) {
			return $size_validation;
		}
		
		// Validate security constraints
		$security_validation = $this->validate_security_constraints( $request );
		if ( $security_validation ) {
			return $security_validation;
		}
		
		// Validate URL constraints
		$url_validation = $this->validate_url_constraints( $request );
		if ( $url_validation ) {
			return $url_validation;
		}
		
		// Validate nesting depth limits
		$depth_validation = $this->validate_nesting_depth( $request );
		if ( $depth_validation ) {
			return $depth_validation;
		}
		
		// Validate options object
		$options_validation = $this->validate_options( $request );
		if ( $options_validation ) {
			return $options_validation;
		}
		
		return null; // No validation errors
	}

	private function validate_required_parameters( WP_REST_Request $request ) {
		$required_params = [ 'type', 'content' ];
		
		foreach ( $required_params as $param ) {
			$value = $request->get_param( $param );
			if ( empty( $value ) && '0' !== $value ) {
				return new WP_REST_Response( [
					'error' => 'missing_required_parameter',
					'message' => "Required parameter '{$param}' is missing or empty",
					'parameter' => $param,
				], 400 );
			}
		}
		
		return null;
	}

	private function validate_parameter_types( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );
		$content = $request->get_param( 'content' );
		$css_urls = $request->get_param( 'cssUrls' );
		$follow_imports = $request->get_param( 'followImports' );
		
		// Validate type enum
		if ( ! in_array( $type, [ 'url', 'html', 'css' ], true ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_parameter_value',
				'message' => "Parameter 'type' must be one of: url, html, css",
				'parameter' => 'type',
				'value' => $type,
			], 400 );
		}
		
		// Validate content is string
		if ( ! is_string( $content ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_parameter_type',
				'message' => "Parameter 'content' must be a string",
				'parameter' => 'content',
			], 400 );
		}
		
		// Validate cssUrls is array if provided
		if ( null !== $css_urls && ! is_array( $css_urls ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_parameter_type',
				'message' => "Parameter 'cssUrls' must be an array",
				'parameter' => 'cssUrls',
			], 400 );
		}
		
		// Validate followImports is boolean if provided
		if ( null !== $follow_imports && ! is_bool( $follow_imports ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_parameter_type',
				'message' => "Parameter 'followImports' must be a boolean",
				'parameter' => 'followImports',
			], 400 );
		}
		
		return null;
	}

	private function validate_content_size( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );
		$content = $request->get_param( 'content' );
		
		$content_size = strlen( $content );
		$limits = $this->security_config['size_limits'];
		
		$max_size = $limits[ $type ] ?? $limits['default'];
		
		if ( $content_size > $max_size ) {
			return new WP_REST_Response( [
				'error' => 'content_too_large',
				'message' => sprintf( 
					'Content size (%s) exceeds maximum allowed for %s content (%s)', 
					size_format( $content_size ), 
					$type,
					size_format( $max_size ) 
				),
				'content_size' => $content_size,
				'max_size' => $max_size,
				'type' => $type,
			], 413 );
		}
		
		return null;
	}

	private function validate_security_constraints( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );
		$content = $request->get_param( 'content' );
		
		// HTML security validation
		if ( 'html' === $type ) {
			$html_violations = $this->check_html_security_violations( $content );
			if ( ! empty( $html_violations ) ) {
				return new WP_REST_Response( [
					'error' => 'security_violation',
					'message' => 'HTML content contains potentially dangerous elements',
					'violations' => $html_violations,
				], 400 );
			}
		}
		
		// CSS security validation
		if ( 'css' === $type || 'html' === $type ) {
			$css_violations = $this->check_css_security_violations( $content );
			if ( ! empty( $css_violations ) ) {
				return new WP_REST_Response( [
					'error' => 'security_violation',
					'message' => 'CSS content contains potentially dangerous code',
					'violations' => $css_violations,
				], 400 );
			}
		}
		
		return null;
	}

	private function validate_url_constraints( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );
		$content = $request->get_param( 'content' );
		$css_urls = $request->get_param( 'cssUrls' ) ?: [];
		
		// URL type validation
		if ( 'url' === $type ) {
			$url_validation = $this->validate_single_url( $content );
			if ( $url_validation ) {
				return $url_validation;
			}
		}
		
		// CSS URLs validation
		foreach ( $css_urls as $index => $url ) {
			$url_validation = $this->validate_single_url( $url, "cssUrls[{$index}]" );
			if ( $url_validation ) {
				return $url_validation;
			}
		}
		
		return null;
	}

	private function validate_single_url( $url, $parameter_name = 'content' ) {
		// Basic URL format validation
		if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_url',
				'message' => "Invalid URL format in parameter '{$parameter_name}'",
				'parameter' => $parameter_name,
				'url' => $url,
			], 400 );
		}
		
		// Protocol validation (http/https only)
		$parsed_url = wp_parse_url( $url );
		if ( ! in_array( $parsed_url['scheme'] ?? '', [ 'http', 'https' ], true ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_url_scheme',
				'message' => "URL must use http or https protocol in parameter '{$parameter_name}'",
				'parameter' => $parameter_name,
				'url' => $url,
				'scheme' => $parsed_url['scheme'] ?? 'unknown',
			], 400 );
		}
		
		// Domain restrictions (if configured)
		$allowed_domains = $this->security_config['allowed_domains'];
		if ( ! empty( $allowed_domains ) ) {
			$domain = $parsed_url['host'] ?? '';
			$domain_allowed = false;
			
			foreach ( $allowed_domains as $allowed_domain ) {
				if ( $domain === $allowed_domain || str_ends_with( $domain, '.' . $allowed_domain ) ) {
					$domain_allowed = true;
					break;
				}
			}
			
			if ( ! $domain_allowed ) {
				return new WP_REST_Response( [
					'error' => 'domain_not_allowed',
					'message' => "Domain not allowed in parameter '{$parameter_name}'",
					'parameter' => $parameter_name,
					'url' => $url,
					'domain' => $domain,
					'allowed_domains' => $allowed_domains,
				], 403 );
			}
		}
		
		return null;
	}

	private function validate_nesting_depth( WP_REST_Request $request ) {
		$type = $request->get_param( 'type' );
		$content = $request->get_param( 'content' );
		
		if ( 'html' === $type ) {
			$max_depth = $this->security_config['max_nesting_depth'];
			$actual_depth = $this->calculate_html_nesting_depth( $content );
			
			if ( $actual_depth > $max_depth ) {
				return new WP_REST_Response( [
					'error' => 'nesting_too_deep',
					'message' => "HTML nesting depth ({$actual_depth}) exceeds maximum allowed ({$max_depth})",
					'actual_depth' => $actual_depth,
					'max_depth' => $max_depth,
				], 400 );
			}
		}
		
		return null;
	}

	private function validate_options( WP_REST_Request $request ) {
		$options = $request->get_param( 'options' );
		
		if ( null === $options ) {
			return null;
		}
		
		if ( ! is_array( $options ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_parameter_type',
				'message' => "Parameter 'options' must be an object/array",
				'parameter' => 'options',
			], 400 );
		}
		
		// Validate individual option fields
		$option_validations = [
			'postId' => 'validate_post_id_option',
			'postType' => 'validate_post_type_option',
			'preserveIds' => 'validate_boolean_option',
			'createGlobalClasses' => 'validate_boolean_option',
			'timeout' => 'validate_timeout_option',
			'globalClassThreshold' => 'validate_threshold_option',
		];
		
		foreach ( $option_validations as $option_key => $validation_method ) {
			if ( isset( $options[ $option_key ] ) ) {
				$validation_result = $this->$validation_method( $options[ $option_key ], $option_key );
				if ( $validation_result ) {
					return $validation_result;
				}
			}
		}
		
		return null;
	}

	private function validate_post_id_option( $value, $option_key ) {
		if ( null !== $value && ( ! is_int( $value ) || $value <= 0 ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_option_value',
				'message' => "Option '{$option_key}' must be a positive integer or null",
				'option' => $option_key,
				'value' => $value,
			], 400 );
		}
		
		// Verify post exists if ID provided
		if ( is_int( $value ) && ! get_post( $value ) ) {
			return new WP_REST_Response( [
				'error' => 'post_not_found',
				'message' => "Post with ID {$value} not found",
				'option' => $option_key,
				'post_id' => $value,
			], 404 );
		}
		
		return null;
	}

	private function validate_post_type_option( $value, $option_key ) {
		if ( ! is_string( $value ) || empty( $value ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_option_value',
				'message' => "Option '{$option_key}' must be a non-empty string",
				'option' => $option_key,
				'value' => $value,
			], 400 );
		}
		
		// Verify post type exists
		if ( ! post_type_exists( $value ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_post_type',
				'message' => "Post type '{$value}' does not exist",
				'option' => $option_key,
				'post_type' => $value,
			], 400 );
		}
		
		return null;
	}

	private function validate_boolean_option( $value, $option_key ) {
		if ( ! is_bool( $value ) ) {
			return new WP_REST_Response( [
				'error' => 'invalid_option_value',
				'message' => "Option '{$option_key}' must be a boolean",
				'option' => $option_key,
				'value' => $value,
			], 400 );
		}
		
		return null;
	}

	private function validate_timeout_option( $value, $option_key ) {
		if ( ! is_int( $value ) || $value < 1 || $value > 300 ) {
			return new WP_REST_Response( [
				'error' => 'invalid_option_value',
				'message' => "Option '{$option_key}' must be an integer between 1 and 300 seconds",
				'option' => $option_key,
				'value' => $value,
				'min' => 1,
				'max' => 300,
			], 400 );
		}
		
		return null;
	}

	private function validate_threshold_option( $value, $option_key ) {
		if ( ! is_int( $value ) || $value < 1 || $value > 100 ) {
			return new WP_REST_Response( [
				'error' => 'invalid_option_value',
				'message' => "Option '{$option_key}' must be an integer between 1 and 100",
				'option' => $option_key,
				'value' => $value,
				'min' => 1,
				'max' => 100,
			], 400 );
		}
		
		return null;
	}

	private function check_html_security_violations( $html ) {
		$violations = [];
		$dangerous_patterns = $this->security_config['html_security_patterns'];
		
		foreach ( $dangerous_patterns as $pattern_name => $pattern ) {
			if ( preg_match( $pattern, $html ) ) {
				$violations[] = [
					'type' => 'html_security',
					'pattern' => $pattern_name,
					'description' => $this->get_security_violation_description( $pattern_name ),
				];
			}
		}
		
		return $violations;
	}

	private function check_css_security_violations( $content ) {
		$violations = [];
		$dangerous_patterns = $this->security_config['css_security_patterns'];
		
		foreach ( $dangerous_patterns as $pattern_name => $pattern ) {
			if ( preg_match( $pattern, $content ) ) {
				$violations[] = [
					'type' => 'css_security',
					'pattern' => $pattern_name,
					'description' => $this->get_security_violation_description( $pattern_name ),
				];
			}
		}
		
		return $violations;
	}

	private function calculate_html_nesting_depth( $html ) {
		// Simple depth calculation using DOM parsing
		$dom = new \DOMDocument();
		$dom->loadHTML( $html, \LIBXML_HTML_NOIMPLIED | \LIBXML_HTML_NODEFDTD );
		
		return $this->get_max_element_depth( $dom->documentElement );
	}

	private function get_max_element_depth( $element, $current_depth = 0 ) {
		$max_depth = $current_depth;
		
		if ( $element->hasChildNodes() ) {
			foreach ( $element->childNodes as $child ) {
				if ( $child->nodeType === XML_ELEMENT_NODE ) {
					$child_depth = $this->get_max_element_depth( $child, $current_depth + 1 );
					$max_depth = max( $max_depth, $child_depth );
				}
			}
		}
		
		return $max_depth;
	}

	private function get_security_violation_description( $pattern_name ) {
		$descriptions = [
			'script_tags' => 'Script tags are not allowed for security reasons',
			'object_tags' => 'Object tags are not allowed for security reasons',
			'embed_tags' => 'Embed tags are not allowed for security reasons',
			'javascript_urls' => 'JavaScript URLs are not allowed for security reasons',
			'data_urls' => 'Data URLs are not allowed for security reasons',
			'css_expressions' => 'CSS expressions are not allowed for security reasons',
			'css_imports' => 'CSS @import with suspicious URLs are not allowed',
		];
		
		return $descriptions[ $pattern_name ] ?? 'Security violation detected';
	}

	private function get_validation_rules() {
		return apply_filters( 'elementor_widget_converter_validation_rules', [
			'required_parameters' => [ 'type', 'content' ],
			'valid_types' => [ 'url', 'html', 'css' ],
			'max_css_urls' => 10,
			'max_options_count' => 20,
		] );
	}

	private function get_security_config() {
		return apply_filters( 'elementor_widget_converter_security_config', [
			'size_limits' => [
				'html' => 10 * 1024 * 1024, // 10MB
				'css' => 5 * 1024 * 1024,   // 5MB
				'url' => 2048,              // 2KB for URL length
				'default' => 1024 * 1024,   // 1MB default
			],
			'max_nesting_depth' => 20,
			'allowed_domains' => [], // Empty means all domains allowed
			'html_security_patterns' => [
				'script_tags' => '/<script[^>]*>/i',
				'object_tags' => '/<object[^>]*>/i',
				'embed_tags' => '/<embed[^>]*>/i',
				'javascript_urls' => '/javascript:/i',
				'data_urls' => '/data:.*base64/i',
			],
			'css_security_patterns' => [
				'javascript_urls' => '/javascript:/i',
				'data_urls' => '/data:.*base64/i',
				'css_expressions' => '/expression\s*\(/i',
				'css_imports' => '/@import.*["\'](?:javascript:|data:)/i',
			],
		] );
	}

	public function get_validation_summary() {
		return [
			'validation_rules' => $this->validation_rules,
			'security_config' => $this->security_config,
			'supported_types' => [ 'url', 'html', 'css' ],
			'size_limits' => $this->security_config['size_limits'],
			'max_nesting_depth' => $this->security_config['max_nesting_depth'],
		];
	}
}
