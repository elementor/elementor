<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Processor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS_To_Atomic_Bridge {

	private Css_Processor $css_processor;
	private CSS_To_Atomic_Props_Converter $props_converter;

	public function __construct() {
		$this->css_processor = new Css_Processor();
		$this->props_converter = new CSS_To_Atomic_Props_Converter();
	}

	public function apply_css_rules_to_widget_data( array $widget_data_array, string $css_content ): array {
		if ( empty( trim( $css_content ) ) ) {
			return $widget_data_array;
		}

		$processing_result = $this->css_processor->process_css( $css_content );

		if ( empty( $processing_result['css_rules'] ) ) {
			return $widget_data_array;
		}

		$id_styles = $this->extract_id_styles_map( $processing_result );
		$class_styles = $this->extract_class_styles_map( $processing_result );
		$element_styles = $this->extract_element_styles_map( $processing_result );

		return $this->apply_styles_to_widgets_recursively( 
			$widget_data_array, 
			$id_styles, 
			$class_styles, 
			$element_styles 
		);
	}

	private function extract_id_styles_map( array $processing_result ): array {
		$id_styles = [];

		foreach ( $processing_result['css_rules'] as $rule ) {
			if ( preg_match( '/^#([a-zA-Z][\w-]*)$/', trim( $rule['selector'] ), $matches ) ) {
				$id_name = $matches[1];
				
				if ( ! isset( $id_styles[ $id_name ] ) ) {
					$id_styles[ $id_name ] = [];
				}

				$id_styles[ $id_name ][] = [
					'property' => $rule['property'],
					'value' => $rule['value'],
					'important' => $rule['important'] ?? false,
				];
			}
		}

		return $id_styles;
	}

	private function extract_class_styles_map( array $processing_result ): array {
		$class_styles = [];

		foreach ( $processing_result['css_rules'] as $rule ) {
			if ( preg_match( '/^\.([a-zA-Z][\w-]*)$/', trim( $rule['selector'] ), $matches ) ) {
				$class_name = $matches[1];
				
				if ( ! isset( $class_styles[ $class_name ] ) ) {
					$class_styles[ $class_name ] = [];
				}

				$class_styles[ $class_name ][] = [
					'property' => $rule['property'],
					'value' => $rule['value'],
					'important' => $rule['important'] ?? false,
				];
			}
		}

		return $class_styles;
	}

	private function extract_element_styles_map( array $processing_result ): array {
		$element_styles = [];

		foreach ( $processing_result['css_rules'] as $rule ) {
			$selector = trim( $rule['selector'] );
			
			if ( preg_match( '/^(h[1-6]|p|div|span|a|button|img|section|article|header|footer|main|aside|nav)$/i', $selector, $matches ) ) {
				$tag_name = strtolower( $matches[1] );
				
				if ( ! isset( $element_styles[ $tag_name ] ) ) {
					$element_styles[ $tag_name ] = [];
				}

				$element_styles[ $tag_name ][] = [
					'property' => $rule['property'],
					'value' => $rule['value'],
					'important' => $rule['important'] ?? false,
				];
			}
		}

		return $element_styles;
	}

	private function apply_styles_to_widgets_recursively( 
		array $widget_data_array, 
		array $id_styles, 
		array $class_styles, 
		array $element_styles 
	): array {
		foreach ( $widget_data_array as &$widget_data ) {
			$widget_data = $this->apply_styles_to_single_widget(
				$widget_data,
				$id_styles,
				$class_styles,
				$element_styles
			);

			if ( ! empty( $widget_data['children'] ) ) {
				$widget_data['children'] = $this->apply_styles_to_widgets_recursively(
					$widget_data['children'],
					$id_styles,
					$class_styles,
					$element_styles
				);
			}
		}

		return $widget_data_array;
	}

	private function apply_styles_to_single_widget( 
		array $widget_data, 
		array $id_styles, 
		array $class_styles, 
		array $element_styles 
	): array {
		$css_properties = [];

		$css_properties = $this->apply_element_styles( $widget_data, $element_styles, $css_properties );
		$css_properties = $this->apply_class_styles( $widget_data, $class_styles, $css_properties );
		$css_properties = $this->apply_id_styles( $widget_data, $id_styles, $css_properties );

		if ( ! empty( $css_properties ) ) {
			$atomic_props = $this->convert_css_properties_to_atomic_props( $css_properties );
			
			$widget_data['atomic_props'] = array_merge(
				$widget_data['atomic_props'] ?? [],
				$atomic_props
			);
			
			error_log( 'CSS_To_Atomic_Bridge: Added ' . count( $atomic_props ) . ' atomic props to widget' );
		}

		return $widget_data;
	}

	private function apply_element_styles( array $widget_data, array $element_styles, array $css_properties ): array {
		$tag = $widget_data['tag'] ?? null;

		if ( $tag && isset( $element_styles[ $tag ] ) ) {
			foreach ( $element_styles[ $tag ] as $style ) {
				$key = $style['property'];
				if ( ! isset( $css_properties[ $key ] ) || ! $css_properties[ $key ]['important'] ) {
					$css_properties[ $key ] = $style;
				}
			}
		}

		return $css_properties;
	}

	private function apply_class_styles( array $widget_data, array $class_styles, array $css_properties ): array {
		$class_attr = $widget_data['attributes']['class'] ?? null;

		if ( $class_attr ) {
			$classes = array_filter( array_map( 'trim', explode( ' ', $class_attr ) ) );
			
			foreach ( $classes as $class_name ) {
				if ( isset( $class_styles[ $class_name ] ) ) {
					foreach ( $class_styles[ $class_name ] as $style ) {
						$key = $style['property'];
						if ( ! isset( $css_properties[ $key ] ) || ( ! $css_properties[ $key ]['important'] && ! $style['important'] ) ) {
							$css_properties[ $key ] = $style;
						}
					}
				}
			}
		}

		return $css_properties;
	}

	private function apply_id_styles( array $widget_data, array $id_styles, array $css_properties ): array {
		$id_attr = $widget_data['attributes']['id'] ?? null;

		if ( $id_attr && isset( $id_styles[ $id_attr ] ) ) {
			foreach ( $id_styles[ $id_attr ] as $style ) {
				$key = $style['property'];
				$css_properties[ $key ] = $style;
			}
		}

		return $css_properties;
	}

	private function convert_css_properties_to_atomic_props( array $css_properties ): array {
		$atomic_props = [];

		foreach ( $css_properties as $property => $style ) {
			$atomic_prop = $this->props_converter->convert_css_to_atomic_prop( 
				$property, 
				$style['value'] 
			);

			if ( $atomic_prop ) {
				$atomic_props[ $property ] = $atomic_prop;
			}
		}

		return $atomic_props;
	}

	public function get_css_processor(): Css_Processor {
		return $this->css_processor;
	}

	public function get_props_converter(): CSS_To_Atomic_Props_Converter {
		return $this->props_converter;
	}
}

