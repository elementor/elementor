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
			
			// DEBUG: Track widget data at conversion stage
			$debug_log = WP_CONTENT_DIR . '/processor-data-flow.log';
			foreach ( $processed_widgets as $widget ) {
				$widget_type = $widget['widget_type'] ?? '';
				$element_id = $widget['element_id'] ?? '';
				if ( $widget_type === 'e-heading' ) {
					$widget_classes = $widget['attributes']['class'] ?? '';
					file_put_contents(
						$debug_log,
						date( '[H:i:s] ' ) . "CONVERT_WIDGETS_COMMAND: Processing {$widget_type} {$element_id}\n" .
						"  Widget classes: '{$widget_classes}'\n",
						FILE_APPEND
					);
				}
			}

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
