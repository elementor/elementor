<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Unified_Widget_Conversion_Service {
	private $html_parser;
	private $widget_mapper;
	private $unified_css_processor;
	private $widget_creator;
	private $use_zero_defaults;

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
	}

	public function convert_from_html( $html, $css_urls = [], $follow_imports = false, $options = [] ): array {
		error_log( '🔥 MAX_DEBUG: Unified_Widget_Conversion_Service->convert_from_html called!' );
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

			$validation_issues = $this->html_parser->validate_html_structure( $elements, 20 );
			if ( ! empty( $validation_issues ) ) {
				$conversion_log['warnings'] = array_merge( $conversion_log['warnings'], $validation_issues );
			}

			$all_css = $this->extract_all_css( $html, $css_urls, $follow_imports, $elements );
			$conversion_log['css_size'] = strlen( $all_css );

			$mapped_widgets = $this->widget_mapper->map_elements( $elements );
			$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
			$conversion_log['mapping_stats'] = $mapping_stats;

			$unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets );

			$resolved_widgets = $unified_processing_result['widgets'];
			$css_class_rules = $unified_processing_result['css_class_rules'] ?? [];
			$flattened_classes_count = $unified_processing_result['flattened_classes_count'] ?? 0;
			$conversion_log['css_processing'] = $unified_processing_result['stats'];

			$reset_styles_detected = $unified_processing_result['reset_styles_detected'] ?? false;
			$reset_styles_stats = $unified_processing_result['reset_styles_stats'] ?? [];
			$complex_reset_styles = $unified_processing_result['complex_reset_styles'] ?? [];

			$styled_widgets = $resolved_widgets;
			$widgets_with_resolved_styles_for_global_classes = $resolved_widgets;

			$global_classes = $this->generate_global_classes_from_css_rules( $css_class_rules );

			$flattened_classes = $unified_processing_result['flattened_classes'] ?? [];
			if ( ! empty( $flattened_classes ) ) {
				$global_classes = array_merge( $global_classes, $flattened_classes );
			}

			$compound_classes = $unified_processing_result['compound_classes'] ?? [];
			$compound_classes_created = $unified_processing_result['compound_classes_created'] ?? 0;

			if ( ! empty( $global_classes ) ) {
				$this->store_global_classes_in_kit( $global_classes, $options );
			}

			$creation_result = $this->create_widgets_with_resolved_styles( $widgets_with_resolved_styles_for_global_classes, $options, $global_classes, $compound_classes, $compound_classes_created );
			$conversion_log['widget_creation'] = $creation_result['stats'];
			$widgets_created = $creation_result['widgets_created'] ?? 0;

			$widgets_count = is_array( $widgets_created ) ? count( $widgets_created ) : (int) $widgets_created;

			$conversion_log['end_time'] = microtime( true );
			$conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];

			$final_result = [
				'success' => true,
				'widgets_created' => $creation_result['widgets_created'],
				'global_classes_created' => $creation_result['global_classes_created'],
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
				'message' => $e->getMessage(),
				'trace' => $e->getTraceAsString(),
			];

			throw new Class_Conversion_Exception(
				'Widget conversion failed: ' . $e->getMessage(),
				0
			);
		}
	}

	private function extract_all_css( string $html, array $css_urls, bool $follow_imports, array &$elements ): string {
		$inline_css = '';
		preg_match_all( '/<style[^>]*>(.*?)<\/style>/is', $html, $matches );
		if ( ! empty( $matches[1] ) ) {
			foreach ( $matches[1] as $css_content ) {
				$inline_css .= $css_content . "\n";
			}
		}

		foreach ( $elements as &$element ) {
			if ( isset( $element['attributes']['style'] ) ) {
				$inline_style = $element['attributes']['style'];
				$selector = '.' . ( $element['generated_class'] ?? 'element-' . uniqid() );
				$inline_css .= $selector . ' { ' . $inline_style . ' }' . "\n";
			}
		}

		$external_css = '';
		foreach ( $css_urls as $css_url ) {
			$response = wp_remote_get( $css_url, [
				'timeout' => 30,
				'sslverify' => false,
			] );

			if ( ! is_wp_error( $response ) ) {
				$css_content = wp_remote_retrieve_body( $response );
				$external_css .= $css_content . "\n";

				if ( $follow_imports && strpos( $css_content, '@import' ) !== false ) {
					preg_match_all( '/@import\s+(?:url\()?["\']?([^"\')]+)["\']?\)?;/i', $css_content, $import_matches );
					if ( ! empty( $import_matches[1] ) ) {
						foreach ( $import_matches[1] as $import_url ) {
							$absolute_import_url = $this->resolve_relative_url( $import_url, $css_url );
							$import_response = wp_remote_get( $absolute_import_url, [
								'timeout' => 30,
								'sslverify' => false,
							] );

							if ( ! is_wp_error( $import_response ) ) {
								$external_css .= wp_remote_retrieve_body( $import_response ) . "\n";
							}
						}
					}
				}
			}
		}

		return $inline_css . $external_css;
	}

	private function resolve_relative_url( string $relative_url, string $base_url ): string {
		if ( strpos( $relative_url, 'http' ) === 0 ) {
			return $relative_url;
		}

		$base_parts = parse_url( $base_url );
		$base_path = isset( $base_parts['path'] ) ? dirname( $base_parts['path'] ) : '';

		if ( strpos( $relative_url, '/' ) === 0 ) {
			return $base_parts['scheme'] . '://' . $base_parts['host'] . $relative_url;
		}

		return $base_parts['scheme'] . '://' . $base_parts['host'] . $base_path . '/' . $relative_url;
	}

	private function generate_global_classes_from_css_rules( array $css_class_rules ): array {
		$global_classes = [];

		foreach ( $css_class_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];

			if ( empty( $selector ) || empty( $properties ) ) {
				continue;
			}

			if ( strpos( $selector, '.' ) !== 0 ) {
				continue;
			}

			$class_name = ltrim( $selector, '.' );

			$converted_properties = [];
			foreach ( $properties as $property_data ) {
				$property = $property_data['property'] ?? '';
				$value = $property_data['value'] ?? '';

				if ( ! empty( $property ) && ! empty( $value ) ) {
					$converted_properties[ $property ] = $value;
				}
			}

			if ( ! empty( $converted_properties ) ) {
				$global_classes[ $class_name ] = [
					'selector' => $selector,
					'properties' => $converted_properties,
					'source' => 'css-class-rule',
				];
			}
		}

		return $global_classes;
	}

	private function convert_css_properties_to_atomic_format( array $properties ): array {
		$atomic_props = [];

		foreach ( $properties as $property_data ) {
			// Handle both formats: simple array and property objects
			if ( is_array( $property_data ) && isset( $property_data['property'] ) ) {
				$property = $property_data['property'];
				$value = $property_data['value'];
			} else {
				// Legacy format: property => value
				$property = key( $properties );
				$value = current( $properties );
				next( $properties );
			}

			$atomic_prop = $this->convert_single_css_property_to_atomic_format( $property, $value );
			if ( $atomic_prop ) {
				$atomic_props[ $property ] = $atomic_prop;
			}
		}

		return $atomic_props;
	}

	private function convert_single_css_property_to_atomic_format( string $property, $value ) {
		switch ( $property ) {
			case 'color':
			case 'background-color':
				return Color_Prop_Type::make()->generate( $value );

			case 'font-size':
			case 'letter-spacing':
			case 'margin':
			case 'margin-bottom':
			case 'margin-top':
			case 'margin-left':
			case 'margin-right':
				$size_data = $this->parse_size_value( $value );
				return Size_Prop_Type::make()->generate( $size_data );

			case 'font-weight':
				return String_Prop_Type::make()->generate( (string) $value );

			case 'text-transform':
			case 'text-decoration':
			case 'font-style':
				return String_Prop_Type::make()->generate( $value );

			case 'text-shadow':
				return String_Prop_Type::make()->generate( $value );

			default:
				return String_Prop_Type::make()->generate( $value );
		}
	}

	private function parse_size_value( string $value ): array {
		$size = (int) filter_var( $value, FILTER_SANITIZE_NUMBER_INT );
		$unit = preg_replace( '/[0-9]/', '', $value ) ?: 'px';

		return [
			'size' => $size,
			'unit' => $unit,
		];
	}

	private function count_properties_in_global_classes( array $global_classes ): int {
		$total_properties = 0;

		foreach ( $global_classes as $class_data ) {
			$total_properties += count( $class_data['properties'] ?? [] );
		}

		return $total_properties;
	}

	private function store_global_classes_in_kit( array $global_classes, array $options ): void {
		if ( empty( $global_classes ) ) {
			return;
		}

		try {
			if ( ! defined( 'ELEMENTOR_VERSION' ) || ! \Elementor\Plugin::$instance ) {
				return;
			}

			if ( ! \Elementor\Plugin::$instance->kits_manager ) {
				return;
			}

			$active_kit = \Elementor\Plugin::$instance->kits_manager->get_active_kit();
			if ( ! $active_kit ) {
				return;
			}

			$repository = Global_Classes_Repository::make();

			$is_preview = isset( $options['context'] ) && $options['context'] === 'preview';
			if ( ! $is_preview ) {
				$is_preview = is_preview() || ( defined( 'ELEMENTOR_VERSION' ) && \Elementor\Plugin::$instance->editor->is_edit_mode() );
			}

			$context = $is_preview ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;
			$repository->context( $context );

			$existing = $repository->all();
			$existing_items = $existing->get_items()->all();
			$existing_order = $existing->get_order()->all();

			$formatted_global_classes = [];
			foreach ( $global_classes as $class_id => $class_data ) {
				$properties = $class_data['properties'] ?? [];

				$atomic_props = $this->convert_css_properties_to_atomic_format( $properties );

				$formatted_global_classes[ $class_id ] = [
					'id' => $class_id,
					'label' => $class_id,
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => $atomic_props,
							'custom_css' => null,
						],
					],
				];
			}

			$updated_items = array_merge( $existing_items, $formatted_global_classes );
			$updated_order = array_merge( $existing_order, array_keys( $formatted_global_classes ) );

			$updated_order = array_values( array_unique( $updated_order ) );

			$repository->put( $updated_items, $updated_order );

		} catch ( \Exception $e ) {
			// Silent fail - don't block widget creation
		}
	}

	private function create_widgets_with_resolved_styles( array $widgets, array $options, array $global_classes, array $compound_classes = [], int $compound_classes_created = 0 ): array {
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
			'widget_styles' => $extracted_styles['css_selector_styles'],
			'element_styles' => $extracted_styles['element_styles'],
			'id_styles' => $extracted_styles['id_styles'],
			'direct_widget_styles' => $extracted_styles['inline_styles'],
			'stats' => [
				'rules_processed' => count( $global_classes ),
				'properties_converted' => $this->count_properties_in_global_classes( $global_classes ),
				'global_classes_created' => count( $global_classes ),
			],
		];

		error_log( '🔥 MAX_DEBUG: About to call widget_creator->create_widgets with ' . count( $widgets ) . ' widgets' );
		$creation_result = $this->widget_creator->create_widgets( $widgets, $css_processing_result, $options );
		error_log( '🔥 MAX_DEBUG: widget_creator->create_widgets completed' );

		if ( isset( $creation_result['post_id'] ) && $creation_result['post_id'] ) {
			$post_id = $creation_result['post_id'];
		}

		$elementor_data = $creation_result['element_data'] ?? [];

		return [
			'widgets_created' => $creation_result['widgets_created'] ?? 0,
			'global_classes_created' => $creation_result['global_classes_created'] ?? count( $global_classes ),
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
				}
			}

			// Process child widgets recursively
			if ( ! empty( $widget['children'] ) ) {
				$child_styles = $this->extract_styles_by_source_from_widgets( $widget['children'] );
				$id_styles = array_merge( $id_styles, $child_styles['id_styles'] );
				$inline_styles = array_merge( $inline_styles, $child_styles['inline_styles'] );
				$css_selector_styles = array_merge( $css_selector_styles, $child_styles['css_selector_styles'] );
				$element_styles = array_merge( $element_styles, $child_styles['element_styles'] );
			}
		}

		return [
			'id_styles' => $id_styles,
			'inline_styles' => $inline_styles,
			'css_selector_styles' => $css_selector_styles,
			'element_styles' => $element_styles,
		];
	}
}
