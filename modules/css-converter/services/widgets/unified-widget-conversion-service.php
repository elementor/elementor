<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider;
use Elementor\Modules\CssConverter\Services\Stats\Conversion_Statistics_Collector;
use Elementor\Modules\CssConverter\Services\Response\Conversion_Response_Builder;
use Elementor\Modules\CssConverter\Services\Logging\Conversion_Logger;


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Unified_Widget_Conversion_Service {
	private $html_parser;
	private $widget_mapper;
	private $unified_css_processor;
	private $widget_creator;
	private $use_zero_defaults;
	private $property_converter;
	private $statistics_collector;
	private $response_builder;
	private $logger;
	public function __construct(
		$html_parser,
		$widget_mapper,
		$unified_css_processor,
		$widget_creator,
		bool $use_zero_defaults = false,
		Conversion_Statistics_Collector $statistics_collector = null,
		Conversion_Response_Builder $response_builder = null,
		Conversion_Logger $logger = null
	) {
		$this->html_parser = $html_parser;
		$this->widget_mapper = $widget_mapper;
		$this->unified_css_processor = $unified_css_processor;
		$this->widget_creator = $widget_creator;
		$this->use_zero_defaults = $use_zero_defaults;
		$this->property_converter = new Css_Property_Conversion_Service();

		// Initialize extracted services (with defaults for backward compatibility)
		$this->statistics_collector = $statistics_collector ?? new Conversion_Statistics_Collector();
		$this->response_builder = $response_builder ?? new Conversion_Response_Builder();
		$this->logger = $logger ?? new Conversion_Logger();
	}
	public function convert_from_html( $html, $css_urls = [], $follow_imports = false, $options = [] ): array {
		$this->use_zero_defaults = true;
		$this->widget_creator = new \Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Orchestrator( $this->use_zero_defaults );

		// Initialize logging
		$conversion_log = $this->logger->start_conversion_log( $html, $css_urls );
		$this->logger->set_options( $options );
		try {
			$elements = $this->html_parser->parse( $html );

			// Log parsing and validation stats
			$validation_issues = $this->html_parser->validate_html_structure( $elements, 20 );
			$this->logger->add_parsing_stats( $elements, $validation_issues );

			$mapped_widgets = $this->widget_mapper->map_elements( $elements );
			$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
			$this->logger->add_mapping_stats( $mapping_stats );

			// DELEGATE CSS extraction to unified processor (proper separation of concerns)
			$all_css = $this->unified_css_processor->extract_and_process_css_from_html_and_urls( $html, $css_urls, $follow_imports, $elements );
			$this->logger->add_css_size( strlen( $all_css ) );

		try {
			$unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets, $options );
		} catch ( \Exception $e ) {
			throw $e;
		}

			$resolved_widgets = $unified_processing_result['widgets'];
			$global_classes = $unified_processing_result['global_classes'] ?? [];
			$css_variable_definitions = $unified_processing_result['css_variable_definitions'] ?? [];

			// Create widgets with resolved styles
			$creation_result = $this->create_widgets_with_resolved_styles( $resolved_widgets, $options, $global_classes, $css_variable_definitions );

			// Log CSS processing and widget creation stats
			$this->logger->add_css_processing_stats( $unified_processing_result['stats'] ?? [] );
			$this->logger->add_widget_creation_stats( $creation_result['stats'] ?? [] );

			// Collect all statistics using the statistics collector
			$css_stats = $this->statistics_collector->collect_css_processing_stats( $unified_processing_result );
			$widget_stats = $this->statistics_collector->collect_widget_creation_stats( $creation_result );
			$modifier_stats = $this->statistics_collector->collect_modifier_stats( $unified_processing_result );
			$reset_stats = $this->statistics_collector->collect_reset_styles_stats( $unified_processing_result );
			$performance_stats = $this->statistics_collector->collect_performance_stats( $conversion_log['start_time'] );

			// Combine all stats
			$all_stats = array_merge( $css_stats, $widget_stats, $modifier_stats, $reset_stats, $performance_stats );

			// Finalize logging
			$conversion_log = $this->logger->finalize_log();

			// Build final response using response builder
			return $this->response_builder->build_success_response( $all_stats, $conversion_log );
		} catch ( \Exception $e ) {
			$this->logger->add_error( $e->getMessage(), $e->getTraceAsString() );
			throw new Class_Conversion_Exception(
				'Widget conversion failed: ' . esc_html( $e->getMessage() ),
				0
			);
		}
	}












	private function create_widgets_with_resolved_styles( array $widgets, array $options, array $global_classes, array $css_variable_definitions = [] ): array {
		$post_id = $options['postId'] ?? null;
		$post_type = $options['postType'] ?? 'page';
		if ( null === $post_id ) {
			$post_id = wp_insert_post( [
				'post_title' => 'Elementor Widget Conversion - ' . gmdate( 'Y-m-d H:i:s' ),
				'post_status' => 'draft',
				'post_type' => $post_type,
			] );
		}
		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return [
				'widgets_created' => 0,
				'global_classes_created' => count( $global_classes ),
				'variables_created' => 0,
				'post_id' => 0,
				'edit_url' => '',
				'errors' => [ 'Failed to create post' ],
				'stats' => [],
			];
		}
		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $post_id, '_elementor_template_type', 'wp-page' );
		update_post_meta( $post_id, '_elementor_version', ELEMENTOR_VERSION );
		// Extract resolved styles from widgets by source type for widget_creator compatibility
		$extracted_styles = $this->extract_styles_by_source_from_widgets( $widgets );
		$css_processing_result = [
			'global_classes' => $global_classes,
			'css_variable_definitions' => $css_variable_definitions,
			'widget_styles' => array_merge( $extracted_styles['css_selector_styles'], $extracted_styles['reset_element_styles'] ),
			'element_styles' => $extracted_styles['element_styles'],
			'id_styles' => $extracted_styles['id_styles'],
			'direct_widget_styles' => $extracted_styles['inline_styles'],
			'stats' => [
				'rules_processed' => count( $global_classes ),
				'properties_converted' => 0, // Now handled by unified service
				'global_classes_created' => count( $global_classes ),
				'css_variables_extracted' => count( $css_variable_definitions ),
			],
		];
		$creation_result = $this->widget_creator->create_widgets( $widgets, $css_processing_result, $options );
		if ( isset( $creation_result['post_id'] ) && $creation_result['post_id'] ) {
			$post_id = $creation_result['post_id'];
		}
		$elementor_data = $creation_result['element_data'] ?? [];
		return [
			'widgets_created' => $creation_result['widgets_created'] ?? 0,
			'widgets' => ! empty( $elementor_data ) ? $elementor_data : $widgets, // FIXED: Use processed widgets if available
			'global_classes_created' => count( $global_classes ), // Use actual count since widget_creator doesn't track this anymore
			'variables_created' => $creation_result['variables_created'] ?? 0,
			'post_id' => $creation_result['post_id'] ?? $post_id,
			'edit_url' => $creation_result['edit_url'] ?? admin_url( 'post.php?post=' . $post_id . '&action=elementor' ),
			'errors' => $creation_result['errors'] ?? [],
			'stats' => $creation_result['stats'] ?? [],
		];
	}
	private function extract_styles_by_source_from_widgets( array $widgets ): array {
		$id_styles = [];
		$inline_styles = [];
		$css_selector_styles = [];
		$element_styles = [];
		$reset_element_styles = [];
		foreach ( $widgets as $widget ) {
			if ( empty( $widget['resolved_styles'] ) ) {
				continue;
			}
			foreach ( $widget['resolved_styles'] as $property => $style_data ) {
				$source = $style_data['source'] ?? 'unknown';
				// Group styles by their source type for widget_creator compatibility
				switch ( $source ) {
					case 'id':
						$id_styles[] = $style_data;
						break;
					case 'inline':
						$inline_styles[] = $style_data;
						break;
					case 'css-selector':
					case 'class':
						$css_selector_styles[] = $style_data;
						break;
					case 'element':
						$element_styles[] = $style_data;
						break;
					case 'reset-element':
						$reset_element_styles[] = $style_data;
						break;
				}
			}
			// Process child widgets recursively
			if ( ! empty( $widget['children'] ) ) {
				$child_styles = $this->extract_styles_by_source_from_widgets( $widget['children'] );
				$id_styles = array_merge( $id_styles, $child_styles['id_styles'] );
				$inline_styles = array_merge( $inline_styles, $child_styles['inline_styles'] );
				$css_selector_styles = array_merge( $css_selector_styles, $child_styles['css_selector_styles'] );
				$element_styles = array_merge( $element_styles, $child_styles['element_styles'] );
				$reset_element_styles = array_merge( $reset_element_styles, $child_styles['reset_element_styles'] ?? [] );
			}
		}
		return [
			'id_styles' => $id_styles,
			'inline_styles' => $inline_styles,
			'css_selector_styles' => $css_selector_styles,
			'element_styles' => $element_styles,
			'reset_element_styles' => $reset_element_styles,
		];
	}
}
