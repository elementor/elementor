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
		return 81;
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		return ! empty( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		$class_extractor = new \Elementor\Modules\CssConverter\Services\Widgets\Widget_Class_Extractor();
		$used_classes = $class_extractor->extract_all_classes_from_widgets( $widgets );

		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

		$custom_css_collector = $context->get_metadata( 'custom_css_collector' );
		if ( $custom_css_collector ) {
			$provider->set_custom_css_collector( $custom_css_collector );
		}

		$detection_service = $provider->get_detection_service();

		$all_detected = $detection_service->detect_css_class_selectors( $css_rules );
		$filtered_detected = $detection_service->filter_classes_by_usage( $all_detected, $used_classes );

		$global_classes_result = $this->process_global_classes_with_duplicate_detection_from_detected( $filtered_detected, $context );

		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached = $global_classes_result['overflow_styles_when_maximum_number_of_global_classes_has_been_reached'] ?? [];

		if ( ! empty( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) ) {
			$context->set_metadata( 'overflow_styles_when_maximum_number_of_global_classes_has_been_reached', $overflow_styles_when_maximum_number_of_global_classes_has_been_reached );
		}

		$context->set_metadata( 'global_classes', $global_classes_result['global_classes'] );
		$context->set_metadata( 'class_name_mappings', $global_classes_result['class_name_mappings'] );
		$context->set_metadata( 'custom_css_rules', $global_classes_result['custom_css_rules'] );
		$context->set_metadata( 'debug_duplicate_detection', $global_classes_result['debug_duplicate_detection'] );

		$context->add_statistic( 'global_classes_created', count( $global_classes_result['global_classes'] ) );
		$context->add_statistic( 'global_classes_filtered_out', count( $all_detected ) - count( $filtered_detected ) );
		$context->add_statistic( 'global_classes_overflow_styles_when_maximum_number_of_global_classes_has_been_reached', count( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) );
		$context->add_statistic( 'class_name_mappings_created', count( $global_classes_result['class_name_mappings'] ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'global_classes_created',
			'global_classes_filtered_out',
			'global_classes_overflow_styles_when_maximum_number_of_global_classes_has_been_reached',
			'class_name_mappings_created',
		];
	}

	private function process_global_classes_with_duplicate_detection_from_detected( array $detected_classes, Css_Processing_Context $context ): array {
		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

		if ( ! $provider->is_available() ) {
			return [
				'global_classes' => [],
				'class_name_mappings' => [],
				'overflow_classes' => [],
				'debug_duplicate_detection' => [
					'error' => 'Global Classes Service Provider not available',
				],
			];
		}

		$integration_service = $provider->get_integration_service();
		$conversion_service = $provider->get_conversion_service();
		$registration_service = $provider->get_registration_service();

		$css_variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );

		$converted = $conversion_service->convert_to_atomic_props( $detected_classes, $css_variable_definitions );

		if ( empty( $converted ) ) {
			return [
				'global_classes' => [],
				'class_name_mappings' => [],
				'overflow_classes' => [],
				'debug_duplicate_detection' => [
					'message' => 'No properties could be converted to atomic format',
				],
			];
		}

		$result = $registration_service->register_with_elementor( $converted );

		$class_name_mappings = $result['class_name_mappings'] ?? [];
		$global_classes = $this->build_global_classes_with_final_names( $detected_classes, $class_name_mappings );

		$custom_css_rules = [];
		foreach ( $converted as $original_class_name => $class_data ) {
			$custom_css = $class_data['custom_css'] ?? '';

			if ( ! empty( $custom_css ) ) {
				$final_class_name = $class_name_mappings[ $original_class_name ] ?? $original_class_name;
				$custom_css_rules[ $final_class_name ] = [
					'selector' => ".elementor .{$final_class_name}",
					'css' => $custom_css,
					'original_class' => $original_class_name,
				];
			}
		}

		return [
			'global_classes' => $global_classes,
			'class_name_mappings' => $class_name_mappings,
			'overflow_styles_when_maximum_number_of_global_classes_has_been_reached' => $result['overflow_styles_when_maximum_number_of_global_classes_has_been_reached'] ?? [],
			'custom_css_rules' => $custom_css_rules,
			'debug_duplicate_detection' => $result['debug_duplicate_detection'] ?? [],
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

		$integration_service = $provider->get_integration_service();
		$result = $integration_service->process_css_rules( $css_rules );

		$custom_css_rules = $result['custom_css_rules'] ?? [];

		return [
			'global_classes' => $result['global_classes'] ?? [],
			'class_name_mappings' => $result['class_name_mappings'] ?? [],
			'custom_css_rules' => $custom_css_rules,
			'debug_duplicate_detection' => $result['debug_duplicate_detection'] ?? null,
		];
	}

	private function build_global_classes_with_final_names( array $detected_classes, array $class_name_mappings ): array {
		$global_classes = [];

		foreach ( $detected_classes as $original_class_name => $class_data ) {
			$final_class_name = $class_name_mappings[ $original_class_name ] ?? $original_class_name;
			$global_classes[ $final_class_name ] = $class_data;
		}

		return $global_classes;
	}
}
