<?php
namespace Elementor\Modules\CssConverter\Services\Widget;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Conversion_Reporter {
	private $warnings;
	private $conversion_stats;
	private $processing_log;

	public function __construct() {
		$this->warnings = [];
		$this->conversion_stats = [
			'total_elements' => 0,
			'elements_converted' => 0,
			'elements_skipped' => 0,
			'widgets_created' => 0,
			'widgets_failed' => 0,
			'global_classes_created' => 0,
			'properties_converted' => 0,
			'properties_skipped' => 0,
			'css_rules_processed' => 0,
			'unsupported_properties' => 0,
			'fallback_widgets_created' => 0,
		];
		$this->processing_log = [];
	}

	public function add_warning( $message, $context = [] ) {
		// HVV: "For now just a warning" - following class import pattern
		$warning = [
			'message' => $message,
			'timestamp' => current_time( 'mysql' ),
			'context' => $context,
		];
		
		$this->warnings[] = $warning;
		
		// Log warning if debug mode is enabled (following class import pattern)
		if ( WP_DEBUG ) {
			error_log( sprintf( '[Elementor Widget Converter Warning] %s', $message ) );
		}
	}

	public function add_processing_log( $stage, $data ) {
		$this->processing_log[] = [
			'stage' => $stage,
			'timestamp' => microtime( true ),
			'data' => $data,
		];
	}

	public function update_stats( $stat_key, $value = 1 ) {
		if ( isset( $this->conversion_stats[ $stat_key ] ) ) {
			$this->conversion_stats[ $stat_key ] += $value;
		}
	}

	public function set_stat( $stat_key, $value ) {
		$this->conversion_stats[ $stat_key ] = $value;
	}

	public function merge_stats( $external_stats ) {
		foreach ( $external_stats as $key => $value ) {
			if ( isset( $this->conversion_stats[ $key ] ) && is_numeric( $value ) ) {
				$this->conversion_stats[ $key ] += $value;
			}
		}
	}

	public function report_unsupported_property( $property, $value, $selector, $reason = null ) {
		// Following class import pattern for unsupported properties
		$message = "Skipped unsupported property: {$property}";
		if ( $value ) {
			$message .= " with value: {$value}";
		}
		if ( $selector ) {
			$message .= " in {$selector}";
		}
		if ( $reason ) {
			$message .= " ({$reason})";
		}
		
		$this->add_warning( $message, [
			'type' => 'unsupported_property',
			'property' => $property,
			'value' => $value,
			'selector' => $selector,
			'reason' => $reason,
		] );
		
		$this->update_stats( 'properties_skipped' );
		$this->update_stats( 'unsupported_properties' );
	}

	public function report_widget_creation_failure( $widget_type, $element_tag, $reason ) {
		$message = "Failed to create {$widget_type} widget from {$element_tag} element: {$reason}";
		
		$this->add_warning( $message, [
			'type' => 'widget_creation_failure',
			'widget_type' => $widget_type,
			'element_tag' => $element_tag,
			'reason' => $reason,
		] );
		
		$this->update_stats( 'widgets_failed' );
	}

	public function report_fallback_widget_created( $original_type, $element_tag ) {
		$message = "Created HTML fallback widget for unsupported {$original_type} ({$element_tag})";
		
		$this->add_warning( $message, [
			'type' => 'fallback_widget_created',
			'original_type' => $original_type,
			'element_tag' => $element_tag,
		] );
		
		$this->update_stats( 'fallback_widgets_created' );
	}

	public function report_css_processing_failure( $css_rule, $reason ) {
		$message = "Failed to process CSS rule '{$css_rule}': {$reason}";
		
		$this->add_warning( $message, [
			'type' => 'css_processing_failure',
			'css_rule' => $css_rule,
			'reason' => $reason,
		] );
	}

	public function report_global_class_creation( $class_name, $properties_count ) {
		$this->add_processing_log( 'global_class_created', [
			'class_name' => $class_name,
			'properties_count' => $properties_count,
		] );
		
		$this->update_stats( 'global_classes_created' );
	}

	public function report_duplicate_class_skipped( $class_name ) {
		// Following class import pattern for duplicate classes
		$message = "Skipped duplicate class: {$class_name}";
		
		$this->add_warning( $message, [
			'type' => 'duplicate_class_skipped',
			'class_name' => $class_name,
		] );
	}

	public function report_html_validation_issue( $issue_type, $details ) {
		$message = "HTML validation issue: {$issue_type}";
		
		$this->add_warning( $message, [
			'type' => 'html_validation_issue',
			'issue_type' => $issue_type,
			'details' => $details,
		] );
	}

	public function report_css_security_violation( $violation_type, $pattern ) {
		$message = "CSS security violation: {$violation_type}";
		
		$this->add_warning( $message, [
			'type' => 'css_security_violation',
			'violation_type' => $violation_type,
			'pattern' => $pattern,
		] );
	}

	public function generate_conversion_summary() {
		// Generate comprehensive conversion summary similar to class import
		
		$success_rate = $this->calculate_success_rate();
		$processing_time = $this->calculate_processing_time();
		
		$summary = [
			'success' => $this->conversion_stats['widgets_failed'] === 0,
			'stats' => $this->conversion_stats,
			'warnings' => $this->warnings,
			'warnings_count' => count( $this->warnings ),
			'success_rate' => $success_rate,
			'processing_time' => $processing_time,
			'summary_text' => $this->generate_summary_text(),
			'recommendations' => $this->generate_recommendations(),
		];
		
		// Add detailed breakdown
		$summary['breakdown'] = [
			'elements' => [
				'total' => $this->conversion_stats['total_elements'],
				'converted' => $this->conversion_stats['elements_converted'],
				'skipped' => $this->conversion_stats['elements_skipped'],
				'success_rate' => $this->calculate_element_success_rate(),
			],
			'widgets' => [
				'created' => $this->conversion_stats['widgets_created'],
				'failed' => $this->conversion_stats['widgets_failed'],
				'fallbacks' => $this->conversion_stats['fallback_widgets_created'],
			],
			'css' => [
				'rules_processed' => $this->conversion_stats['css_rules_processed'],
				'properties_converted' => $this->conversion_stats['properties_converted'],
				'properties_skipped' => $this->conversion_stats['properties_skipped'],
				'global_classes_created' => $this->conversion_stats['global_classes_created'],
			],
		];
		
		return $summary;
	}

	public function generate_warning_report() {
		// Group warnings by type for better reporting
		$grouped_warnings = [];
		$warning_counts = [];
		
		foreach ( $this->warnings as $warning ) {
			$type = $warning['context']['type'] ?? 'general';
			
			if ( ! isset( $grouped_warnings[ $type ] ) ) {
				$grouped_warnings[ $type ] = [];
				$warning_counts[ $type ] = 0;
			}
			
			$grouped_warnings[ $type ][] = $warning;
			$warning_counts[ $type ]++;
		}
		
		return [
			'total_warnings' => count( $this->warnings ),
			'warnings_by_type' => $grouped_warnings,
			'warning_counts' => $warning_counts,
			'most_common_issues' => $this->get_most_common_issues( $warning_counts ),
		];
	}

	private function calculate_success_rate() {
		$total_operations = $this->conversion_stats['total_elements'];
		if ( 0 === $total_operations ) {
			return 100;
		}
		
		$successful_operations = $this->conversion_stats['elements_converted'];
		return round( ( $successful_operations / $total_operations ) * 100, 2 );
	}

	private function calculate_element_success_rate() {
		$total_elements = $this->conversion_stats['total_elements'];
		if ( 0 === $total_elements ) {
			return 100;
		}
		
		$converted_elements = $this->conversion_stats['elements_converted'];
		return round( ( $converted_elements / $total_elements ) * 100, 2 );
	}

	private function calculate_processing_time() {
		if ( empty( $this->processing_log ) ) {
			return 0;
		}
		
		$start_time = $this->processing_log[0]['timestamp'];
		$end_time = end( $this->processing_log )['timestamp'];
		
		return round( $end_time - $start_time, 3 );
	}

	private function generate_summary_text() {
		$stats = $this->conversion_stats;
		$warnings_count = count( $this->warnings );
		
		if ( 0 === $stats['total_elements'] ) {
			return 'No elements found to convert.';
		}
		
		$summary_parts = [];
		
		// Elements summary
		if ( $stats['elements_converted'] > 0 ) {
			$summary_parts[] = sprintf( 
				'Successfully converted %d of %d elements (%s%%)',
				$stats['elements_converted'],
				$stats['total_elements'],
				$this->calculate_element_success_rate()
			);
		}
		
		// Widgets summary
		if ( $stats['widgets_created'] > 0 ) {
			$summary_parts[] = sprintf( 'Created %d widgets', $stats['widgets_created'] );
		}
		
		// Global classes summary
		if ( $stats['global_classes_created'] > 0 ) {
			$summary_parts[] = sprintf( 'Created %d global classes', $stats['global_classes_created'] );
		}
		
		// Warnings summary
		if ( $warnings_count > 0 ) {
			$summary_parts[] = sprintf( '%d warnings generated', $warnings_count );
		}
		
		// Fallbacks summary
		if ( $stats['fallback_widgets_created'] > 0 ) {
			$summary_parts[] = sprintf( '%d fallback widgets created', $stats['fallback_widgets_created'] );
		}
		
		return implode( '. ', $summary_parts ) . '.';
	}

	private function generate_recommendations() {
		$recommendations = [];
		$stats = $this->conversion_stats;
		
		// Analyze warning patterns and generate recommendations
		$warning_types = [];
		foreach ( $this->warnings as $warning ) {
			$type = $warning['context']['type'] ?? 'general';
			$warning_types[ $type ] = ( $warning_types[ $type ] ?? 0 ) + 1;
		}
		
		// Unsupported properties recommendation
		if ( $stats['properties_skipped'] > 0 ) {
			$recommendations[] = sprintf(
				'%d CSS properties were not supported. Consider using standard CSS properties or check the supported properties list.',
				$stats['properties_skipped']
			);
		}
		
		// Widget creation failures recommendation
		if ( $stats['widgets_failed'] > 0 ) {
			$recommendations[] = sprintf(
				'%d widgets failed to create. Consider simplifying HTML structure or using supported HTML elements.',
				$stats['widgets_failed']
			);
		}
		
		// Fallback widgets recommendation
		if ( $stats['fallback_widgets_created'] > 0 ) {
			$recommendations[] = sprintf(
				'%d HTML fallback widgets were created. Review these elements for potential conversion improvements.',
				$stats['fallback_widgets_created']
			);
		}
		
		// High warning count recommendation
		if ( count( $this->warnings ) > 10 ) {
			$recommendations[] = 'High number of warnings detected. Consider reviewing HTML/CSS structure for better compatibility.';
		}
		
		// Low success rate recommendation
		if ( $this->calculate_success_rate() < 80 ) {
			$recommendations[] = 'Low conversion success rate. Consider using more standard HTML elements and CSS properties.';
		}
		
		return $recommendations;
	}

	private function get_most_common_issues( $warning_counts ) {
		arsort( $warning_counts );
		return array_slice( $warning_counts, 0, 5, true );
	}

	public function get_warnings() {
		return $this->warnings;
	}

	public function get_stats() {
		return $this->conversion_stats;
	}

	public function get_processing_log() {
		return $this->processing_log;
	}

	public function clear_warnings() {
		// Following class import pattern
		$this->warnings = [];
	}

	public function reset_stats() {
		$this->conversion_stats = [
			'total_elements' => 0,
			'elements_converted' => 0,
			'elements_skipped' => 0,
			'widgets_created' => 0,
			'widgets_failed' => 0,
			'global_classes_created' => 0,
			'properties_converted' => 0,
			'properties_skipped' => 0,
			'css_rules_processed' => 0,
			'unsupported_properties' => 0,
			'fallback_widgets_created' => 0,
		];
		$this->processing_log = [];
	}

	public function has_warnings() {
		return ! empty( $this->warnings );
	}

	public function has_errors() {
		// Check if there are any critical warnings that should be considered errors
		foreach ( $this->warnings as $warning ) {
			$type = $warning['context']['type'] ?? '';
			if ( in_array( $type, [ 'widget_creation_failure', 'css_security_violation' ], true ) ) {
				return true;
			}
		}
		
		return false;
	}

	public function get_conversion_quality_score() {
		// Calculate a quality score based on success rates and warnings
		$element_success_rate = $this->calculate_element_success_rate();
		$warning_penalty = min( count( $this->warnings ) * 2, 30 ); // Max 30 point penalty
		$fallback_penalty = $this->conversion_stats['fallback_widgets_created'] * 5; // 5 points per fallback
		
		$quality_score = max( 0, $element_success_rate - $warning_penalty - $fallback_penalty );
		
		return round( $quality_score, 1 );
	}
}
