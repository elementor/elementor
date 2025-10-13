<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;

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
		if ( isset( $options['useZeroDefaults'] ) ) {
			$this->use_zero_defaults = (bool) $options['useZeroDefaults'];
			$this->widget_creator = new Widget_Creator( $this->use_zero_defaults );
		}

		$conversion_log = [
			'start_time' => microtime( true ),
			'input_size' => strlen( $html ),
			'css_urls_count' => count( $css_urls ),
			'options' => array_merge( $options, [ 'useZeroDefaults' => $this->use_zero_defaults ] ),
			'warnings' => [],
			'errors' => [],
		];

		try {

			// Phase 1: Parse HTML structure (NO inline CSS conversion)
			$parsed_elements = $this->html_parser->parse_html( $html );
			$conversion_log['parsed_elements'] = count( $parsed_elements );

			// Phase 2: Map HTML elements to widgets (NO style processing)
			$mapped_widgets = $this->widget_mapper->map_elements_to_widgets( $parsed_elements );
			$conversion_log['mapped_widgets'] = count( $mapped_widgets );

			// Phase 3: Extract ALL CSS (from style tags, external files, NO inline conversion)
			$all_css = $this->extract_css_only( $html, $css_urls, $follow_imports );
			$conversion_log['css_size'] = strlen( $all_css );

			// Phase 4: UNIFIED processing - collect all styles, resolve conflicts
			$processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets );
			$resolved_widgets = $processing_result['widgets'];
			$conversion_log['css_processing'] = $processing_result['stats'];

			// Phase 5: Create Elementor widgets ONCE with resolved styles
			$elementor_widgets = [];
			$global_classes = [];

			foreach ( $resolved_widgets as $widget ) {
				$widget_result = $this->create_widget_with_resolved_styles( $widget );

				if ( $widget_result ) {
					$elementor_widgets[] = $widget_result['widget'];
					if ( ! empty( $widget_result['global_classes'] ) ) {
						$global_classes = array_merge( $global_classes, $widget_result['global_classes'] );
					}
				}
			}

			$conversion_log['widgets_created'] = count( $elementor_widgets );
			$conversion_log['global_classes_created'] = count( $global_classes );

			// Phase 6: Finalize
			$conversion_log['end_time'] = microtime( true );
			$conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];

			return [
				'success' => true,
				'widgets' => $elementor_widgets,
				'global_classes' => $global_classes,
				'widgets_created' => count( $elementor_widgets ),
				'conversion_log' => $conversion_log,
			];

		} catch ( \Exception $e ) {

			return [
				'success' => false,
				'error' => $e->getMessage(),
				'conversion_log' => $conversion_log,
			];
		}
	}

	private function extract_css_only( string $html, array $css_urls, bool $follow_imports ): string {
		$all_css = '';

		// Extract CSS from <style> tags only (NO inline style conversion)
		preg_match_all( '/<style[^>]*>(.*?)<\/style>/is', $html, $matches );
		foreach ( $matches[1] as $css_content ) {
			$all_css .= trim( $css_content ) . "\n";
		}

		// Extract CSS from external files
		if ( ! empty( $css_urls ) ) {
			// Use existing CSS fetching logic
			foreach ( $css_urls as $url ) {
				try {
					$css_content = file_get_contents( $url );
					if ( $css_content !== false ) {
						$all_css .= $css_content . "\n";
					}
				} catch ( \Exception $e ) {
				}
			}
		}

		return $all_css;
	}

	private function create_widget_with_resolved_styles( array $widget ): ?array {
		$widget_type = $widget['widget_type'] ?? 'unknown';
		$widget_classes = $widget['attributes']['class'] ?? '';
		$resolved_styles = $widget['resolved_styles'] ?? [];

		if ( empty( $resolved_styles ) ) {
		} else {

			// Log each resolved style in detail
			foreach ( $resolved_styles as $property => $style_data ) {
				$source = $style_data['source'] ?? 'unknown';
				$specificity = $style_data['specificity'] ?? 0;
				$value = $style_data['value'] ?? 'no-value';
				$converted = isset( $style_data['converted_property'] ) ? 'YES' : 'NO';
			}
		}

		try {
			// Convert resolved styles to the format expected by widget creator
			$applied_styles = $this->convert_resolved_styles_to_applied_format( $resolved_styles );

			if ( ! empty( $applied_styles['computed_styles'] ) ) {
			}

			// Create the widget using existing widget creator
			$elementor_widget = $this->widget_creator->create_widget(
				$widget_type,
				$widget,
				$applied_styles
			);

			if ( $elementor_widget ) {

				return [
					'widget' => $elementor_widget,
					'global_classes' => [], // Global classes handled differently in unified approach
				];
			} else {
			}
		} catch ( \Exception $e ) {
		}

		return null;
	}

	private function convert_resolved_styles_to_applied_format( array $resolved_styles ): array {
		// Convert the resolved styles back to the format expected by the existing widget creator
		$computed_styles = [];

		foreach ( $resolved_styles as $property => $winning_style ) {
			$computed_styles[ $property ] = [
				'property' => $winning_style['property'],
				'value' => $winning_style['value'],
				'specificity' => $winning_style['specificity'],
				'important' => $winning_style['important'],
				'source' => $winning_style['source'],
				'converted_property' => $winning_style['converted_property'],
			];
		}

		return [
			'computed_styles' => $computed_styles,
			'global_classes' => [], // No global classes in unified approach
			'element_styles' => [],
			'widget_styles' => [],
			'id_styles' => [],
			'direct_element_styles' => [],
		];
	}
}
