<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


use Elementor\Modules\CssConverter\Services\Widgets\Commands\Create_Elementor_Post_Command;
use Elementor\Modules\CssConverter\Services\Widgets\Commands\Process_CSS_Variables_Command;
use Elementor\Modules\CssConverter\Services\Widgets\Commands\Process_Widget_Hierarchy_Command;
use Elementor\Modules\CssConverter\Services\Widgets\Commands\Convert_Widgets_To_Elementor_Command;
use Elementor\Modules\CssConverter\Services\Widgets\Commands\Save_To_Document_Command;
use Elementor\Modules\CssConverter\Services\Widgets\Commands\Clear_Cache_Command;

class Widget_Creation_Orchestrator {
	private Widget_Creation_Command_Pipeline $pipeline;
	private Widget_Creation_Service_Locator $service_locator;

	public function __construct( bool $use_zero_defaults = false ) {
		$this->service_locator = new Widget_Creation_Service_Locator( $use_zero_defaults );
		$this->pipeline = new Widget_Creation_Command_Pipeline();
		$this->initialize_pipeline();

		if ( $use_zero_defaults ) {
			$this->enable_css_converter_base_styles_override();
		}
	}

	public function create_widgets( array $styled_widgets, array $css_processing_result, array $options = [] ): array {
		
		try {
			$context = new Widget_Creation_Context( $styled_widgets, $css_processing_result, $options );

			$result = $this->pipeline->execute( $context );

			if ( $result->is_failure() ) {
				$this->service_locator->get_statistics_collector()->add_error( [
					'type' => 'pipeline_execution_failed',
					'message' => $result->get_error_message(),
				] );

				throw new \Exception( $result->get_error_message() );
			}

			$stats = $this->service_locator->get_statistics_collector();
			$stats->merge_hierarchy_stats( $context->get_hierarchy_stats() );

			$orchestrator_result = [
				'success' => true,
				'post_id' => $context->get_post_id(),
				'edit_url' => $this->service_locator->get_document_manager()->get_edit_url( $context->get_post_id() ),
				'widgets_created' => $stats->get_stats()['widgets_created'],
				'global_classes_created' => $stats->get_stats()['global_classes_created'],
				'variables_created' => $stats->get_stats()['variables_created'],
				'stats' => $stats->get_stats(),
				'hierarchy_stats' => $context->get_hierarchy_stats(),
				'hierarchy_errors' => [],
				'error_report' => $this->service_locator->get_error_handler()->generate_error_report(),
				'element_data' => $context->get_elementor_elements(), // FIXED: Return the processed widgets
			];
			
			return $orchestrator_result;
		} catch ( \Exception $e ) {
			$this->service_locator->get_statistics_collector()->add_error( [
				'type' => 'widget_creation_failed',
				'message' => $e->getMessage(),
				'trace' => $e->getTraceAsString(),
			] );

			throw $e;
		}
	}

	public function get_creation_stats(): array {
		return $this->service_locator->get_statistics_collector()->get_stats();
	}

	public function reset_stats(): void {
		$this->service_locator->get_statistics_collector()->reset_stats();
		$this->service_locator->get_css_variable_processor()->reset_stats();
	}

	private function initialize_pipeline(): void {
		$this->pipeline
			->add_command( new Create_Elementor_Post_Command(
				$this->service_locator->get_document_manager()
			) )
			->add_command( new Process_CSS_Variables_Command(
				$this->service_locator->get_css_variable_processor(),
				$this->service_locator->get_statistics_collector()
			) )
			->add_command( new Process_Widget_Hierarchy_Command(
				$this->service_locator->get_hierarchy_processor()
			) )
			->add_command( new Convert_Widgets_To_Elementor_Command(
				$this->service_locator->get_widget_factory_registry(),
				$this->service_locator->get_statistics_collector(),
				$this->service_locator->get_error_handler()
			) )
			->add_command( new Save_To_Document_Command(
				$this->service_locator->get_document_manager()
			) )
			->add_command( new Clear_Cache_Command(
				$this->service_locator->get_cache_manager()
			) );
	}

	private function enable_css_converter_base_styles_override(): void {
		add_action( 'wp_head', [ $this, 'inject_base_styles_override_css' ], 999 );
		add_action( 'elementor/editor/wp_head', [ $this, 'inject_base_styles_override_css' ], 999 );
		add_action( 'elementor/preview/enqueue_styles', [ $this, 'inject_base_styles_override_css' ], 999 );

		add_action( 'wp_head', [ $this, 'inject_css_converter_specific_overrides' ], 1000 );
		add_action( 'elementor/editor/wp_head', [ $this, 'inject_css_converter_specific_overrides' ], 1000 );
		add_action( 'elementor/preview/enqueue_styles', [ $this, 'inject_css_converter_specific_overrides' ], 1000 );
	}

	public function inject_base_styles_override_css(): void {
		$post_id = get_the_ID();
		if ( ! $post_id ) {
			return;
		}
	}

	public function inject_css_converter_specific_overrides(): void {
		$post_id = get_the_ID();
		if ( ! $post_id ) {
			return;
		}

		if ( ! $this->service_locator->get_cache_manager()->page_has_css_converter_widgets( $post_id ) ) {
			return;
		}

		echo '<style id="css-converter-specific-overrides">';
		echo '/* CSS Converter: Target widgets with CSS converter class patterns */';
		echo '.elementor [class*="e-"][class*="-"]:not(.e-paragraph-base):not(.e-heading-base) { ';
		echo '  margin: revert !important; ';
		echo '  padding: revert !important; ';
		echo '} ';
		echo '</style>';
	}
}
