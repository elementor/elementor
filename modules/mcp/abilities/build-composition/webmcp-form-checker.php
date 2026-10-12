<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webmcp_Form_Checker {

	const WARNING_CODE = 'webmcp_missing';
	const WEBMCP_PROPS = [ 'webmcp-tool-name', 'webmcp-tool-description', 'webmcp-param-description' ];

	private Widget_Type_Resolver $type_resolver;

	public function __construct( Widget_Type_Resolver $type_resolver ) {
		$this->type_resolver = $type_resolver;
	}

	public function check( array $index, array $widget_configs ): Warnings_Bag {
		$warnings = Warnings_Bag::make();

		foreach ( $index as $element_id => $element ) {
			$type = $element['widgetType'] ?? $element['elType'] ?? null;

			if ( ! $this->is_form_or_field( $type ) ) {
				continue;
			}

			$schema = $this->type_resolver->get_props_schema( $type, $widget_configs ) ?? [];
			$missing = $this->get_missing_props( $element, $schema );

			if ( empty( $missing ) ) {
				continue;
			}

			$warnings->add(
				self::WARNING_CODE,
				sprintf(
					'<%1$s> has no value for "%2$s". Set it from the purpose of the form, using elementor/manage-elements.',
					$type,
					implode( '", "', $missing )
				),
				(string) $element_id
			);
		}

		return $warnings;
	}

	private function is_form_or_field( ?string $type ): bool {
		return Form_Structure_Validator::FORM_ELEMENT_TYPE === $type
			|| in_array( $type, Form_Structure_Validator::FORM_FIELD_ELEMENT_TYPES, true );
	}

	private function get_missing_props( array $element, array $schema ): array {
		$exposed_props = array_intersect( self::WEBMCP_PROPS, array_keys( $schema ) );

		return array_filter( $exposed_props, fn( $prop ) => ! $this->is_prop_set( $element, $prop ) );
	}

	private function is_prop_set( array $element, string $prop ): bool {
		$settings = $element['settings'] ?? [];
		$value = $settings[ $prop ]['value'] ?? '';

		if ( empty( $value ) && 'webmcp-tool-name' === $prop ) {
			$value = $settings['form-name']['value'] ?? '';
		}

		return ! empty( $value );
	}
}
