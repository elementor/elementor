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

		// Initialize logging
		$conversion_log = $this->logger->start_conversion_log( $html, $css_urls );
		$this->logger->set_options( $options );
		try {
			$elements = $this->html_parser->parse( $html );

			// Log parsing and validation stats
			$validation_issues = $this->html_parser->validate_html_structure( $elements, 20 );
			$this->logger->add_parsing_stats( $elements, $validation_issues );

			// SIMPLIFIED APPROACH: Always convert full HTML tree
			// This preserves all context for CSS selector matching
			$mapped_widgets = $this->widget_mapper->map_elements( $elements );
			
			$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
			$this->logger->add_mapping_stats( $mapping_stats );

			$all_css = $this->unified_css_processor->extract_and_process_css_from_html_and_urls( $html, $css_urls, $follow_imports, $elements );
			$this->logger->add_css_size( strlen( $all_css ) );
			error_log( 'CSS_CONVERTER_DEBUG: Extracted CSS length: ' . strlen( $all_css ) );
			error_log( 'CSS_CONVERTER_DEBUG: Mapped widgets count before CSS processing: ' . count( $mapped_widgets ) );

		try {
			$unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets, $options );
			error_log( 'CSS_CONVERTER_DEBUG: CSS processing completed' );
			error_log( 'CSS_CONVERTER_DEBUG: Processed widgets count: ' . count( $unified_processing_result['widgets'] ?? [] ) );
			error_log( 'CSS_CONVERTER_DEBUG: Processing stats: ' . print_r( $unified_processing_result['stats'] ?? [], true ) );
		} catch ( \Exception $e ) {
			error_log( 'CSS_CONVERTER_DEBUG: CSS processing error: ' . $e->getMessage() );
			throw $e;
		}

		$resolved_widgets = $unified_processing_result['widgets'];
		$global_classes = $unified_processing_result['global_classes'] ?? [];
		$css_variable_definitions = $unified_processing_result['css_variable_definitions'] ?? [];
		$body_styles = $unified_processing_result['body_styles'] ?? [];
		error_log( 'CSS_CONVERTER_DEBUG: Resolved widgets count: ' . count( $resolved_widgets ) );
		error_log( 'CSS_CONVERTER_DEBUG: Global classes count: ' . count( $global_classes ) );

		$conversion_selector = $options['conversion_selector'] ?? null;
		if ( ! empty( $conversion_selector ) ) {
			error_log( 'CSS_CONVERTER_DEBUG: Filtering widgets with selector: ' . $conversion_selector );
			$output_widgets = $this->filter_widgets_for_output( $resolved_widgets, $conversion_selector );
			error_log( 'CSS_CONVERTER_DEBUG: Filtered widgets count: ' . count( $output_widgets ) );
		} else {
			$output_widgets = $resolved_widgets;
		}

		error_log( 'CSS_CONVERTER_DEBUG: Creating widgets with resolved styles' );
		$creation_result = $this->create_widgets_with_resolved_styles( $output_widgets, $options, $global_classes, $css_variable_definitions, $body_styles );
		$final_widgets = $creation_result['widgets'] ?? [];
		error_log( 'CSS_CONVERTER_DEBUG: Final widgets created: ' . count( $final_widgets ) );
		error_log( 'CSS_CONVERTER_DEBUG: Creation stats: ' . print_r( $creation_result['stats'] ?? [], true ) );

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

	private function filter_widgets_for_output( array $widgets, string $selector ): array {
		$class_name = ltrim( $selector, '.' );
		$target_widgets = [];

		$this->find_widgets_matching_class_recursively( $widgets, $class_name, $target_widgets );

		if ( empty( $target_widgets ) ) {
			return $widgets;
		}

		return $target_widgets;
	}

	private function find_widgets_matching_class_recursively( array $widgets, string $class_name, array &$target_widgets ): void {
		foreach ( $widgets as $widget ) {
			$widget_classes = $widget['attributes']['class'] ?? '';
			
			if ( strpos( $widget_classes, $class_name ) !== false ) {
				$target_widgets[] = $widget;
			}

			if ( ! empty( $widget['children'] ) ) {
				$this->find_widgets_matching_class_recursively( $widget['children'], $class_name, $target_widgets );
			}
		}
	}













	private function create_widgets_with_resolved_styles( array $widgets, array $options, array $global_classes, array $css_variable_definitions = [], array $body_styles = [] ): array {
		$post_id = $options['postId'] ?? null;
		$post_type = $options['postType'] ?? 'page';
		if ( null === $post_id ) {
			$post_id = wp_insert_post( [
				'post_title' => 'Elementor Widget Conversion - ' . gmdate( 'Y-m-d H:i:s' ),
				'post_status' => 'publish',
				'post_type' => $post_type,
				'meta_input' => [
					'_wp_page_template' => 'elementor_canvas',
					'_elementor_css_converter_post' => true,
				],
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
		update_post_meta( $post_id, '_wp_page_template', 'elementor_canvas' );
		update_post_meta( $post_id, '_elementor_css_converter_post', true );
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

		if ( ! empty( $body_styles ) && $post_id ) {
			try {
				$this->save_page_settings( $post_id, $body_styles );
			} catch ( \Exception $e ) {
				error_log( 'BODY_STYLES_SAVE: Exception in save_page_settings: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString() );
			}
		}
		
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
	private function save_page_settings( int $post_id, array $body_styles ): void {
		if ( empty( $body_styles ) ) {
			error_log( 'BODY_STYLES_SAVE: No body styles to save for post ' . $post_id );
			return;
		}

		error_log( 'BODY_STYLES_SAVE: Saving body styles for post ' . $post_id . ': ' . print_r( $body_styles, true ) );

		if ( ! class_exists( '\Elementor\Plugin' ) ) {
			error_log( 'BODY_STYLES_SAVE: Elementor Plugin class not found' );
			return;
		}

		if ( ! isset( \Elementor\Plugin::$instance ) || ! \Elementor\Plugin::$instance ) {
			error_log( 'BODY_STYLES_SAVE: Elementor Plugin instance not available' );
			return;
		}

		$page_settings_manager = \Elementor\Core\Settings\Manager::get_settings_managers( 'page' );
		if ( ! $page_settings_manager ) {
			error_log( 'BODY_STYLES_SAVE: Page settings manager not found' );
			return;
		}

		$existing_settings = get_post_meta( $post_id, '_elementor_page_settings', true );
		if ( ! is_array( $existing_settings ) ) {
			$existing_settings = [];
		}

		error_log( 'BODY_STYLES_SAVE: Existing settings: ' . print_r( $existing_settings, true ) );

		$merged_settings = array_merge( $existing_settings, $body_styles );
		error_log( 'BODY_STYLES_SAVE: Merged settings: ' . print_r( $merged_settings, true ) );

		try {
			if ( ! empty( $merged_settings ) ) {
				update_metadata( 'post', $post_id, '_elementor_page_settings', wp_slash( $merged_settings ) );
				error_log( 'BODY_STYLES_SAVE: Settings saved successfully for post ' . $post_id );
			} else {
				delete_metadata( 'post', $post_id, '_elementor_page_settings' );
				error_log( 'BODY_STYLES_SAVE: Settings deleted for post ' . $post_id );
			}
		} catch ( \Exception $e ) {
			error_log( 'BODY_STYLES_SAVE: Error saving settings: ' . $e->getMessage() . ' | Trace: ' . $e->getTraceAsString() );
			return;
		}

		error_log( 'BODY_STYLES_SAVE: CSS files will be generated automatically when the page is loaded in Elementor editor' );
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
