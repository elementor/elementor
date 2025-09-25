<?php

namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widgets_Orchestrator {
	private $atomic_widget_service;
	private $widget_json_generator;
	private $conversion_statistics;
	private $performance_metrics;

	public function __construct( 
		Atomic_Widget_Service $atomic_widget_service = null,
		Widget_JSON_Generator $widget_json_generator = null
	) {
		$this->atomic_widget_service = $atomic_widget_service ?: new Atomic_Widget_Service();
		$this->widget_json_generator = $widget_json_generator ?: new Widget_JSON_Generator( $this->atomic_widget_service );
		$this->reset_statistics();
	}

	public function convert_html_with_css_to_atomic_widgets( string $html, array $global_css_properties = [] ): array {
		$start_time = microtime( true );
		$this->reset_statistics();

		$parsed_elements = $this->parse_html_to_elements( $html );
		$atomic_widgets = [];

		foreach ( $parsed_elements as $element ) {
			$atomic_widget = $this->convert_element_to_atomic_widget( $element, $global_css_properties );
			if ( null !== $atomic_widget ) {
				$atomic_widgets[] = $atomic_widget;
				$this->increment_successful_conversions();
			} else {
				$this->increment_failed_conversions();
			}
		}

		$this->record_performance_metrics( microtime( true ) - $start_time, count( $parsed_elements ) );

		return [
			'widgets' => $atomic_widgets,
			'statistics' => $this->get_conversion_statistics(),
			'performance' => $this->get_performance_metrics()
		];
	}

	public function convert_css_properties_to_atomic_format( array $css_properties ): array {
		$atomic_properties = [];
		$conversion_stats = [
			'total_properties' => count( $css_properties ),
			'converted_properties' => 0,
			'unsupported_properties' => 0,
			'conversion_details' => []
		];

		foreach ( $css_properties as $css_property => $css_value ) {
			if ( Atomic_Prop_Mapper_Factory::can_convert_css_property( $css_property ) ) {
				$atomic_prop = Atomic_Prop_Mapper_Factory::convert_css_property_to_atomic_format( $css_property, $css_value );
				if ( null !== $atomic_prop ) {
					$atomic_properties[ $css_property ] = $atomic_prop;
					$conversion_stats['converted_properties']++;
					$conversion_stats['conversion_details'][ $css_property ] = [
						'status' => 'converted',
						'atomic_type' => $atomic_prop['$$type']
					];
				} else {
					$conversion_stats['unsupported_properties']++;
					$conversion_stats['conversion_details'][ $css_property ] = [
						'status' => 'conversion_failed',
						'reason' => 'Invalid CSS value'
					];
				}
			} else {
				$conversion_stats['unsupported_properties']++;
				$conversion_stats['conversion_details'][ $css_property ] = [
					'status' => 'unsupported',
					'reason' => 'No atomic prop mapper available'
				];
			}
		}

		return [
			'atomic_properties' => $atomic_properties,
			'conversion_statistics' => $conversion_stats
		];
	}

	public function create_atomic_widget_from_element_data( array $element_data ): ?array {
		$element_type = $element_data['tag'] ?? 'div';
		$text_content = $element_data['text'] ?? '';
		$css_properties = $element_data['css'] ?? [];
		$attributes = $element_data['attributes'] ?? [];

		switch ( $element_type ) {
			case 'h1':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'h6':
				return $this->widget_json_generator->create_heading_widget( $text_content, $css_properties );

			case 'p':
				return $this->widget_json_generator->create_paragraph_widget( $text_content, $css_properties );

			case 'a':
				$href = $attributes['href'] ?? '';
				return $this->widget_json_generator->create_button_widget( $text_content, $href, $css_properties );

			case 'button':
				return $this->widget_json_generator->create_button_widget( $text_content, '', $css_properties );

			case 'div':
			case 'section':
			case 'article':
			case 'main':
			default:
				$children = $element_data['children'] ?? [];
				$processed_children = $this->process_child_elements( $children );
				return $this->widget_json_generator->create_div_element( $processed_children, $css_properties );
		}
	}

	public function validate_atomic_widget_output( array $widget_data ): array {
		$validation_results = [
			'is_valid' => true,
			'errors' => [],
			'warnings' => [],
			'validated_properties' => []
		];

		if ( ! isset( $widget_data['widgetType'] ) && ! isset( $widget_data['elementType'] ) ) {
			$validation_results['is_valid'] = false;
			$validation_results['errors'][] = 'Missing widget or element type';
			return $validation_results;
		}

		if ( isset( $widget_data['settings'] ) ) {
			foreach ( $widget_data['settings'] as $setting_name => $setting_value ) {
				if ( is_array( $setting_value ) && isset( $setting_value['$$type'] ) ) {
					$is_valid = $this->atomic_widget_service->validate_prop_structure( 
						$setting_value['$$type'], 
						$setting_value['value'] 
					);
					
					if ( $is_valid ) {
						$validation_results['validated_properties'][ $setting_name ] = 'valid';
					} else {
						$validation_results['is_valid'] = false;
						$validation_results['errors'][] = "Invalid setting structure for {$setting_name}";
					}
				}
			}
		}

		if ( isset( $widget_data['props'] ) ) {
			foreach ( $widget_data['props'] as $prop_name => $prop_value ) {
				if ( is_array( $prop_value ) && isset( $prop_value['$$type'] ) ) {
					$is_valid = $this->atomic_widget_service->validate_prop_structure( 
						$prop_value['$$type'], 
						$prop_value['value'] 
					);
					
					if ( $is_valid ) {
						$validation_results['validated_properties'][ $prop_name ] = 'valid';
					} else {
						$validation_results['is_valid'] = false;
						$validation_results['errors'][] = "Invalid prop structure for {$prop_name}";
					}
				}
			}
		}

		return $validation_results;
	}

	public function get_system_capabilities(): array {
		$factory_stats = Atomic_Prop_Mapper_Factory::get_conversion_capability_statistics();
		$categories = Atomic_Prop_Mapper_Factory::get_css_property_categories_coverage();
		$supported_prop_types = $this->atomic_widget_service->get_supported_prop_types();

		return [
			'atomic_prop_mappers' => $factory_stats['total_atomic_prop_mappers'],
			'convertible_css_properties' => $factory_stats['total_convertible_css_properties'],
			'supported_atomic_prop_types' => count( $supported_prop_types ),
			'css_property_categories' => [
				'layout_and_positioning' => $categories['layout_css_properties_count'],
				'visual_appearance' => $categories['visual_css_properties_count'],
				'user_interaction' => $categories['interaction_css_properties_count'],
				'animations_and_transitions' => $categories['animation_css_properties_count']
			],
			'atomic_prop_types' => $supported_prop_types,
			'system_version' => '2.0.0',
			'integration_status' => 'complete'
		];
	}

	private function parse_html_to_elements( string $html ): array {
		$elements = [];
		
		if ( empty( trim( $html ) ) ) {
			return $elements;
		}

		$dom = new \DOMDocument();
		$dom->loadHTML( '<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		
		foreach ( $dom->childNodes as $node ) {
			if ( $node->nodeType === XML_ELEMENT_NODE ) {
				$element_data = $this->extract_element_data( $node );
				if ( null !== $element_data ) {
					$elements[] = $element_data;
				}
			}
		}

		return $elements;
	}

	private function extract_element_data( \DOMNode $node ): ?array {
		if ( $node->nodeType !== XML_ELEMENT_NODE ) {
			return null;
		}

		$element_data = [
			'tag' => strtolower( $node->nodeName ),
			'text' => '',
			'attributes' => [],
			'css' => [],
			'children' => []
		];

		if ( $node->hasAttributes() ) {
			foreach ( $node->attributes as $attribute ) {
				$element_data['attributes'][ $attribute->name ] = $attribute->value;
				
				if ( 'style' === $attribute->name ) {
					$element_data['css'] = $this->parse_inline_css( $attribute->value );
				}
			}
		}

		$text_content = '';
		foreach ( $node->childNodes as $child ) {
			if ( $child->nodeType === XML_TEXT_NODE ) {
				$text_content .= trim( $child->textContent );
			} elseif ( $child->nodeType === XML_ELEMENT_NODE ) {
				$child_data = $this->extract_element_data( $child );
				if ( null !== $child_data ) {
					$element_data['children'][] = $child_data;
				}
			}
		}

		$element_data['text'] = $text_content;

		return $element_data;
	}

	private function parse_inline_css( string $css_string ): array {
		$css_properties = [];
		$declarations = explode( ';', $css_string );

		foreach ( $declarations as $declaration ) {
			$declaration = trim( $declaration );
			if ( empty( $declaration ) ) {
				continue;
			}

			$colon_pos = strpos( $declaration, ':' );
			if ( false === $colon_pos ) {
				continue;
			}

			$property = trim( substr( $declaration, 0, $colon_pos ) );
			$value = trim( substr( $declaration, $colon_pos + 1 ) );

			if ( ! empty( $property ) && ! empty( $value ) ) {
				$css_properties[ $property ] = $value;
			}
		}

		return $css_properties;
	}

	private function convert_element_to_atomic_widget( array $element_data, array $global_css_properties ): ?array {
		$merged_css = array_merge( $global_css_properties, $element_data['css'] ?? [] );
		$element_data['css'] = $merged_css;

		return $this->create_atomic_widget_from_element_data( $element_data );
	}

	private function process_child_elements( array $children ): array {
		$processed_children = [];

		foreach ( $children as $child ) {
			$atomic_widget = $this->create_atomic_widget_from_element_data( $child );
			if ( null !== $atomic_widget ) {
				$processed_children[] = $atomic_widget;
			}
		}

		return $processed_children;
	}

	private function reset_statistics(): void {
		$this->conversion_statistics = [
			'total_elements' => 0,
			'successful_conversions' => 0,
			'failed_conversions' => 0,
			'conversion_rate' => 0.0
		];

		$this->performance_metrics = [
			'execution_time' => 0.0,
			'elements_per_second' => 0.0,
			'memory_usage' => 0
		];
	}

	private function increment_successful_conversions(): void {
		$this->conversion_statistics['successful_conversions']++;
		$this->update_conversion_rate();
	}

	private function increment_failed_conversions(): void {
		$this->conversion_statistics['failed_conversions']++;
		$this->update_conversion_rate();
	}

	private function update_conversion_rate(): void {
		$total = $this->conversion_statistics['successful_conversions'] + $this->conversion_statistics['failed_conversions'];
		if ( $total > 0 ) {
			$this->conversion_statistics['conversion_rate'] = 
				( $this->conversion_statistics['successful_conversions'] / $total ) * 100;
		}
	}

	private function record_performance_metrics( float $execution_time, int $total_elements ): void {
		$this->performance_metrics['execution_time'] = $execution_time;
		$this->performance_metrics['elements_per_second'] = $total_elements > 0 ? $total_elements / $execution_time : 0;
		$this->performance_metrics['memory_usage'] = memory_get_peak_usage( true );
	}

	private function get_conversion_statistics(): array {
		return $this->conversion_statistics;
	}

	private function get_performance_metrics(): array {
		return $this->performance_metrics;
	}
}
