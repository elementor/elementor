<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Output_Optimizer;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Unified_Widget_Conversion_Service {
	private $html_parser;
	private $widget_mapper;
	private $unified_css_processor;
	private $widget_creator;
	private $use_zero_defaults;
	private $css_parser;
	private $css_output_optimizer;
	private $property_converter;
	public function __construct(
		$html_parser,
		$widget_mapper,
		$unified_css_processor,
		$widget_creator,
		bool $use_zero_defaults = false
	) {
		$this->html_parser = $html_parser;
		$this->widget_mapper = $widget_mapper;
		$this->unified_css_processor = $unified_css_processor;
		$this->widget_creator = $widget_creator;
		$this->use_zero_defaults = $use_zero_defaults;
		$this->css_output_optimizer = new Css_Output_Optimizer();
		$this->property_converter = new Css_Property_Conversion_Service();
		$this->initialize_css_parser();
	}

	private function initialize_css_parser(): void {
		require_once __DIR__ . '/../../parsers/css-parser.php';
		$this->css_parser = new \Elementor\Modules\CssConverter\Parsers\CssParser();
	}
	public function convert_from_html( $html, $css_urls = [], $follow_imports = false, $options = [] ): array {
		$this->use_zero_defaults = true;
		$this->widget_creator = new Widget_Creator( $this->use_zero_defaults );
		$conversion_log = [
			'start_time' => microtime( true ),
			'input_size' => strlen( $html ),
			'css_urls_count' => count( $css_urls ),
			'options' => $options,
			'warnings' => [],
			'errors' => [],
		];
		try {
			$elements = $this->html_parser->parse( $html );
			$conversion_log['parsed_elements'] = count( $elements );

			// DEBUG: Log parsed element structure with class attributes
			$validation_issues = $this->html_parser->validate_html_structure( $elements, 20 );
			if ( ! empty( $validation_issues ) ) {
				$conversion_log['warnings'] = array_merge( $conversion_log['warnings'], $validation_issues );
			}
			$all_css = $this->extract_all_css( $html, $css_urls, $follow_imports, $elements );
			$conversion_log['css_size'] = strlen( $all_css );
			$mapped_widgets = $this->widget_mapper->map_elements( $elements );
			$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
			$conversion_log['mapping_stats'] = $mapping_stats;

			error_log( 'DEBUG: UNIFIED SERVICE - About to call unified_css_processor->process_css_and_widgets() with ' . strlen( $all_css ) . ' chars CSS and ' . count( $mapped_widgets ) . ' widgets' );
			error_log( 'DEBUG: UNIFIED SERVICE - unified_css_processor class: ' . get_class( $this->unified_css_processor ) );
			error_log( 'DEBUG: UNIFIED SERVICE - unified_css_processor methods: ' . implode( ', ', get_class_methods( $this->unified_css_processor ) ) );
			try {
				$unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets );
				error_log( 'DEBUG: UNIFIED SERVICE - unified_css_processor->process_css_and_widgets() completed successfully' );
			} catch ( \Exception $e ) {
				error_log( 'DEBUG: UNIFIED SERVICE - unified_css_processor->process_css_and_widgets() FAILED: ' . $e->getMessage() );
				error_log( 'DEBUG: UNIFIED SERVICE - Exception trace: ' . $e->getTraceAsString() );
				throw $e;
			}

			$resolved_widgets = $unified_processing_result['widgets'];
			$css_class_rules = $unified_processing_result['css_class_rules'] ?? [];
			$flattened_classes_count = $unified_processing_result['flattened_classes_count'] ?? 0;
			$conversion_log['css_processing'] = $unified_processing_result['stats'];
			$reset_styles_detected = $unified_processing_result['reset_styles_detected'] ?? false;
			$reset_styles_stats = $unified_processing_result['reset_styles_stats'] ?? [];
			$complex_reset_styles = $unified_processing_result['complex_reset_styles'] ?? [];
			$styled_widgets = $resolved_widgets;

			// ═══════════════════════════════════════════════════════════
			// PHASE 5: Extract processed data from unified processor ✅
			// ═══════════════════════════════════════════════════════════
			// All processing (global classes, duplicate detection, class mappings) is now complete
			$widgets_with_resolved_styles_for_global_classes = $resolved_widgets;
			$global_classes = $unified_processing_result['global_classes'] ?? [];
			$css_variable_definitions = $unified_processing_result['css_variable_definitions'] ?? [];
			$compound_classes = $unified_processing_result['compound_classes'] ?? [];
			$compound_classes_created = $unified_processing_result['compound_classes_created'] ?? 0;
			// Global classes are now handled by the unified service in process_global_classes_with_unified_service()
			$creation_result = $this->create_widgets_with_resolved_styles( $widgets_with_resolved_styles_for_global_classes, $options, $global_classes, $compound_classes, $compound_classes_created, $css_variable_definitions );
			$conversion_log['widget_creation'] = $creation_result['stats'];
			$widgets_created = $creation_result['widgets_created'] ?? 0;
			$widgets_count = is_array( $widgets_created ) ? count( $widgets_created ) : (int) $widgets_created;
			$conversion_log['end_time'] = microtime( true );
			$conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];
			$final_result = [
				'success' => true,
				'widgets_created' => $creation_result['widgets_created'],
				'global_classes_created' => $unified_processing_result['global_classes_created'] ?? 0,
				'global_classes' => $unified_processing_result['global_classes'] ?? [],
				'class_name_mappings' => $unified_processing_result['class_name_mappings'] ?? [],
				'debug_duplicate_detection' => $unified_processing_result['debug_duplicate_detection'] ?? null,
				'variables_created' => $creation_result['variables_created'],
				'compound_classes_created' => $creation_result['compound_classes_created'] ?? 0,
				'compound_classes' => $creation_result['compound_classes'] ?? [],
				'post_id' => $creation_result['post_id'],
				'edit_url' => $creation_result['edit_url'],
				'conversion_log' => $conversion_log,
				'warnings' => $conversion_log['warnings'],
				'errors' => $creation_result['errors'] ?? [],
				'flattened_classes_created' => $flattened_classes_count,
				'reset_styles_detected' => $reset_styles_detected,
				'element_selectors_processed' => $reset_styles_stats['reset_element_styles'] ?? 0,
				'direct_widget_styles_applied' => $reset_styles_stats['direct_applicable_styles'] ?? 0,
				'reset_css_file_generated' => ! empty( $complex_reset_styles ),
				'reset_styles_stats' => $reset_styles_stats,
				'complex_reset_styles_count' => count( $complex_reset_styles ),
			];
			return $final_result;
		} catch ( \Exception $e ) {
			$conversion_log['errors'][] = [
				'message' => esc_html( $e->getMessage() ),
				'trace' => esc_html( $e->getTraceAsString() ),
			];
			throw new Class_Conversion_Exception(
				'Widget conversion failed: ' . esc_html( $e->getMessage() ),
				0
			);
		}
	}
	private function extract_all_css( string $html, array $css_urls, bool $follow_imports, array &$elements ): string {
		$css_sources = [];

		preg_match_all( '/<style[^>]*>(.*?)<\/style>/is', $html, $matches );
		if ( ! empty( $matches[1] ) ) {
			foreach ( $matches[1] as $index => $css_content ) {
				$css_sources[] = [
					'type' => 'inline_style_tag',
					'source' => 'inline-style-' . $index,
					'content' => $css_content,
				];
			}
		}

		foreach ( $elements as &$element ) {
			if ( isset( $element['attributes']['style'] ) ) {
				$inline_style = $element['attributes']['style'];
				$selector = '.' . ( $element['generated_class'] ?? 'element-' . uniqid() );
				$css_sources[] = [
					'type' => 'inline_element_style',
					'source' => $selector,
					'content' => $selector . ' { ' . $inline_style . ' }',
				];
			}
		}

		foreach ( $css_urls as $css_url ) {
			$response = wp_remote_get( $css_url, [
				'timeout' => 30,
				'sslverify' => false,
			] );
			if ( ! is_wp_error( $response ) ) {
				$css_content = wp_remote_retrieve_body( $response );
				$css_sources[] = [
					'type' => 'external_file',
					'source' => $css_url,
					'content' => $css_content,
				];

				if ( $follow_imports && false !== strpos( $css_content, '@import' ) ) {
					preg_match_all( '/@import\s+(?:url\()?["\']?([^"\')]+)["\']?\)?;/i', $css_content, $import_matches );
					if ( ! empty( $import_matches[1] ) ) {
						foreach ( $import_matches[1] as $import_url ) {
							$absolute_import_url = $this->resolve_relative_url( $import_url, $css_url );
							$import_response = wp_remote_get( $absolute_import_url, [
								'timeout' => 30,
								'sslverify' => false,
							] );
							if ( ! is_wp_error( $import_response ) ) {
								$import_css = wp_remote_retrieve_body( $import_response );
								$css_sources[] = [
									'type' => 'imported_file',
									'source' => $absolute_import_url,
									'content' => $import_css,
								];
							}
						}
					}
				}
			}
		}

		return $this->parse_css_sources_safely( $css_sources );
	}

	private function parse_css_sources_safely( array $css_sources ): string {
		$successful_css = '';
		$failed_sources = [];
		$successful_count = 0;
		$failed_count = 0;

		foreach ( $css_sources as $source ) {
			$type = $source['type'];
			$source_name = $source['source'];
			$content = $source['content'];

			if ( empty( trim( $content ) ) ) {
				continue;
			}

			try {
				// Use raw CSS - no preprocessing (broken functionality removed)
				if ( null !== $this->css_parser ) {
					$test_parse = $this->css_parser->parse( $content );
				}

				$successful_css .= $content . "\n";
				++$successful_count;
			} catch ( \Exception $e ) {
				++$failed_count;
				$failed_sources[] = [
					'type' => $type,
					'source' => $source_name,
					'error' => $e->getMessage(),
					'size' => strlen( $content ),
				];
			}
		}

		return $successful_css;
	}









	private function resolve_relative_url( string $relative_url, string $base_url ): string {
		if ( 0 === strpos( $relative_url, 'http' ) ) {
			return $relative_url;
		}
		$base_parts = wp_parse_url( $base_url );
		$base_path = isset( $base_parts['path'] ) ? dirname( $base_parts['path'] ) : '';
		if ( 0 === strpos( $relative_url, '/' ) ) {
			return $base_parts['scheme'] . '://' . $base_parts['host'] . $relative_url;
		}
		return $base_parts['scheme'] . '://' . $base_parts['host'] . $base_path . '/' . $relative_url;
	}


	private function create_widgets_with_resolved_styles( array $widgets, array $options, array $global_classes, array $compound_classes = [], int $compound_classes_created = 0, array $css_variable_definitions = [] ): array {
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
				'compound_classes_created' => $compound_classes_created,
				'compound_classes' => $compound_classes,
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
			'global_classes_created' => count( $global_classes ), // Use actual count since widget_creator doesn't track this anymore
			'variables_created' => $creation_result['variables_created'] ?? 0,
			'compound_classes_created' => $compound_classes_created,
			'compound_classes' => $compound_classes,
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
