<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Processor implements Css_Processor_Interface {

	public function get_processor_name(): string {
		return 'global_classes';
	}

	public function get_priority(): int {
		return 70; // After variables, before HTML modifications
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		return ! empty( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );

		// DEBUG: Log CSS rules received by global classes processor
		error_log( "CSS PIPELINE DEBUG [GLOBAL_CLASSES]: Received " . count( $css_rules ) . " CSS rules" );
		foreach ( $css_rules as $index => $rule ) {
			$selector = $rule['selector'] ?? 'unknown';
			$properties_count = count( $rule['properties'] ?? [] );
			error_log( "CSS PIPELINE DEBUG [GLOBAL_CLASSES]: Rule #{$index}: '{$selector}' with {$properties_count} properties" );
		}

		// Process global classes with duplicate detection
		$global_classes_result = $this->process_global_classes_with_duplicate_detection( $css_rules );

		// Store results in context
		$context->set_metadata( 'global_classes', $global_classes_result['global_classes'] );
		$context->set_metadata( 'class_name_mappings', $global_classes_result['class_name_mappings'] );
		$context->set_metadata( 'debug_duplicate_detection', $global_classes_result['debug_duplicate_detection'] );

		// Add statistics
		$context->add_statistic( 'global_classes_created', count( $global_classes_result['global_classes'] ) );
		$context->add_statistic( 'class_name_mappings_created', count( $global_classes_result['class_name_mappings'] ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'global_classes_created',
			'class_name_mappings_created',
		];
	}

	private function process_global_classes_with_duplicate_detection( array $css_rules ): array {
		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

		if ( ! $provider->is_available() ) {
			return [
				'global_classes' => [],
				'class_name_mappings' => [],
				'debug_duplicate_detection' => null,
			];
		}

		// Process CSS rules to create global classes
		$integration_service = $provider->get_integration_service();
		$result = $integration_service->process_css_rules( $css_rules );

		return [
			'global_classes' => $result['global_classes'] ?? [],
			'class_name_mappings' => $result['class_name_mappings'] ?? [],
			'debug_duplicate_detection' => $result['debug_duplicate_detection'] ?? null,
		];
	}
}
