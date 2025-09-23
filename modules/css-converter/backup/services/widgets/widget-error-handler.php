<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Error_Handler {
	private $error_log;
	private $warning_log;
	private $recovery_strategies;
	private $error_stats;

	public function __construct() {
		$this->error_log = [];
		$this->warning_log = [];
		$this->error_stats = [
			'total_errors' => 0,
			'total_warnings' => 0,
			'recoverable_errors' => 0,
			'fatal_errors' => 0,
			'fallback_widgets_created' => 0,
		];
		
		$this->recovery_strategies = [
			'widget_creation_failed' => 'create_html_fallback',
			'css_processing_failed' => 'skip_styling_continue',
			'global_class_failed' => 'inline_styles_fallback',
			'hierarchy_error' => 'flatten_hierarchy',
			'post_creation_failed' => 'retry_with_defaults',
		];
	}

	public function handle_error( $error_type, $error_data, $context = [] ) {
		// HVV Requirement: "Please advise us" + "just report it" strategy
		
		$error_entry = [
			'type' => $error_type,
			'message' => $error_data['message'] ?? 'Unknown error',
			'context' => $context,
			'timestamp' => current_time( 'mysql' ),
			'severity' => $this->determine_error_severity( $error_type ),
			'recoverable' => $this->is_error_recoverable( $error_type ),
			'recovery_strategy' => $this->recovery_strategies[ $error_type ] ?? null,
		];
		
		// Add detailed error information
		if ( isset( $error_data['exception'] ) && $error_data['exception'] instanceof \Exception ) {
			$error_entry['exception_message'] = $error_data['exception']->getMessage();
			$error_entry['stack_trace'] = $error_data['exception']->getTraceAsString();
			$error_entry['file'] = $error_data['exception']->getFile();
			$error_entry['line'] = $error_data['exception']->getLine();
		}
		
		// Log error
		$this->error_log[] = $error_entry;
		$this->error_stats['total_errors']++;
		
		if ( $error_entry['recoverable'] ) {
			$this->error_stats['recoverable_errors']++;
		} else {
			$this->error_stats['fatal_errors']++;
		}
		
		// Log to WordPress error log if enabled
		if ( WP_DEBUG_LOG ) {
			error_log( sprintf(
				'[Elementor Widget Converter] %s: %s (Context: %s)',
				$error_type,
				$error_entry['message'],
				wp_json_encode( $context )
			) );
		}
		
		// Attempt recovery if possible
		if ( $error_entry['recoverable'] && $error_entry['recovery_strategy'] ) {
			return $this->attempt_recovery( $error_entry, $error_data, $context );
		}
		
		return null;
	}

	public function handle_warning( $warning_type, $warning_data, $context = [] ) {
		$warning_entry = [
			'type' => $warning_type,
			'message' => $warning_data['message'] ?? 'Unknown warning',
			'context' => $context,
			'timestamp' => current_time( 'mysql' ),
			'severity' => 'warning',
		];
		
		$this->warning_log[] = $warning_entry;
		$this->error_stats['total_warnings']++;
		
		// Log warning if debug mode is enabled
		if ( WP_DEBUG ) {
			error_log( sprintf(
				'[Elementor Widget Converter Warning] %s: %s',
				$warning_type,
				$warning_entry['message']
			) );
		}
	}

	private function determine_error_severity( $error_type ) {
		$severity_map = [
			'widget_creation_failed' => 'medium',
			'css_processing_failed' => 'low',
			'global_class_failed' => 'low',
			'hierarchy_error' => 'high',
			'post_creation_failed' => 'critical',
			'elementor_integration_failed' => 'critical',
			'html_parsing_failed' => 'high',
			'css_parsing_failed' => 'medium',
			'validation_failed' => 'medium',
		];
		
		return $severity_map[ $error_type ] ?? 'medium';
	}

	private function is_error_recoverable( $error_type ) {
		$recoverable_errors = [
			'widget_creation_failed',
			'css_processing_failed',
			'global_class_failed',
			'hierarchy_error',
			'post_creation_failed',
		];
		
		return in_array( $error_type, $recoverable_errors, true );
	}

	private function attempt_recovery( $error_entry, $error_data, $context ) {
		$strategy = $error_entry['recovery_strategy'];
		
		try {
			switch ( $strategy ) {
				case 'create_html_fallback':
					return $this->create_html_fallback_widget( $error_data, $context );
				case 'skip_styling_continue':
					return $this->skip_styling_continue( $error_data, $context );
				case 'inline_styles_fallback':
					return $this->inline_styles_fallback( $error_data, $context );
				case 'flatten_hierarchy':
					return $this->flatten_hierarchy( $error_data, $context );
				case 'retry_with_defaults':
					return $this->retry_with_defaults( $error_data, $context );
				default:
					return null;
			}
		} catch ( \Exception $recovery_exception ) {
			$this->handle_error( 'recovery_failed', [
				'message' => 'Recovery strategy failed: ' . $recovery_exception->getMessage(),
				'original_error' => $error_entry['type'],
				'recovery_strategy' => $strategy,
				'exception' => $recovery_exception,
			], $context );
			
			return null;
		}
	}

	private function create_html_fallback_widget( $error_data, $context ) {
		// HVV Strategy: Create HTML widget fallback for unconvertible elements
		
		$widget = $context['widget'] ?? null;
		if ( ! $widget ) {
			throw new \Exception( 'No widget data available for HTML fallback' );
		}
		
		$html_content = $this->reconstruct_original_html( $widget );
		
		$fallback_widget = [
			'id' => wp_generate_uuid4(),
			'elType' => 'widget',
			'widgetType' => 'html',
			'settings' => [
				'html' => $html_content,
				'_element_css_classes' => 'elementor-widget-converter-fallback',
			],
			'fallback_info' => [
				'original_widget_type' => $widget['widget_type'] ?? 'unknown',
				'original_tag' => $widget['element_data']['tag'] ?? 'unknown',
				'fallback_reason' => $error_data['message'] ?? 'Widget creation failed',
				'created_at' => current_time( 'mysql' ),
			],
		];
		
		$this->error_stats['fallback_widgets_created']++;
		
		$this->handle_warning( 'fallback_widget_created', [
			'message' => 'Created HTML fallback widget due to conversion failure',
			'original_widget_type' => $widget['widget_type'] ?? 'unknown',
		], $context );
		
		return $fallback_widget;
	}

	private function skip_styling_continue( $error_data, $context ) {
		// Skip CSS styling but continue with widget structure
		
		$widget = $context['widget'] ?? null;
		if ( ! $widget ) {
			throw new \Exception( 'No widget data available for styling skip' );
		}
		
		// Remove styling information but keep structure
		unset( $widget['applied_styles'] );
		unset( $widget['computed_styles'] );
		
		$this->handle_warning( 'styling_skipped', [
			'message' => 'CSS styling skipped due to processing error',
			'widget_type' => $widget['widget_type'] ?? 'unknown',
		], $context );
		
		return $widget;
	}

	private function inline_styles_fallback( $error_data, $context ) {
		// Fallback to inline styles when global class creation fails
		
		$widget = $context['widget'] ?? null;
		$css_styles = $context['css_styles'] ?? [];
		
		if ( ! $widget || empty( $css_styles ) ) {
			throw new \Exception( 'Insufficient data for inline styles fallback' );
		}
		
		// Convert CSS styles to inline style attribute
		$inline_styles = [];
		foreach ( $css_styles as $property => $value ) {
			$inline_styles[] = "{$property}: {$value}";
		}
		
		$widget['settings']['_element_css_inline'] = implode( '; ', $inline_styles );
		
		$this->handle_warning( 'inline_styles_fallback', [
			'message' => 'Using inline styles fallback due to global class creation failure',
			'properties_count' => count( $css_styles ),
		], $context );
		
		return $widget;
	}

	private function flatten_hierarchy( $error_data, $context ) {
		// Flatten widget hierarchy when hierarchy processing fails
		
		$widgets = $context['widgets'] ?? [];
		if ( empty( $widgets ) ) {
			throw new \Exception( 'No widgets available for hierarchy flattening' );
		}
		
		$flattened_widgets = $this->flatten_widget_tree( $widgets );
		
		$this->handle_warning( 'hierarchy_flattened', [
			'message' => 'Widget hierarchy flattened due to processing error',
			'original_count' => count( $widgets ),
			'flattened_count' => count( $flattened_widgets ),
		], $context );
		
		return $flattened_widgets;
	}

	private function retry_with_defaults( $error_data, $context ) {
		// Retry operation with default/safe values
		
		$operation = $context['operation'] ?? 'unknown';
		$defaults = $this->get_safe_defaults( $operation );
		
		$this->handle_warning( 'retrying_with_defaults', [
			'message' => "Retrying {$operation} with default values",
			'defaults_applied' => array_keys( $defaults ),
		], $context );
		
		return $defaults;
	}

	private function reconstruct_original_html( $widget ) {
		$element_data = $widget['element_data'] ?? [];
		$tag = $element_data['tag'] ?? 'div';
		$attributes = $element_data['attributes'] ?? [];
		$content = $element_data['content'] ?? '';
		
		// Build attributes string
		$attr_string = '';
		foreach ( $attributes as $attr => $value ) {
			$attr_string .= ' ' . esc_attr( $attr ) . '="' . esc_attr( $value ) . '"';
		}
		
		// Add fallback indicator
		$attr_string .= ' data-elementor-converter-fallback="true"';
		
		// Handle self-closing tags
		if ( in_array( $tag, [ 'img', 'br', 'hr', 'input', 'meta', 'link' ], true ) ) {
			return "<{$tag}{$attr_string} />";
		}
		
		// Handle children if present
		$child_html = '';
		if ( ! empty( $widget['children'] ) ) {
			foreach ( $widget['children'] as $child ) {
				$child_html .= $this->reconstruct_original_html( $child );
			}
		}
		
		$full_content = $content . $child_html;
		
		return "<{$tag}{$attr_string}>{$full_content}</{$tag}>";
	}

	private function flatten_widget_tree( $widgets, &$flattened = [] ) {
		foreach ( $widgets as $widget ) {
			// Add current widget to flattened list
			$flat_widget = $widget;
			unset( $flat_widget['children'] ); // Remove hierarchy
			$flattened[] = $flat_widget;
			
			// Recursively flatten children
			if ( ! empty( $widget['children'] ) ) {
				$this->flatten_widget_tree( $widget['children'], $flattened );
			}
		}
		
		return $flattened;
	}

	private function get_safe_defaults( $operation ) {
		$defaults = [
			'post_creation' => [
				'post_title' => 'Elementor Widget Conversion',
				'post_type' => 'page',
				'post_status' => 'draft',
			],
			'widget_creation' => [
				'widgetType' => 'html',
				'settings' => [
					'html' => '<div>Content could not be converted</div>',
				],
			],
			'global_class_creation' => [
				'id' => 'fallback-class',
				'label' => 'Fallback Class',
				'type' => 'class',
			],
		];
		
		return $defaults[ $operation ] ?? [];
	}

	public function generate_error_report() {
		// Generate comprehensive error report for user notification
		
		$report = [
			'summary' => [
				'total_errors' => $this->error_stats['total_errors'],
				'total_warnings' => $this->error_stats['total_warnings'],
				'recoverable_errors' => $this->error_stats['recoverable_errors'],
				'fatal_errors' => $this->error_stats['fatal_errors'],
				'fallback_widgets_created' => $this->error_stats['fallback_widgets_created'],
				'success_rate' => $this->calculate_success_rate(),
			],
			'errors_by_type' => $this->group_errors_by_type(),
			'warnings_by_type' => $this->group_warnings_by_type(),
			'recommendations' => $this->generate_recommendations(),
			'recovery_actions_taken' => $this->get_recovery_actions_taken(),
		];
		
		return $report;
	}

	private function calculate_success_rate() {
		$total_operations = $this->error_stats['total_errors'] + $this->error_stats['recoverable_errors'];
		if ( 0 === $total_operations ) {
			return 100;
		}
		
		$successful_operations = $this->error_stats['recoverable_errors'];
		return round( ( $successful_operations / $total_operations ) * 100, 2 );
	}

	private function group_errors_by_type() {
		$grouped = [];
		foreach ( $this->error_log as $error ) {
			$type = $error['type'];
			if ( ! isset( $grouped[ $type ] ) ) {
				$grouped[ $type ] = [];
			}
			$grouped[ $type ][] = $error;
		}
		return $grouped;
	}

	private function group_warnings_by_type() {
		$grouped = [];
		foreach ( $this->warning_log as $warning ) {
			$type = $warning['type'];
			if ( ! isset( $grouped[ $type ] ) ) {
				$grouped[ $type ] = [];
			}
			$grouped[ $type ][] = $warning;
		}
		return $grouped;
	}

	private function generate_recommendations() {
		$recommendations = [];
		
		// Analyze error patterns and generate recommendations
		$error_types = array_keys( $this->group_errors_by_type() );
		
		foreach ( $error_types as $error_type ) {
			switch ( $error_type ) {
				case 'widget_creation_failed':
					$recommendations[] = 'Consider simplifying HTML structure or using supported HTML elements only.';
					break;
				case 'css_processing_failed':
					$recommendations[] = 'Review CSS syntax and ensure compatibility with supported CSS properties.';
					break;
				case 'hierarchy_error':
					$recommendations[] = 'Check HTML nesting structure for proper parent-child relationships.';
					break;
				case 'post_creation_failed':
					$recommendations[] = 'Verify WordPress permissions and available disk space.';
					break;
			}
		}
		
		return array_unique( $recommendations );
	}

	private function get_recovery_actions_taken() {
		$actions = [];
		
		foreach ( $this->error_log as $error ) {
			if ( $error['recoverable'] && $error['recovery_strategy'] ) {
				$actions[] = [
					'error_type' => $error['type'],
					'recovery_strategy' => $error['recovery_strategy'],
					'timestamp' => $error['timestamp'],
				];
			}
		}
		
		return $actions;
	}

	public function get_error_log() {
		return $this->error_log;
	}

	public function get_warning_log() {
		return $this->warning_log;
	}

	public function get_error_stats() {
		return $this->error_stats;
	}

	public function clear_logs() {
		$this->error_log = [];
		$this->warning_log = [];
		$this->error_stats = [
			'total_errors' => 0,
			'total_warnings' => 0,
			'recoverable_errors' => 0,
			'fatal_errors' => 0,
			'fallback_widgets_created' => 0,
		];
	}
}
