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

			// ═══════════════════════════════════════════════════════════
			// PHASE 5: Process Nested/Flattened Classes ✅
			// ═══════════════════════════════════════════════════════════
			// All nested selectors have been flattened and compound classes created
			// Flattening results and compound results are now available

			// ═══════════════════════════════════════════════════════════
			// PHASE 6: Apply ALL Resolved Classes to Widgets ✅
			// ═══════════════════════════════════════════════════════════
			$widgets_with_applied_classes = $this->apply_all_resolved_classes_to_widgets(
				$resolved_widgets,
				$unified_processing_result
			);

			$widgets_with_resolved_styles_for_global_classes = $widgets_with_applied_classes;
			$global_classes = $this->process_global_classes_with_unified_service( $css_class_rules );
			$css_variable_definitions = $unified_processing_result['css_variable_definitions'] ?? [];
			$flattened_classes = $unified_processing_result['flattened_classes'] ?? [];

			if ( ! empty( $flattened_classes ) ) {
				$filtered_flattened_classes = [];

				foreach ( $flattened_classes as $class_id => $class_data ) {
					$original_selector = $class_data['css_converter_original_selector'] ?? '';

					if ( $this->is_core_elementor_flattened_selector( $original_selector ) ) {
						continue;
					}

					if ( ! $this->has_elements_with_flattened_class( $widgets_with_applied_classes, $class_id ) ) {
						continue;
					}

					$filtered_flattened_classes[ $class_id ] = $class_data;
				}

				$global_classes = array_merge( $global_classes, $filtered_flattened_classes );
			}
			$compound_classes = $unified_processing_result['compound_classes'] ?? [];
			$compound_classes_created = $unified_processing_result['compound_classes_created'] ?? 0;
			if ( ! empty( $global_classes ) ) {
				$this->store_global_classes_in_kit( $global_classes, $options );
			}
			$creation_result = $this->create_widgets_with_resolved_styles( $widgets_with_resolved_styles_for_global_classes, $options, $global_classes, $compound_classes, $compound_classes_created, $css_variable_definitions );
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
				$cleaned_css = $this->clean_css_for_parser( $content );

				if ( null !== $this->css_parser ) {
					$test_parse = $this->css_parser->parse( $cleaned_css );
				}

				$successful_css .= $cleaned_css . "\n";
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

	private function clean_css_for_parser( string $css ): string {
		if ( empty( $css ) ) {
			return $css;
		}

		$css = preg_replace( '/\/\*.*?\*\//s', '', $css );

		// FILTER: Remove media queries BEFORE parsing (desktop-only CSS)
		$css = $this->filter_out_media_queries( $css );

		$css = $this->replace_calc_expressions( $css );

		$css = $this->add_newlines_to_minified_css( $css );

		$css = $this->fix_broken_property_values( $css );

		$lines = explode( "\n", $css );
		$clean_lines = [];
		$brace_count = 0;

		foreach ( $lines as $line ) {
			$line = trim( $line );

			if ( empty( $line ) ) {
				continue;
			}

			if ( false !== strpos( $line, 'calc' ) ) {
				$line = preg_replace( '/calc\s*\([^)]*\)/', '100%', $line );
				$line = preg_replace( '/calc\s*\([^)]*\)/', '100%', $line );
			}

			$brace_count += substr_count( $line, '{' );
			$brace_count -= substr_count( $line, '}' );

			$brace_pos = strpos( $line, '{' );
			if ( false !== $brace_pos ) {
				$property_part = substr( $line, $brace_pos );
				$open_parens = substr_count( $property_part, '(' );
				$close_parens = substr_count( $property_part, ')' );

				if ( $open_parens !== $close_parens ) {
					$brace_count -= substr_count( $line, '{' );
					$brace_count += substr_count( $line, '}' );
					continue;
				}
			}

			$clean_lines[] = $line;
		}

		while ( 0 < $brace_count ) {
			$clean_lines[] = '}';
			--$brace_count;
		}

		return implode( "\n", $clean_lines );
	}

	private function filter_out_media_queries( string $css ): string {
		// Remove all @media blocks from CSS to focus on desktop-only styles
		// Handle both formatted and minified CSS

		// Method 1: Use regex to remove @media blocks (handles minified CSS)
		$original_length = strlen( $css );

		// Remove @media blocks using regex (handles nested braces correctly)
		$css = preg_replace_callback(
			'/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/s',
			function() {
				return '';
			},
			$css
		);

		// Handle nested media queries (up to 3 levels deep)
		for ( $i = 0; $i < 3; $i++ ) {
			$css = preg_replace_callback(
				'/@media[^{]*\{(?:[^{}]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\})*[^{}]*\}/s',
				function() {
					return '';
				},
				$css
			);
		}

		$filtered_length = strlen( $css );
		$bytes_removed = $original_length - $filtered_length;

		$percentage = $original_length > 0 ? round( ( $bytes_removed / $original_length ) * 100, 1 ) : 0;

		// Method 2: Line-by-line filtering for any remaining @media (fallback)
		$filtered_css = '';
		$lines = explode( "\n", $css );
		$inside_media_query = false;
		$media_brace_count = 0;
		$filtered_count = 0;
		$total_media_blocks = 0;

		foreach ( $lines as $line_num => $line ) {
			$trimmed = trim( $line );

			if ( preg_match( '/@media\s+/', $trimmed ) ) {
				$inside_media_query = true;
				$media_brace_count = 0;
				++$total_media_blocks;
				continue;
			}

			// If we're inside a media query, track braces
			if ( $inside_media_query ) {
				$media_brace_count += substr_count( $line, '{' );
				$media_brace_count -= substr_count( $line, '}' );

				if ( $media_brace_count <= 0 ) {
					$inside_media_query = false;
					++$filtered_count;
				}
				continue;
			}

			// Keep non-media query lines
			$filtered_css .= $line . "\n";
		}

		return $filtered_css;
	}

	private function replace_calc_expressions( string $css ): string {
		for ( $i = 0; $i < 5; ++$i ) {
			$css = $this->preserve_elementor_variables( $css );
			$css = preg_replace( '/env\s*\([^()]*\)/', '0', $css );
			$css = preg_replace( '/min\s*\([^()]*\)/', '0', $css );
			$css = preg_replace( '/max\s*\([^()]*\)/', '100%', $css );
			$css = preg_replace( '/clamp\s*\([^()]*\)/', '50%', $css );
		}

		for ( $i = 0; $i < 5; ++$i ) {
			$css = preg_replace( '/calc\s*\([^()]*\)/', '100%', $css );
		}

		$css = preg_replace( '/--[^:]+:\s*[^;]*calc[^;]*;/', '', $css );
		$css = preg_replace( '/\*[a-zA-Z_-]+\s*:\s*[^;]+;/', '', $css );
		$css = preg_replace( '/\{\s*\}/', '', $css );

		$css = preg_replace( '/:\s*100%([^;}]+)/', ': 100%;', $css );

		$css = preg_replace( '/\s+/', ' ', $css );

		$css = str_replace( '%)}', '%; }', $css );
		$css = str_replace( '%).', '%; .', $css );
		$css = str_replace( '%)#', '%; #', $css );
		$css = $this->fix_broken_css_values( $css );

		return $css;
	}

	private function preserve_elementor_variables( string $css ): string {
		$css = preg_replace_callback(
			'/var\s*\([^()]*\)/',
			function( $matches ) {
				$var_call = $matches[0];

				if ( preg_match( '/var\s*\(\s*(--[^,)]+)/', $var_call, $var_matches ) ) {
					$var_name = trim( $var_matches[1] );

					if ( $this->should_preserve_css_variable( $var_name ) ) {
						return $var_call;
					}
				}

				return ' 0';
			},
			$css
		);

		return $css;
	}

	private function should_preserve_css_variable( string $var_name ): bool {
		// Always preserve Elementor global variables
		if ( false !== strpos( $var_name, '--e-global-' ) ) {
			return true;
		}

		if ( false !== strpos( $var_name, '--elementor-' ) ) {
			return true;
		}

		// Preserve Elementor theme variables
		if ( false !== strpos( $var_name, '--e-theme-' ) ) {
			return true;
		}

		return false;
	}

	private function fix_broken_css_values( string $css ): string {
		// Fix broken font-size values like "15.rem" -> "15rem"
		$css = preg_replace( '/(\d+)\.rem\b/', '$1rem', $css );

		// Fix broken spacing around var() like "0var(" -> "0 var("
		$css = preg_replace( '/(\d+)var\(/', '$1 var(', $css );

		// Convert background: none to background: transparent
		$css = preg_replace( '/background:\s*none\s*;/', 'background: transparent;', $css );
		$css = preg_replace( '/background-color:\s*none\s*;/', 'background-color: transparent;', $css );

		// Fix other common broken values
		$css = preg_replace( '/(\d+)\.px\b/', '$1px', $css ); // Fix "15.px" -> "15px"
		$css = preg_replace( '/(\d+)\.em\b/', '$1em', $css ); // Fix "1.5.em" -> "1.5em"
		$css = preg_replace( '/(\d+)\.%\b/', '$1%', $css );   // Fix "100.%" -> "100%"

		return $css;
	}

	private function fix_broken_property_values( string $css ): string {
		$css = str_replace( "\r\n", "\n", $css );
		$css = str_replace( "\r", "\n", $css );

		$css = preg_replace( '/:\s*([^;{}\n]+)\n+\s*;/', ': $1;', $css );

		$css = preg_replace( '/:\s*([^;{}\n]+)\n+\s*([^;{}\n]+);/', ': $1 $2;', $css );

		return $css;
	}

	private function add_newlines_to_minified_css( string $css ): string {
		$css = str_replace( ';}', ";\n}\n", $css );

		$css = preg_replace( '/\}([.#@a-zA-Z])/', "}\n$1", $css );

		$css = preg_replace( '/\}(\})/', "$1\n", $css );

		$css = preg_replace( '/([^}])\s*@media/', "$1\n@media", $css );

		$css = preg_replace( '/([^}])\s*@font-face/', "$1\n@font-face", $css );

		return $css;
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
	private function process_global_classes_with_unified_service( array $css_class_rules ): array {
		$provider = Global_Classes_Service_Provider::instance();

		if ( ! $provider->is_available() ) {
			return [];
		}

		$integration_service = $provider->get_integration_service();
		$result = $integration_service->process_css_rules( $css_class_rules );

		return [];
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
		return $this->property_converter->convert_property_to_v4_atomic( $property, $value );
	}
	private function parse_size_value( string $value ): array {
		$size = (int) filter_var( $value, FILTER_SANITIZE_NUMBER_INT );
		$unit = preg_replace( '/[0-9]/', '', $value );
		if ( empty( $unit ) ) {
			$unit = 'px';
		}
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


	private function has_elements_with_flattened_class( array $widgets, string $flattened_class_id ): bool {
		// Check if any widget has this flattened class applied
		foreach ( $widgets as $widget ) {
			if ( $this->widget_has_flattened_class( $widget, $flattened_class_id ) ) {
				return true;
			}
		}
		return false;
	}

	private function widget_has_flattened_class( array $widget, string $flattened_class_id ): bool {
		// Check this widget's classes
		$widget_classes = $this->extract_widget_classes_from_widget( $widget );
		if ( true === in_array( $flattened_class_id, $widget_classes, true ) ) {
			return true;
		}

		// Recursively check child widgets
		if ( ! empty( $widget['children'] ) && is_array( $widget['children'] ) ) {
			foreach ( $widget['children'] as $child ) {
				if ( $this->widget_has_flattened_class( $child, $flattened_class_id ) ) {
					return true;
				}
			}
		}

		return false;
	}

	private function extract_widget_classes_from_widget( array $widget ): array {
		$class_attribute = $widget['attributes']['class'] ?? '';
		if ( empty( $class_attribute ) ) {
			return [];
		}

		// Split class attribute by spaces and filter out empty values
		$classes = array_filter( explode( ' ', $class_attribute ), function( $class_item ) {
			return ! empty( trim( $class_item ) );
		});

		return array_map( 'trim', $classes );
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
			$is_preview = isset( $options['context'] ) && 'preview' === $options['context'];
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
			unset( $e );
		}
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
				'properties_converted' => $this->count_properties_in_global_classes( $global_classes ),
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

	private function apply_all_resolved_classes_to_widgets( array $widgets, array $unified_processing_result ): array {
		// Get the HTML class modifier that was initialized with all the flattening and compound data
		$html_class_modifier = $unified_processing_result['html_class_modifier'] ?? null;

		if ( null === $html_class_modifier ) {
			return $widgets;
		}

		$widgets_with_applied_classes = $this->apply_html_class_modifications_to_widgets( $widgets, $html_class_modifier );

		return $widgets_with_applied_classes;
	}

	private function apply_html_class_modifications_to_widgets( array $widgets, $html_class_modifier ): array {
		$modified_widgets = [];

		foreach ( $widgets as $widget ) {
			$modified_widget = $this->apply_html_class_modifications_recursively( $widget, $html_class_modifier );
			$modified_widgets[] = $modified_widget;
		}

		return $modified_widgets;
	}

	private function apply_html_class_modifications_recursively( array $widget, $html_class_modifier ): array {
		$modified_widget = $html_class_modifier->modify_element_classes( $widget );

		if ( ! empty( $modified_widget['children'] ) && is_array( $modified_widget['children'] ) ) {
			$modified_children = [];
			foreach ( $modified_widget['children'] as $child ) {
				$modified_children[] = $this->apply_html_class_modifications_recursively( $child, $html_class_modifier );
			}
			$modified_widget['children'] = $modified_children;
		}

		return $modified_widget;
	}

	private function is_core_elementor_flattened_selector( string $selector ): bool {
		// Skip core Elementor selectors to avoid conflicts
		$elementor_prefixes = [
			'.elementor-',
			'.e-con-',
			'.e-',
		];

		foreach ( $elementor_prefixes as $prefix ) {
			if ( strpos( $selector, $prefix ) === 0 ) {
				return true;
			}
		}

		return false;
	}
}
