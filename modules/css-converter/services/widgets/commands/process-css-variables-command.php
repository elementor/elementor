<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Commands;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Creation_Command_Interface;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Context;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Result;
use Elementor\Modules\CssConverter\Services\Widgets\CSS_Variable_Processor;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creation_Statistics_Collector;
use Elementor\Modules\CssConverter\Services\Variables\Variables_Service_Provider;
use Elementor\Plugin;

class Process_CSS_Variables_Command implements Widget_Creation_Command_Interface {
	private CSS_Variable_Processor $css_processor;
	private Widget_Creation_Statistics_Collector $stats_collector;

	public function __construct(
		CSS_Variable_Processor $css_processor,
		Widget_Creation_Statistics_Collector $stats_collector
	) {
		$this->css_processor = $css_processor;
		$this->stats_collector = $stats_collector;
	}

	public function execute( Widget_Creation_Context $context ): Widget_Creation_Result {
		try {
			$css_result = $context->get_css_processing_result();
			$variables_processed = 0;
			$definitions_processed = 0;
			$variables_created = 0;

			if ( ! empty( $css_result['css_variables'] ) ) {
				$result = $this->css_processor->process_css_variables( $css_result['css_variables'] );
				if ( $result['success'] ) {
					$variables_processed = $result['variables_processed'];
					for ( $i = 0; $i < $variables_processed; $i++ ) {
						$this->stats_collector->increment_variables_created();
					}
				}
			}

			if ( ! empty( $css_result['css_variable_definitions'] ) ) {
				$provider = Variables_Service_Provider::instance();
				
				if ( $provider->is_available() ) {
					$update_mode = $context->get_options()['update_mode'] ?? 'create_new';
					$integration_service = $provider->get_integration_service( $update_mode );
					
					$registration_result = $integration_service->process_css_variables( $css_result['css_variable_definitions'] );
					
					$variables_created = $registration_result['variables_created'] ?? 0;
					$variables_reused = $registration_result['reused'] ?? 0;
					$definitions_processed = count( $css_result['css_variable_definitions'] );

					for ( $i = 0; $i < $variables_created; $i++ ) {
						$this->stats_collector->increment_variables_created();
					}

					if ( $variables_created > 0 || $variables_reused > 0 ) {
						$this->flush_css_cache_for_variables();
						
						do_action( 'elementor/css-converter/variables-created', [
							'variables_created' => $variables_created,
							'variables_reused' => $variables_reused,
						] );
					}
				} else {
					$result = $this->css_processor->process_css_variable_definitions( $css_result['css_variable_definitions'] );
					if ( $result['success'] ) {
						$definitions_processed = $result['definitions_processed'];
						for ( $i = 0; $i < $definitions_processed; $i++ ) {
							$this->stats_collector->increment_variables_created();
						}
					}
				}
			}

			return Widget_Creation_Result::success( [
				'variables_processed' => $variables_processed,
				'definitions_processed' => $definitions_processed,
				'variables_created' => $variables_created,
			] );
		} catch ( \Exception $e ) {
			return Widget_Creation_Result::failure( $e->getMessage() );
		}
	}

	public function get_command_name(): string {
		return 'process_css_variables';
	}

	private function flush_css_cache_for_variables(): void {
		if ( ! Plugin::$instance ) {
			return;
		}

		Plugin::$instance->files_manager->clear_cache();
	}
}
