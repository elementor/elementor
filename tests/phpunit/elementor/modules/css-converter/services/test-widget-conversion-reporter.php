<?php
namespace Elementor\Testing\Modules\CssConverter\Services;

use Elementor\Modules\CssConverter\Services\Widget_Conversion_Reporter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group conversion-reporter
 */
class Test_Widget_Conversion_Reporter extends Elementor_Test_Base {

	private $reporter;

	public function setUp(): void {
		parent::setUp();
		$this->reporter = new Widget_Conversion_Reporter();
	}

	public function test_adds_warnings() {
		$this->reporter->add_warning( 'Test warning message', [
			'type' => 'test_warning',
			'element' => 'div',
		] );
		
		$warnings = $this->reporter->get_warnings();
		
		$this->assertCount( 1, $warnings );
		$this->assertEquals( 'Test warning message', $warnings[0]['message'] );
		$this->assertEquals( 'test_warning', $warnings[0]['context']['type'] );
		$this->assertArrayHasKey( 'timestamp', $warnings[0] );
	}

	public function test_updates_stats() {
		$this->reporter->update_stats( 'widgets_created', 3 );
		$this->reporter->update_stats( 'elements_converted' );
		
		$stats = $this->reporter->get_stats();
		
		$this->assertEquals( 3, $stats['widgets_created'] );
		$this->assertEquals( 1, $stats['elements_converted'] );
	}

	public function test_sets_stats() {
		$this->reporter->set_stat( 'total_elements', 10 );
		
		$stats = $this->reporter->get_stats();
		
		$this->assertEquals( 10, $stats['total_elements'] );
	}

	public function test_merges_external_stats() {
		$external_stats = [
			'widgets_created' => 5,
			'properties_converted' => 15,
			'unknown_stat' => 100, // Should be ignored
		];
		
		$this->reporter->merge_stats( $external_stats );
		
		$stats = $this->reporter->get_stats();
		
		$this->assertEquals( 5, $stats['widgets_created'] );
		$this->assertEquals( 15, $stats['properties_converted'] );
		$this->assertEquals( 0, $stats['total_elements'] ); // Should remain unchanged
	}

	public function test_reports_unsupported_property() {
		$this->reporter->report_unsupported_property( 'custom-property', 'custom-value', '.test-class', 'Not supported in Elementor' );
		
		$warnings = $this->reporter->get_warnings();
		$stats = $this->reporter->get_stats();
		
		$this->assertCount( 1, $warnings );
		$this->assertStringContains( 'Skipped unsupported property: custom-property', $warnings[0]['message'] );
		$this->assertEquals( 'unsupported_property', $warnings[0]['context']['type'] );
		$this->assertEquals( 1, $stats['properties_skipped'] );
		$this->assertEquals( 1, $stats['unsupported_properties'] );
	}

	public function test_reports_widget_creation_failure() {
		$this->reporter->report_widget_creation_failure( 'e-heading', 'h1', 'Invalid attributes' );
		
		$warnings = $this->reporter->get_warnings();
		$stats = $this->reporter->get_stats();
		
		$this->assertCount( 1, $warnings );
		$this->assertStringContains( 'Failed to create e-heading widget from h1 element', $warnings[0]['message'] );
		$this->assertEquals( 'widget_creation_failure', $warnings[0]['context']['type'] );
		$this->assertEquals( 1, $stats['widgets_failed'] );
	}

	public function test_reports_fallback_widget_created() {
		$this->reporter->report_fallback_widget_created( 'e-custom', 'custom-element' );
		
		$warnings = $this->reporter->get_warnings();
		$stats = $this->reporter->get_stats();
		
		$this->assertCount( 1, $warnings );
		$this->assertStringContains( 'Created HTML fallback widget for unsupported e-custom', $warnings[0]['message'] );
		$this->assertEquals( 'fallback_widget_created', $warnings[0]['context']['type'] );
		$this->assertEquals( 1, $stats['fallback_widgets_created'] );
	}

	public function test_reports_css_processing_failure() {
		$this->reporter->report_css_processing_failure( '.test { color: invalid; }', 'Invalid color value' );
		
		$warnings = $this->reporter->get_warnings();
		
		$this->assertCount( 1, $warnings );
		$this->assertStringContains( 'Failed to process CSS rule', $warnings[0]['message'] );
		$this->assertEquals( 'css_processing_failure', $warnings[0]['context']['type'] );
	}

	public function test_reports_global_class_creation() {
		$this->reporter->report_global_class_creation( 'test-class', 5 );
		
		$processing_log = $this->reporter->get_processing_log();
		$stats = $this->reporter->get_stats();
		
		$this->assertCount( 1, $processing_log );
		$this->assertEquals( 'global_class_created', $processing_log[0]['stage'] );
		$this->assertEquals( 'test-class', $processing_log[0]['data']['class_name'] );
		$this->assertEquals( 5, $processing_log[0]['data']['properties_count'] );
		$this->assertEquals( 1, $stats['global_classes_created'] );
	}

	public function test_reports_duplicate_class_skipped() {
		$this->reporter->report_duplicate_class_skipped( 'duplicate-class' );
		
		$warnings = $this->reporter->get_warnings();
		
		$this->assertCount( 1, $warnings );
		$this->assertStringContains( 'Skipped duplicate class: duplicate-class', $warnings[0]['message'] );
		$this->assertEquals( 'duplicate_class_skipped', $warnings[0]['context']['type'] );
	}

	public function test_generates_conversion_summary() {
		// Set up some test data
		$this->reporter->set_stat( 'total_elements', 10 );
		$this->reporter->set_stat( 'elements_converted', 8 );
		$this->reporter->set_stat( 'widgets_created', 8 );
		$this->reporter->set_stat( 'widgets_failed', 2 );
		$this->reporter->set_stat( 'global_classes_created', 3 );
		$this->reporter->set_stat( 'properties_converted', 25 );
		$this->reporter->set_stat( 'fallback_widgets_created', 1 );
		
		$this->reporter->add_warning( 'Test warning 1' );
		$this->reporter->add_warning( 'Test warning 2' );
		
		$summary = $this->reporter->generate_conversion_summary();
		
		// Check summary structure
		$this->assertArrayHasKey( 'success', $summary );
		$this->assertArrayHasKey( 'stats', $summary );
		$this->assertArrayHasKey( 'warnings', $summary );
		$this->assertArrayHasKey( 'warnings_count', $summary );
		$this->assertArrayHasKey( 'success_rate', $summary );
		$this->assertArrayHasKey( 'summary_text', $summary );
		$this->assertArrayHasKey( 'recommendations', $summary );
		$this->assertArrayHasKey( 'breakdown', $summary );
		
		// Check calculated values
		$this->assertFalse( $summary['success'] ); // Has failed widgets
		$this->assertEquals( 2, $summary['warnings_count'] );
		$this->assertEquals( 80.0, $summary['success_rate'] ); // 8/10 * 100
		
		// Check breakdown
		$breakdown = $summary['breakdown'];
		$this->assertEquals( 10, $breakdown['elements']['total'] );
		$this->assertEquals( 8, $breakdown['elements']['converted'] );
		$this->assertEquals( 80.0, $breakdown['elements']['success_rate'] );
		$this->assertEquals( 8, $breakdown['widgets']['created'] );
		$this->assertEquals( 2, $breakdown['widgets']['failed'] );
		$this->assertEquals( 1, $breakdown['widgets']['fallbacks'] );
	}

	public function test_generates_warning_report() {
		// Add various types of warnings
		$this->reporter->add_warning( 'Unsupported property warning', [ 'type' => 'unsupported_property' ] );
		$this->reporter->add_warning( 'Another unsupported property', [ 'type' => 'unsupported_property' ] );
		$this->reporter->add_warning( 'Widget creation failure', [ 'type' => 'widget_creation_failure' ] );
		$this->reporter->add_warning( 'General warning', [] );
		
		$report = $this->reporter->generate_warning_report();
		
		$this->assertEquals( 4, $report['total_warnings'] );
		$this->assertArrayHasKey( 'warnings_by_type', $report );
		$this->assertArrayHasKey( 'warning_counts', $report );
		$this->assertArrayHasKey( 'most_common_issues', $report );
		
		// Check grouped warnings
		$this->assertCount( 2, $report['warnings_by_type']['unsupported_property'] );
		$this->assertCount( 1, $report['warnings_by_type']['widget_creation_failure'] );
		$this->assertCount( 1, $report['warnings_by_type']['general'] );
		
		// Check warning counts
		$this->assertEquals( 2, $report['warning_counts']['unsupported_property'] );
		$this->assertEquals( 1, $report['warning_counts']['widget_creation_failure'] );
		$this->assertEquals( 1, $report['warning_counts']['general'] );
	}

	public function test_calculates_success_rate() {
		// 100% success rate
		$this->reporter->set_stat( 'total_elements', 5 );
		$this->reporter->set_stat( 'elements_converted', 5 );
		
		$summary = $this->reporter->generate_conversion_summary();
		$this->assertEquals( 100.0, $summary['success_rate'] );
		
		// 75% success rate
		$this->reporter->set_stat( 'elements_converted', 3 );
		
		$summary = $this->reporter->generate_conversion_summary();
		$this->assertEquals( 60.0, $summary['success_rate'] ); // 3/5 * 100
	}

	public function test_generates_summary_text() {
		$this->reporter->set_stat( 'total_elements', 10 );
		$this->reporter->set_stat( 'elements_converted', 8 );
		$this->reporter->set_stat( 'widgets_created', 8 );
		$this->reporter->set_stat( 'global_classes_created', 3 );
		$this->reporter->set_stat( 'fallback_widgets_created', 1 );
		$this->reporter->add_warning( 'Test warning' );
		
		$summary = $this->reporter->generate_conversion_summary();
		$summary_text = $summary['summary_text'];
		
		$this->assertStringContains( 'Successfully converted 8 of 10 elements', $summary_text );
		$this->assertStringContains( 'Created 8 widgets', $summary_text );
		$this->assertStringContains( 'Created 3 global classes', $summary_text );
		$this->assertStringContains( '1 warnings generated', $summary_text );
		$this->assertStringContains( '1 fallback widgets created', $summary_text );
	}

	public function test_generates_recommendations() {
		// Set up conditions that trigger recommendations
		$this->reporter->set_stat( 'properties_skipped', 5 );
		$this->reporter->set_stat( 'widgets_failed', 2 );
		$this->reporter->set_stat( 'fallback_widgets_created', 3 );
		$this->reporter->set_stat( 'total_elements', 10 );
		$this->reporter->set_stat( 'elements_converted', 6 ); // 60% success rate
		
		// Add many warnings
		for ( $i = 0; $i < 15; $i++ ) {
			$this->reporter->add_warning( "Warning {$i}" );
		}
		
		$summary = $this->reporter->generate_conversion_summary();
		$recommendations = $summary['recommendations'];
		
		$this->assertNotEmpty( $recommendations );
		$this->assertContains( '5 CSS properties were not supported. Consider using standard CSS properties or check the supported properties list.', $recommendations );
		$this->assertContains( '2 widgets failed to create. Consider simplifying HTML structure or using supported HTML elements.', $recommendations );
		$this->assertContains( '3 HTML fallback widgets were created. Review these elements for potential conversion improvements.', $recommendations );
		$this->assertContains( 'High number of warnings detected. Consider reviewing HTML/CSS structure for better compatibility.', $recommendations );
		$this->assertContains( 'Low conversion success rate. Consider using more standard HTML elements and CSS properties.', $recommendations );
	}

	public function test_calculates_quality_score() {
		// High quality conversion
		$this->reporter->set_stat( 'total_elements', 10 );
		$this->reporter->set_stat( 'elements_converted', 10 );
		$this->reporter->set_stat( 'fallback_widgets_created', 0 );
		// No warnings
		
		$quality_score = $this->reporter->get_conversion_quality_score();
		$this->assertEquals( 100.0, $quality_score );
		
		// Lower quality conversion
		$this->reporter->set_stat( 'elements_converted', 8 ); // 80% success rate
		$this->reporter->set_stat( 'fallback_widgets_created', 2 ); // 10 point penalty
		$this->reporter->add_warning( 'Warning 1' ); // 2 point penalty
		$this->reporter->add_warning( 'Warning 2' ); // 2 point penalty
		
		$quality_score = $this->reporter->get_conversion_quality_score();
		$this->assertEquals( 66.0, $quality_score ); // 80 - 4 - 10 = 66
	}

	public function test_has_warnings() {
		$this->assertFalse( $this->reporter->has_warnings() );
		
		$this->reporter->add_warning( 'Test warning' );
		
		$this->assertTrue( $this->reporter->has_warnings() );
	}

	public function test_has_errors() {
		$this->assertFalse( $this->reporter->has_errors() );
		
		// Add non-critical warning
		$this->reporter->add_warning( 'General warning', [ 'type' => 'general' ] );
		$this->assertFalse( $this->reporter->has_errors() );
		
		// Add critical warning
		$this->reporter->add_warning( 'Widget creation failed', [ 'type' => 'widget_creation_failure' ] );
		$this->assertTrue( $this->reporter->has_errors() );
	}

	public function test_clears_warnings() {
		$this->reporter->add_warning( 'Test warning 1' );
		$this->reporter->add_warning( 'Test warning 2' );
		
		$this->assertCount( 2, $this->reporter->get_warnings() );
		
		$this->reporter->clear_warnings();
		
		$this->assertEmpty( $this->reporter->get_warnings() );
	}

	public function test_resets_stats() {
		$this->reporter->set_stat( 'widgets_created', 5 );
		$this->reporter->add_warning( 'Test warning' );
		$this->reporter->add_processing_log( 'test_stage', [ 'data' => 'test' ] );
		
		$this->assertEquals( 5, $this->reporter->get_stats()['widgets_created'] );
		$this->assertNotEmpty( $this->reporter->get_warnings() );
		$this->assertNotEmpty( $this->reporter->get_processing_log() );
		
		$this->reporter->reset_stats();
		
		$this->assertEquals( 0, $this->reporter->get_stats()['widgets_created'] );
		$this->assertEmpty( $this->reporter->get_processing_log() );
		// Note: reset_stats doesn't clear warnings, only clear_warnings() does
	}

	public function test_adds_processing_log() {
		$this->reporter->add_processing_log( 'html_parsing', [
			'elements_found' => 10,
			'parsing_time' => 0.05,
		] );
		
		$log = $this->reporter->get_processing_log();
		
		$this->assertCount( 1, $log );
		$this->assertEquals( 'html_parsing', $log[0]['stage'] );
		$this->assertEquals( 10, $log[0]['data']['elements_found'] );
		$this->assertArrayHasKey( 'timestamp', $log[0] );
	}

	public function test_handles_empty_stats() {
		// Test with no elements
		$summary = $this->reporter->generate_conversion_summary();
		
		$this->assertEquals( 100, $summary['success_rate'] ); // Should default to 100% if no elements
		$this->assertStringContains( 'No elements found to convert', $summary['summary_text'] );
	}

	public function test_processing_time_calculation() {
		// Add processing logs with time gaps
		$this->reporter->add_processing_log( 'start', [] );
		usleep( 10000 ); // 0.01 seconds
		$this->reporter->add_processing_log( 'end', [] );
		
		$summary = $this->reporter->generate_conversion_summary();
		
		$this->assertGreaterThan( 0, $summary['processing_time'] );
		$this->assertLessThan( 1, $summary['processing_time'] ); // Should be less than 1 second
	}
}
