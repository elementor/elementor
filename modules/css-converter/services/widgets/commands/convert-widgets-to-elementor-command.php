<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Commands;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Creation_Command_Interface;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Context;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Result;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Factory_Registry;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Statistics_Collector;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Error_Handler;

class Convert_Widgets_To_Elementor_Command implements Widget_Creation_Command_Interface {
	private Widget_Factory_Registry $widget_factory_registry;
	private Widget_Creation_Statistics_Collector $stats_collector;
	private Widget_Error_Handler $error_handler;

	public function __construct(
		Widget_Factory_Registry $widget_factory_registry,
		Widget_Creation_Statistics_Collector $stats_collector,
		Widget_Error_Handler $error_handler
	) {
		$this->widget_factory_registry = $widget_factory_registry;
		$this->stats_collector = $stats_collector;
		$this->error_handler = $error_handler;
	}

	public function execute( Widget_Creation_Context $context ): Widget_Creation_Result {
		try {
			$elementor_elements = [];
			$processed_widgets = $context->get_processed_widgets();

		// Set CSS processing result on factories that need it
		$this->configure_factories_with_css_result( $context->get_css_processing_result() );

		// Convert widgets hierarchically to preserve parent-child relationships
		$elementor_elements = $this->convert_widgets_hierarchically( $processed_widgets );

			$context->set_elementor_elements( $elementor_elements );

			return Widget_Creation_Result::success( [
				'elements_created' => count( $elementor_elements ),
			] );
		} catch ( \Exception $e ) {
			return Widget_Creation_Result::failure( $e->getMessage() );
		}
	}

	private function convert_widgets_hierarchically( array $widgets ): array {
		$elementor_elements = [];

		foreach ( $widgets as $widget ) {
			try {
				// Convert the current widget
				$elementor_widget = $this->widget_factory_registry->create_widget( $widget );
				
				// If the widget has children (elements), convert them recursively
				if ( ! empty( $widget['elements'] ) ) {
					$child_elements = $this->convert_widgets_hierarchically( $widget['elements'] );
					$elementor_widget['elements'] = $child_elements;
				}

				$elementor_elements[] = $elementor_widget;
				$this->stats_collector->increment_widgets_created();
			} catch ( \Exception $e ) {
				$fallback_widget = $this->handle_widget_creation_failure( $widget, $e );
				if ( $fallback_widget ) {
					// Also handle children for fallback widgets
					if ( ! empty( $widget['elements'] ) ) {
						$child_elements = $this->convert_widgets_hierarchically( $widget['elements'] );
						$fallback_widget['elements'] = $child_elements;
					}
					
					$elementor_elements[] = $fallback_widget;
					$this->stats_collector->increment_widgets_created();
				} else {
					$this->stats_collector->increment_widgets_failed();
				}
			}
		}

		return $elementor_elements;
	}

	private function flatten_excessive_nesting( array $elements ): array {
		$flattened = [];

		foreach ( $elements as $element ) {
			if ( $this->should_flatten_container( $element ) ) {
				$children = $this->flatten_excessive_nesting( $element['elements'] ?? [] );
				$flattened = array_merge( $flattened, $children );
			} else {
				if ( ! empty( $element['elements'] ) ) {
					$element['elements'] = $this->flatten_excessive_nesting( $element['elements'] );
				}
				$flattened[] = $element;
			}
		}

		return $flattened;
	}

	private function should_flatten_container( array $element ): bool {
		if ( $element['elType'] !== 'e-div-block' ) {
			return false;
		}

		$classes = $element['settings']['classes']['value'] ?? [];
		$meaningful_class_prefixes = [ 'e-con', 'e-flex', 'e-grid' ];
		$has_meaningful_classes = ! empty( array_filter( $classes, function( $class ) use ( $meaningful_class_prefixes ) {
			foreach ( $meaningful_class_prefixes as $prefix ) {
				if ( strpos( $class, $prefix ) === 0 ) {
					return true;
				}
			}
			return false;
		} ) );

		if ( $has_meaningful_classes ) {
			return false;
		}

		$has_styles = ! empty( $element['styles'] );
		if ( $has_styles ) {
			return false;
		}

		$has_meaningful_settings = ! empty( array_filter( $element['settings'] ?? [], function( $value, $key ) {
			if ( $key === 'classes' ) {
				return false;
			}
			if ( is_array( $value ) && isset( $value['$$type'] ) ) {
				$atomic_value = $value['value'] ?? null;
				return ! empty( $atomic_value );
			}
			return ! empty( $value );
		}, ARRAY_FILTER_USE_BOTH ) );

		$is_empty = empty( $element['elements'] );

		if ( $is_empty ) {
			return true;
		}

		if ( ! $has_meaningful_settings ) {
			return true;
		}

		return false;
	}

	public function get_command_name(): string {
		return 'convert_widgets_to_elementor';
	}

	private function configure_factories_with_css_result( array $css_processing_result ): void {
		foreach ( $this->widget_factory_registry->get_supported_types() as $type ) {
			$factory = $this->widget_factory_registry->get_factory_for_type( $type );
			if ( method_exists( $factory, 'set_css_processing_result' ) ) {
				$factory->set_css_processing_result( $css_processing_result );
			}
		}
	}

	private function handle_widget_creation_failure( array $widget, \Exception $exception ): ?array {
		$error_data = [
			'message' => $exception->getMessage(),
			'exception' => $exception,
		];

		$context = [
			'widget' => $widget,
			'operation' => 'widget_creation',
		];

		return $this->error_handler->handle_error( 'widget_creation_failed', $error_data, $context );
	}
}
