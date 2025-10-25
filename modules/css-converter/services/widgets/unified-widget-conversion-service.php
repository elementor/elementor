<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;
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
		$this->property_converter = new Css_Property_Conversion_Service();
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
			$mapped_widgets = $this->widget_mapper->map_elements( $elements );
			$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
			$conversion_log['mapping_stats'] = $mapping_stats;

			// DELEGATE CSS extraction to unified processor (proper separation of concerns)
			$all_css = $this->unified_css_processor->extract_and_process_css_from_html_and_urls( $html, $css_urls, $follow_imports, $elements );
			$conversion_log['css_size'] = strlen( $all_css );

			try {
			$unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets, $options );
			} catch ( \Exception $e ) {
				throw $e;
			}

			$resolved_widgets = $unified_processing_result['widgets'];
			$css_class_rules = $unified_processing_result['css_class_rules'] ?? [];
			$css_class_modifiers = $unified_processing_result['css_class_modifiers'] ?? [];
			$flattened_classes_count = $this->count_modifiers_by_type( $css_class_modifiers, 'flattening' );
			$conversion_log['css_processing'] = $unified_processing_result['stats'];
			$reset_styles_detected = $unified_processing_result['reset_styles_detected'] ?? false;
			$reset_styles_stats = $unified_processing_result['reset_styles_stats'] ?? [];
			$complex_reset_styles = $unified_processing_result['complex_reset_styles'] ?? [];
			$styled_widgets = $resolved_widgets;

			// ═══════════════════════════════════════════════════════════
			// PHASE 5: Extract processed data from unified processor ✅
			// ═══════════════════════════════════════════════════════════
			// All processing (global classes, duplicate detection, class mappings, compound classes) is now complete
			$widgets_with_resolved_styles_for_global_classes = $resolved_widgets;
			$global_classes = $unified_processing_result['global_classes'] ?? [];
			$css_variable_definitions = $unified_processing_result['css_variable_definitions'] ?? [];
			// Compound classes are now handled entirely within the CSS processor
			$creation_result = $this->create_widgets_with_resolved_styles( $widgets_with_resolved_styles_for_global_classes, $options, $global_classes, $css_variable_definitions );
			$conversion_log['widget_creation'] = $creation_result['stats'];
			$widgets_created = $creation_result['widgets_created'] ?? 0;
			$widgets_count = is_array( $widgets_created ) ? count( $widgets_created ) : (int) $widgets_created;
			$conversion_log['end_time'] = microtime( true );
			$conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];
			$final_result = [
				'success' => true,
				'widgets_created' => $creation_result['widgets_created'],
				'widgets' => $creation_result['widgets'] ?? [], // Include widgets for tests
				'global_classes_created' => $unified_processing_result['global_classes_created'] ?? 0,
				'global_classes' => $unified_processing_result['global_classes'] ?? [],
				'class_name_mappings' => $unified_processing_result['class_name_mappings'] ?? [],
				'debug_duplicate_detection' => $unified_processing_result['debug_duplicate_detection'] ?? null,
				'variables_created' => $creation_result['variables_created'],
				'compound_classes_created' => $this->count_modifiers_by_type( $css_class_modifiers, 'compound' ),
				'compound_classes' => $unified_processing_result['compound_classes'] ?? [],
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
			'widgets' => $creation_result['widgets'] ?? $widgets, // Include actual widgets for tests
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

	private function count_modifiers_by_type( array $modifiers, string $type ): int {
		$count = 0;
		foreach ( $modifiers as $modifier ) {
			if ( ( $modifier['type'] ?? '' ) === $type ) {
				$count += count( $modifier['mappings'] ?? [] );
			}
		}
		return $count;
	}
}
