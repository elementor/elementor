<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Commands;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Creation_Command_Interface;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Context;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Result;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Hierarchy_Processor;

class Process_Widget_Hierarchy_Command implements Widget_Creation_Command_Interface {
	private Widget_Hierarchy_Processor $hierarchy_processor;

	public function __construct( Widget_Hierarchy_Processor $hierarchy_processor ) {
		$this->hierarchy_processor = $hierarchy_processor;
	}

	public function execute( Widget_Creation_Context $context ): Widget_Creation_Result {
		try {
			// CRITICAL FIX: Use processed widgets (with class modifications) instead of original styled widgets
			$widgets_to_process = $context->get_processed_widgets();
			if ( empty( $widgets_to_process ) ) {
				// Fallback to styled widgets if no processed widgets available yet
				$widgets_to_process = $context->get_styled_widgets();
			}
			
			$hierarchy_result = $this->hierarchy_processor->process_widget_hierarchy(
				$widgets_to_process
			);

			$context->set_processed_widgets( $hierarchy_result['widgets'] );
			$context->set_hierarchy_stats( $hierarchy_result['stats'] );

			return Widget_Creation_Result::success( [
				'processed_widgets_count' => count( $hierarchy_result['widgets'] ),
				'hierarchy_stats' => $hierarchy_result['stats'],
				'hierarchy_errors' => $hierarchy_result['errors'] ?? [],
			] );
		} catch ( \Exception $e ) {
			return Widget_Creation_Result::failure( $e->getMessage() );
		}
	}

	public function get_command_name(): string {
		return 'process_widget_hierarchy';
	}
}
