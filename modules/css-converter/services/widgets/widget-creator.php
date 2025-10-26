<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
use Elementor\Plugin;
use Elementor\Core\Base\Document;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Hierarchy_Processor;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Error_Handler;
use Elementor\Modules\CssConverter\Services\Widgets\Atomic_Widget_Data_Formatter;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory;
class Widget_Creator {
	private $creation_stats;
	private $hierarchy_processor;
	private $error_handler;
	private $current_widget_class_id;
	private $property_mapper_registry;
	private $current_css_processing_result;
	private $use_zero_defaults;
	private $current_widget_type;
	private $current_widget;
	private $current_unsupported_props = [];

	public function __construct( $use_zero_defaults = true ) {

		$this->use_zero_defaults = $use_zero_defaults;
		$this->initialize_creation_stats();
		$this->initialize_dependencies();
		$this->data_formatter = Atomic_Widget_Data_Formatter::make();
	}
	private function initialize_creation_stats() {
		$this->creation_stats = [
			'widgets_created' => 0,
			'widgets_failed' => 0,
			'global_classes_created' => 0,
			'variables_created' => 0,
			'errors' => [],
			'warnings' => [],
		];
	}
	private function initialize_dependencies() {
		$this->hierarchy_processor = new Widget_Hierarchy_Processor();
		$this->error_handler = new Widget_Error_Handler();
		$this->property_mapper_registry = Class_Property_Mapper_Factory::get_registry();

		if ( $this->use_zero_defaults ) {
			add_action( 'wp_head', [ $this, 'inject_base_styles_override_css' ], 999 );
			add_action( 'elementor/editor/wp_head', [ $this, 'inject_base_styles_override_css' ], 999 );
			add_action( 'elementor/preview/enqueue_styles', [ $this, 'inject_base_styles_override_css' ], 999 );

			add_action( 'wp_head', [ $this, 'inject_css_converter_specific_overrides' ], 1000 );
			add_action( 'elementor/editor/wp_head', [ $this, 'inject_css_converter_specific_overrides' ], 1000 );
			add_action( 'elementor/preview/enqueue_styles', [ $this, 'inject_css_converter_specific_overrides' ], 1000 );
		}
	}

	public function inject_base_styles_override_css() {

		$post_id = get_the_ID();
		if ( ! $post_id ) {
			return;
		}
		if ( is_string( $post_data ) ) {
			$post_data = json_decode( $post_data, true );
		}
	}

	private function page_has_css_converter_widgets( int $post_id ): bool {

		$post_data = get_post_meta( $post_id, '_elementor_data', true );
		if ( empty( $post_data ) ) {
			return false;
		}

		if ( is_string( $post_data ) ) {
			$post_data = json_decode( $post_data, true );
		}

		if ( ! is_array( $post_data ) ) {
			return false;
		}

		return $this->traverse_elements_for_css_converter_widgets( $post_data );
	}

	private function traverse_elements_for_css_converter_widgets( array $elements_data ): bool {
		foreach ( $elements_data as $element_data ) {
			if ( isset( $element_data['editor_settings']['css_converter_widget'] ) && $element_data['editor_settings']['css_converter_widget'] ) {
				return true;
			}

			if ( isset( $element_data['elements'] ) && is_array( $element_data['elements'] ) ) {
				if ( $this->traverse_elements_for_css_converter_widgets( $element_data['elements'] ) ) {
					return true;
				}
			}
		}
		return false;
	}
	private function is_css_converter_widget_element( array $element ): bool {
		return isset( $element['editor_settings']['css_converter_widget'] ) &&
				$element['editor_settings']['css_converter_widget'];
	}
	private function extract_widget_type_from_element( array $element ): ?string {
		return $element['widgetType'] ?? $element['elType'] ?? null;
	}
	private function cache_css_converter_widget_types( int $post_id, array $widget_types ): void {
		update_post_meta( $post_id, '_css_converter_widget_types', $widget_types );
	}

	private function create_widget_data_using_data_formatter( array $resolved_styles, array $widget, string $widget_id ): array {
		if ( $this->data_formatter ) {
			return $this->data_formatter->format_widget_data( $resolved_styles, $widget, $widget_id );
		}

		return [
			'settings' => [],
			'styles' => [],
		];
	}

	private function requires_link_to_button_conversion( string $widget_type, string $mapped_type ): bool {
		return 'e-link' === $widget_type && 'e-button' === $mapped_type;
	}

	private function merge_settings_without_style_merging( array $settings1, array $settings2 ): array {
		return array_merge( $settings1, $settings2 );
	}

	private function convert_styles_to_v4_format( array $styles, string $widget_type ): array {
		return $styles;
	}
	private function traverse_elements( array $elements, callable $callback ) {
		foreach ( $elements as $element ) {
			$callback( $element );
			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$this->traverse_elements( $element['elements'], $callback );
			}
		}
	}

	private function post_has_css_converter_widgets_of_type( int $post_id, string $element_type ): bool {

		$cache_key = '_css_converter_widget_types';
		$cached_types = get_post_meta( $post_id, $cache_key, true );

		if ( is_array( $cached_types ) ) {
			$has_type = in_array( $element_type, $cached_types, true );
			return $has_type;
		}

		$post_data = get_post_meta( $post_id, '_elementor_data', true );
		if ( empty( $post_data ) ) {
			update_post_meta( $post_id, $cache_key, [] );
			return false;
		}

		if ( is_string( $post_data ) ) {
			$post_data = json_decode( $post_data, true );
		}

		if ( ! is_array( $post_data ) ) {
			update_post_meta( $post_id, $cache_key, [] );
			return false;
		}

		$widget_types = [];
		$this->traverse_elements( $post_data, function( $element ) use ( &$widget_types ) {
			if ( isset( $element['editor_settings']['css_converter_widget'] ) && $element['editor_settings']['css_converter_widget'] ) {
				$widget_type = $element['widgetType'] ?? $element['elType'] ?? null;
				if ( $widget_type ) {
					$widget_types[] = $widget_type;
				}
			}
		} );

		$widget_types = array_unique( $widget_types );

		update_post_meta( $post_id, $cache_key, $widget_types );

		$has_type = in_array( $element_type, $widget_types, true );
		return $has_type;
	}


	public function create_widgets( $styled_widgets, $css_processing_result, $options = [] ) {
		$this->current_css_processing_result = $css_processing_result;
		$post_id = $options['postId'] ?? null;
		$post_type = $options['postType'] ?? 'page';
		try {
			if ( ! empty( $css_processing_result['css_variable_definitions'] ) ) {
				$this->process_css_variable_definitions( $css_processing_result['css_variable_definitions'] );
			}
			if ( ! empty( $css_processing_result['css_variables'] ) ) {
				$this->process_css_variables( $css_processing_result['css_variables'] );
			}
			$post_id = $this->ensure_post_exists( $post_id, $post_type );
			$document = $this->get_elementor_document( $post_id );
			$hierarchy_result = $this->hierarchy_processor->process_widget_hierarchy( $styled_widgets );
			$elementor_elements = $this->convert_widgets_to_elementor_format( $hierarchy_result['widgets'] );
			$this->save_to_document( $document, $elementor_elements );

			$this->clear_document_cache_for_css_converter_widgets( $post_id );

			$this->merge_hierarchy_stats( $hierarchy_result['stats'] );
			return [
				'success' => true,
				'post_id' => $post_id,
				'edit_url' => $this->get_edit_url( $post_id ),
				'widgets_created' => $this->creation_stats['widgets_created'],
				'global_classes_created' => $this->creation_stats['global_classes_created'],
				'variables_created' => $this->creation_stats['variables_created'],
				'stats' => $this->creation_stats,
				'hierarchy_stats' => $hierarchy_result['stats'],
				'hierarchy_errors' => $hierarchy_result['errors'],
				'error_report' => $this->error_handler->generate_error_report(),
			];
		} catch ( \Exception $e ) {
			$this->creation_stats['errors'][] = [
				'type' => 'widget_creation_failed',
				'message' => $e->getMessage(),
				'trace' => $e->getTraceAsString(),
			];
			throw $e;
		}
	}
	private function process_css_variables( $css_variables ) {
		try {
			foreach ( $css_variables as $variable ) {
				++$this->creation_stats['variables_created'];
			}
		} catch ( \Exception $e ) {
			$this->creation_stats['warnings'][] = [
				'type' => 'variable_processing_failed',
				'message' => $e->getMessage(),
			];
		}
	}

	private function process_css_variable_definitions( array $css_variable_definitions ) {
		try {
			if ( empty( $css_variable_definitions ) ) {
				return;
			}

			foreach ( $css_variable_definitions as $variable_name => $variable_data ) {
				++$this->creation_stats['variables_created'];
			}
		} catch ( \Exception $e ) {
			$this->creation_stats['warnings'][] = [
				'type' => 'css_variable_definitions_processing_failed',
				'message' => $e->getMessage(),
			];
		}
	}
	private function ensure_post_exists( $post_id, $post_type ) {
		if ( $post_id ) {
			$post = get_post( $post_id );
			if ( ! $post ) {
				throw new \Exception( 'Post with ID ' . esc_html( $post_id ) . ' not found' );
			}
			return $post_id;
		}
		$post_data = [
			'post_title' => 'Elementor Widget Conversion - ' . gmdate( 'Y-m-d H:i:s' ),
			'post_type' => $post_type,
			'post_status' => 'draft',
			'post_content' => '',
			'meta_input' => [
				'_elementor_edit_mode' => 'builder',
				'_elementor_template_type' => 'wp-post',
				'_elementor_version' => ELEMENTOR_VERSION,
			],
		];
		$new_post_id = wp_insert_post( $post_data );
		if ( is_wp_error( $new_post_id ) ) {
			throw new \Exception( 'Failed to create post: ' . esc_html( $new_post_id->get_error_message() ) );
		}
		return $new_post_id;
	}
	private function get_elementor_document( $post_id ) {
		if ( ! class_exists( 'Elementor\Plugin' ) ) {
			throw new \Exception( 'Elementor Plugin not available' );
		}
		$document = Plugin::$instance->documents->get( $post_id );
		if ( ! $document ) {
			throw new \Exception( 'Failed to get Elementor document for post ' . esc_html( $post_id ) );
		}
		return $document;
	}
	private function convert_widgets_to_elementor_format( $processed_widgets ) {
		$elementor_elements = [];
		foreach ( $processed_widgets as $widget ) {
			try {
				$elementor_widget = $this->convert_widget_to_elementor_format( $widget );
				$elementor_elements[] = $elementor_widget;
				++$this->creation_stats['widgets_created'];
			} catch ( \Exception $e ) {
				$fallback_widget = $this->handle_widget_creation_failure( $widget, $e );
				if ( $fallback_widget ) {
					$elementor_elements[] = $fallback_widget;
				}
			}
		}
		return $elementor_elements;
	}
	private function convert_widget_to_elementor_format( $widget ) {
		return $this->convert_widget_with_resolved_styles_to_elementor_format( $widget );
	}
	private function convert_widget_with_resolved_styles_to_elementor_format( $widget ) {
		$widget_type = $widget['widget_type'];
		$settings = $widget['settings'] ?? [];
		$resolved_styles = $widget['resolved_styles'] ?? [];
		$widget_id = wp_generate_uuid4();
		$mapped_type = $this->map_to_elementor_widget_type( $widget_type );

		$widget_class = $widget['attributes']['class'] ?? '';

		$formatted_widget_data = $this->create_widget_data_using_data_formatter( $resolved_styles, $widget, $widget_id );
		if ( $this->requires_link_to_button_conversion( $widget_type, $mapped_type ) ) {
			$settings = $this->convert_link_settings_to_button_format( $settings );
		}
		$final_settings = $this->merge_settings_without_style_merging( $settings, $formatted_widget_data['settings'] );

		$global_classes = $this->current_css_processing_result['global_classes'] ?? [];
		if ( ! empty( $global_classes ) ) {

			$widget_classes = $widget['attributes']['class'] ?? '';

			if ( ! empty( $widget_classes ) ) {
				$classes_array = explode( ' ', $widget_classes );
				$applicable_global_classes = [];

				foreach ( $classes_array as $class_name ) {
					$class_name = trim( $class_name );
					if ( isset( $global_classes[ $class_name ] ) ) {
						$applicable_global_classes[] = $class_name;
					}
				}

				if ( ! empty( $applicable_global_classes ) ) {
					$existing_classes = $final_settings['classes']['value'] ?? [];
					$merged_classes = array_merge( $existing_classes, $applicable_global_classes );

					$final_settings['classes'] = [
						'$$type' => 'classes',
						'value' => array_values( array_unique( $merged_classes ) ),
					];
				}
			}
		}
		if ( 'e-div-block' === $mapped_type ) {
			$elementor_widget = [
				'id' => $widget_id,
				'elType' => 'e-div-block',
				'settings' => $final_settings,
				'isInner' => false,
				'styles' => $formatted_widget_data['styles'],
				'editor_settings' => [
					'css_converter_widget' => true,
				],
				'version' => '0.0',
			];
		} else {
			$elementor_widget = [
				'id' => $widget_id,
				'elType' => 'widget',
				'widgetType' => $mapped_type,
				'settings' => $final_settings,
				'isInner' => false,
				'styles' => $this->convert_styles_to_v4_format( $formatted_widget_data['styles'], $widget_type ),
				'editor_settings' => [
					'disable_base_styles' => $this->use_zero_defaults,
					'css_converter_widget' => true,
				],
				'version' => '0.0',
			];
		}

		if ( ! empty( $widget['elements'] ) ) {
			$elementor_widget['elements'] = $this->convert_widgets_to_elementor_format( $widget['elements'] );
		} else {
			$elementor_widget['elements'] = [];
		}

		return $elementor_widget;
	}

	private function clear_document_cache_for_css_converter_widgets( $post_id ) {

		if ( ! $post_id ) {
			return;
		}

		$cache_deleted = delete_post_meta( $post_id, '_elementor_element_cache' );

		delete_post_meta( $post_id, '_elementor_css' );

		delete_post_meta( $post_id, '_elementor_atomic_cache_validity' );
	}

	private function map_to_elementor_widget_type( $widget_type ) {
		$mapping = [
			'e-heading' => 'e-heading',
			'e-paragraph' => 'e-paragraph',
			'e-div-block' => 'e-div-block',
			'e-flexbox' => 'e-flexbox',
			'e-link' => 'e-button',
			'e-button' => 'e-button',
			'e-image' => 'e-image',
		];
		$mapped_type = $mapping[ $widget_type ] ?? 'html';
		return $mapped_type;
	}
	private function convert_link_settings_to_button_format( $settings ) {
		$button_settings = $settings;

		if ( isset( $settings['url'] ) && ! empty( $settings['url'] ) && '#' !== $settings['url'] ) {
			$target = $settings['target'] ?? '_self';
			$is_target_blank = ( '_blank' === $target ) ? true : null;
			$button_settings['link'] = [
				'$$type' => 'link',
				'value' => [
					'destination' => [
						'$$type' => 'url',
						'value' => $settings['url'],
					],
					'isTargetBlank' => $is_target_blank,
				],
			];
			unset( $button_settings['url'] );
			unset( $button_settings['target'] );
		}

		return $button_settings;
	}
	private function apply_direct_element_styles_to_settings( $settings, $direct_element_styles ) {
		return $settings;
	}
	private function format_elementor_settings( $settings ) {
		$formatted_settings = [];
		foreach ( $settings as $key => $value ) {
			$formatted_settings[ $key ] = $this->format_elementor_value( $value );
		}
		return $formatted_settings;
	}
	private function format_elementor_value( $value ) {
		if ( is_string( $value ) ) {
			return [
				'$$type' => 'string',
				'value' => $value,
			];
		}
		if ( is_array( $value ) && isset( $value['$$type'] ) ) {
			return $value;
		}
		return $value;
	}
	private function map_css_property_to_elementor_setting( $css_property ) {
		return null;
	}
	private function convert_atomic_props_to_css_props( $atomic_props ) {
		$css_props = [];
		foreach ( $atomic_props as $property => $atomic_value ) {
			if ( is_array( $atomic_value ) && isset( $atomic_value['$$type'] ) ) {
				if ( 'dimensions' === $atomic_value['$$type'] ) {
					$dimensions = $atomic_value['value'] ?? [];
					$dimension_map = [
						'block-start' => $property . '-top',
						'inline-end' => $property . '-right',
						'block-end' => $property . '-bottom',
						'inline-start' => $property . '-left',
					];
					foreach ( $dimension_map as $atomic_key => $css_property ) {
						if ( isset( $dimensions[ $atomic_key ] ) ) {
							$size_value = $dimensions[ $atomic_key ];
							if ( is_array( $size_value ) && isset( $size_value['value'] ) ) {
								$size = $size_value['value']['size'] ?? 0;
								$unit = $size_value['value']['unit'] ?? 'px';
								$css_props[ $css_property ] = $size . $unit;
							}
						}
					}
				} else {
					$css_props[ $property ] = $atomic_value;
				}
			} else {
				$css_props[ $property ] = $atomic_value;
			}
		}
		return $css_props;
	}
	private function generate_unique_class_id() {
		$widget_id = substr( wp_generate_uuid4(), 0, 8 );
		$hash = substr( md5( microtime() . wp_rand() ), 0, 7 );
		return "e-{$widget_id}-{$hash}";
	}
	private function is_dimensions_prop_type( $property ): bool {
		return is_array( $property ) && isset( $property['$$type'] ) && 'dimensions' === $property['$$type'];
	}
	private function is_border_width_prop_type( $property ): bool {
		return is_array( $property ) && isset( $property['$$type'] ) && 'border-width' === $property['$$type'];
	}
	private function merge_dimensions_prop_types( array $existing, array $new ): array {
		if ( ! $this->is_dimensions_prop_type( $existing ) || ! $this->is_dimensions_prop_type( $new ) ) {
			return $new;
		}
		$merged_value = array_merge(
			$existing['value'] ?? [],
			$new['value'] ?? []
		);
		return [
			'$$type' => 'dimensions',
			'value' => $merged_value,
		];
	}
	private function merge_border_width_prop_types( array $existing, array $new ): array {
		if ( ! $this->is_border_width_prop_type( $existing ) || ! $this->is_border_width_prop_type( $new ) ) {
			return $new;
		}
		$merged_value = array_merge(
			$existing['value'] ?? [],
			$new['value'] ?? []
		);
		return [
			'$$type' => 'border-width',
			'value' => $merged_value,
		];
	}
	private function map_css_to_v4_props( $computed_styles ) {
		$v4_props = [];
		$unsupported_props = [];
		foreach ( $computed_styles as $property => $atomic_value ) {
			if ( is_array( $atomic_value ) && isset( $atomic_value['$$type'] ) ) {
				$target_property = $this->get_target_property_name( $property );
				if ( $this->atomic_widget_supports_property( $target_property ) ) {
					$v4_props[ $target_property ] = $atomic_value;
				} else {
					$unsupported_props[ $target_property ] = $atomic_value;
				}
			}
		}
		if ( ! empty( $unsupported_props ) ) {
			$this->current_unsupported_props = $unsupported_props;
		}
		return $v4_props;
	}
	private function get_target_property_name( string $property ): string {
		$mapper = $this->property_mapper_registry->resolve( $property );
		if ( $mapper && method_exists( $mapper, 'get_target_property_name' ) ) {
			$target = $mapper->get_target_property_name( $property );
			return $target;
		}
		return $property;
	}
	private function atomic_widget_supports_property( string $property ): bool {
		if ( empty( $this->current_widget_type ) ) {
			return false;
		}
		if ( 'e-div-block' === $this->current_widget_type || 'e-flexbox' === $this->current_widget_type || 'e-heading' === $this->current_widget_type || 'e-paragraph' === $this->current_widget_type ) {
			return true;
		}
		$atomic_widget_class = $this->get_atomic_widget_class( $this->current_widget_type );
		if ( ! $atomic_widget_class ) {
			return false;
		}
		$prop_schema = $this->get_atomic_widget_prop_schema( $atomic_widget_class );
		if ( empty( $prop_schema ) ) {
			return false;
		}
		$is_supported = array_key_exists( $property, $prop_schema );
		return $is_supported;
	}
	private function get_atomic_widget_class( string $widget_type ): ?string {
		$widget_class_map = [
			'e-paragraph' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph',
			'e-heading' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading',
			'e-button' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button',
			'e-div-block' => 'Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block',
		];
		return $widget_class_map[ $widget_type ] ?? null;
	}
	private function get_atomic_widget_prop_schema( string $atomic_widget_class ): array {
		if ( ! class_exists( $atomic_widget_class ) ) {
			return [];
		}
		try {
			$reflection = new \ReflectionClass( $atomic_widget_class );
			if ( $reflection->hasMethod( 'define_props_schema' ) ) {
				$method = $reflection->getMethod( 'define_props_schema' );
				$method->setAccessible( true );
				$instance = $reflection->newInstanceWithoutConstructor();
				return $method->invoke( $instance );
			}
		} catch ( \Exception $e ) {
			return [];
		}
		return [];
	}
	private function convert_css_property_to_v4( $property, $value ) {
		if ( is_array( $value ) && isset( $value['$$type'] ) ) {
			return [
				'property' => $property,
				'value' => $value,
			];
		}
		if ( ! is_string( $value ) ) {
			return null;
		}
		$mapper = $this->property_mapper_registry->resolve( $property, $value );
		if ( $mapper && method_exists( $mapper, 'map_to_v4_atomic' ) ) {
			$atomic_result = $mapper->map_to_v4_atomic( $property, $value );
			if ( $atomic_result ) {
				return [
					'property' => $property,
					'value' => $atomic_result,
				];
			}
		}
		return null;
	}
	private function process_widget_children( $children ) {
		$elementor_children = [];
		foreach ( $children as $child ) {
			try {
				$elementor_child = $this->convert_widget_to_elementor_format( $child );
				$elementor_children[] = $elementor_child;
				++$this->creation_stats['widgets_created'];
			} catch ( \Exception $e ) {
				$this->handle_widget_creation_failure( $child, $e );
			}
		}
		return $elementor_children;
	}
	private function handle_widget_creation_failure( $widget, $exception ) {
		++$this->creation_stats['widgets_failed'];
		$error_data = [
			'message' => $exception->getMessage(),
			'exception' => $exception,
		];
		$context = [
			'widget' => $widget,
			'operation' => 'widget_creation',
		];
		$fallback_widget = $this->error_handler->handle_error( 'widget_creation_failed', $error_data, $context );
		if ( $fallback_widget ) {
			++$this->creation_stats['widgets_created'];
			return $fallback_widget;
		}
		return null;
	}
	private function create_html_widget_fallback( $widget ) {
		$content = $this->reconstruct_html_from_widget( $widget );
		return [
			'id' => wp_generate_uuid4(),
			'elType' => 'widget',
			'widgetType' => 'html',
			'settings' => [
				'html' => $content,
			],
		];
	}
	private function reconstruct_html_from_widget( $widget ) {
		$tag = $widget['original_tag'] ?? 'div';
		$content = $widget['settings']['text'] ?? $widget['settings']['content'] ?? '';
		if ( in_array( $tag, [ 'img', 'br', 'hr', 'input' ], true ) ) {
			return "<{$tag} />";
		}
		return "<{$tag}>{$content}</{$tag}>";
	}
	private function save_to_document( $document, $elementor_elements ) {
		if ( ! $document instanceof Document ) {
			throw new \Exception( 'Invalid Elementor document' );
		}
		try {
			$post_id = $document->get_main_id();

			update_post_meta( $post_id, '_elementor_data', wp_json_encode( $elementor_elements ) );
			update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
			update_post_meta( $post_id, '_elementor_template_type', 'wp-post' );
			update_post_meta( $post_id, '_elementor_version', '3.33.0' );
			$document->save( [
				'elements' => $elementor_elements,
			] );
		} catch ( \Exception $e ) {
			throw new \Exception( 'Failed to save elements to document: ' . esc_html( $e->getMessage() ) );
		}
	}
	private function get_edit_url( $post_id ) {
		if ( function_exists( 'elementor_get_edit_url' ) ) {
			return elementor_get_edit_url( $post_id );
		}
		return admin_url( 'post.php?post=' . $post_id . '&action=elementor' );
	}
	public function get_creation_stats() {
		return $this->creation_stats;
	}
	private function merge_hierarchy_stats( $hierarchy_stats ) {
		$this->creation_stats['hierarchy_stats'] = $hierarchy_stats;
		$this->creation_stats['total_widgets_processed'] = $hierarchy_stats['total_widgets'] ?? 0;
		$this->creation_stats['parent_widgets'] = $hierarchy_stats['parent_widgets'] ?? 0;
		$this->creation_stats['child_widgets'] = $hierarchy_stats['child_widgets'] ?? 0;
		$this->creation_stats['hierarchy_depth'] = $hierarchy_stats['depth_levels'] ?? 0;
		$this->creation_stats['hierarchy_errors'] = $hierarchy_stats['hierarchy_errors'] ?? 0;
	}
	public function reset_stats() {
		$this->creation_stats = [
			'widgets_created' => 0,
			'widgets_failed' => 0,
			'global_classes_created' => 0,
			'variables_created' => 0,
			'errors' => [],
			'warnings' => [],
		];
		$this->hierarchy_processor = new Widget_Hierarchy_Processor();
		$this->error_handler = new Widget_Error_Handler();
		$this->property_mapper_registry = Class_Property_Mapper_Factory::get_registry();
	}
	private function fix_numeric_keyed_arrays( $array, $property_key ) {
		if ( ! is_array( $array ) ) {
			return $array;
		}
		$keys = array_keys( $array );
		$has_numeric_keys = array_filter( $keys, 'is_numeric' );
		if ( empty( $has_numeric_keys ) ) {
			foreach ( $array as $key => $value ) {
				if ( is_array( $value ) ) {
					$array[ $key ] = $this->fix_numeric_keyed_arrays( $value, "$property_key.$key" );
				}
			}
			return $array;
		}
		return $this->convert_atomic_array_to_safe_structure( $array, $property_key );
	}
	private function convert_atomic_array_to_safe_structure( $array, $property_key ) {
		if ( $this->is_box_shadow_array( $array ) ) {
			return null;
		}
		$fixed = [];
		foreach ( $array as $index => $value ) {
			$fixed[ "item_$index" ] = is_array( $value ) ?
				$this->fix_numeric_keyed_arrays( $value, "$property_key.item_$index" ) :
				$value;
		}
		return $fixed;
	}
	private function is_box_shadow_array( $array ) {
		return is_array( $array ) &&
				isset( $array[0] ) &&
				is_array( $array[0] ) &&
				isset( $array[0]['$$type'] ) &&
				'shadow' === $array[0]['$$type'];
	}
	private function debug_final_settings_for_numeric_keys( $settings, $widget_type ) {
		$this->deep_scan_for_numeric_keys( $settings, "final_settings_$widget_type" );
	}
	private function deep_scan_for_numeric_keys( $data, $path ) {
		if ( is_array( $data ) ) {
			$keys = array_keys( $data );
			$numeric_keys = array_filter( $keys, 'is_numeric' );
			foreach ( $data as $key => $value ) {
				if ( is_array( $value ) || is_object( $value ) ) {
					$this->deep_scan_for_numeric_keys( $value, "$path.$key" );
				}
			}
		} elseif ( is_object( $data ) ) {
			foreach ( $data as $key => $value ) {
				if ( is_array( $value ) || is_object( $value ) ) {
					$this->deep_scan_for_numeric_keys( $value, "$path.$key" );
				}
			}
		}
	}
	public function inject_css_converter_specific_overrides() {

		$post_id = get_the_ID();
		if ( ! $post_id ) {
			return;
		}

		if ( ! $this->page_has_css_converter_widgets( $post_id ) ) {
			return;
		}

		echo '<style id="css-converter-specific-overrides">';
		echo '.elementor [class*="e-"][class*="-"]:not(.e-paragraph-base):not(.e-heading-base) { ';
		echo '  margin: revert !important; ';
		echo '  padding: revert !important; ';
		echo '} ';
		echo '.elementor [class*="e-"][class*="-"][class*="-"]:not([class*="base"]) { ';
		echo '  margin: revert !important; ';
		echo '  padding: revert !important; ';
		echo '} ';
		echo '.elementor [data-css-converter="true"] .e-paragraph-base, ';
		echo '.elementor [data-css-converter="true"] .e-heading-base { ';
		echo '  margin: revert !important; ';
		echo '  padding: revert !important; ';
		echo '} ';

		echo '</style>';
	}
}
