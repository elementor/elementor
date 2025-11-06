<?php

namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Container_Variable_Resolver implements Css_Processor_Interface {

	private const ELEMENTOR_CONTAINER_VARIABLES = [
		'--padding-top' => '10px',
		'--padding-right' => '10px',
		'--padding-bottom' => '10px',
		'--padding-left' => '10px',
		'--margin-top' => '0px',
		'--margin-right' => '0px',
		'--margin-bottom' => '0px',
		'--margin-left' => '0px',
		'--widgets-spacing' => '20px',
		'--widgets-spacing-row' => '20px',
		'--widgets-spacing-column' => '20px',
		'--container-max-width' => '1140px',
		'--border-radius' => '0',
		'--border-top-width' => '0px',
		'--border-right-width' => '0px',
		'--border-bottom-width' => '0px',
		'--border-left-width' => '0px',
		'--width' => '100%',
		'--height' => 'auto',
		'--min-height' => 'initial',
		'--position' => 'relative',
		'--z-index' => 'revert',
		'--overflow' => 'visible',
		'--text-align' => 'initial',
		'--gap' => '20px',
		'--row-gap' => '20px',
		'--column-gap' => '20px',
	];

	public function get_processor_name(): string {
		return 'container_variable_resolver';
	}

	public function get_priority(): int {
		return 9.7;
	}

	public function get_statistics_keys(): array {
		return [ 'container_variables_resolved' ];
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		return ! empty( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $tracking_log, "\n" . str_repeat( '-', 80 ) . "\n", FILE_APPEND );
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CONTAINER_VARIABLE_RESOLVER: Started\n", FILE_APPEND );

		$css_rules = $context->get_metadata( 'css_rules', [] );
		$variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );

		$resolved_count = 0;

		foreach ( $css_rules as &$rule ) {
			foreach ( $rule['properties'] as &$property_data ) {
				$value = $property_data['value'] ?? '';

				if ( strpos( $value, 'var(--' ) !== false ) {
					$original_value = $value;
					$resolved_value = $this->resolve_container_variables( $value, $variable_definitions );

					if ( $resolved_value !== $original_value ) {
						$property_data['value'] = $resolved_value;
						$property_data['container_variable_resolved'] = true;
						++$resolved_count;

						file_put_contents(
							$tracking_log,
							date( '[H:i:s] ' ) . "  Resolved: {$original_value} → {$resolved_value}\n",
							FILE_APPEND
						);
					}
				}
			}
		}

		$context->set_metadata( 'css_rules', $css_rules );
		$context->add_statistic( 'container_variables_resolved', $resolved_count );

		file_put_contents(
			$tracking_log,
			date( '[H:i:s] ' ) . "CONTAINER_VARIABLE_RESOLVER: Resolved {$resolved_count} container variables\n",
			FILE_APPEND
		);

		return $context;
	}

	private function resolve_container_variables( string $value, array $variable_definitions ): string {
		return preg_replace_callback(
			'/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/i',
			function( $matches ) use ( $variable_definitions ) {
				$var_name = $matches[1];
				$fallback = $matches[2] ?? null;
				$clean_name = ltrim( $var_name, '-' );

				if ( isset( $variable_definitions[ $clean_name ]['value'] ) && ! empty( $variable_definitions[ $clean_name ]['value'] ) ) {
					$resolved = $variable_definitions[ $clean_name ]['value'];

					if ( strpos( $resolved, 'var(' ) !== false ) {
						return $this->resolve_container_variables( $resolved, $variable_definitions );
					}

					return $resolved;
				}

				if ( $fallback !== null ) {
					$trimmed_fallback = trim( $fallback );

					if ( strpos( $trimmed_fallback, 'var(' ) !== false ) {
						return $this->resolve_container_variables( $trimmed_fallback, $variable_definitions );
					}

					return $trimmed_fallback;
				}

				if ( isset( self::ELEMENTOR_CONTAINER_VARIABLES[ $var_name ] ) ) {
					return self::ELEMENTOR_CONTAINER_VARIABLES[ $var_name ];
				}

				return $matches[0];
			},
			$value
		);
	}
}

