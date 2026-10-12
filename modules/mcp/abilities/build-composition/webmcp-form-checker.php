<?php

namespace Elementor\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Warns when an element exposes WebMCP props in its schema but has no saved value for them.
 */
class Webmcp_Form_Checker {

	const WARNING_CODE = 'webmcp_missing';

	const WEBMCP_PROPS = [ 'webmcp-tool-name', 'webmcp-tool-description', 'webmcp-param-description' ];

	private Widget_Type_Resolver $type_resolver;

	public function __construct( Widget_Type_Resolver $type_resolver ) {
		$this->type_resolver = $type_resolver;
	}

	/**
	 * @param array<string, array> $index          Elements by id, holding their saved settings.
	 * @param array<string, array> $widget_configs Resolved type configs.
	 */
	public function check( array $index, array $widget_configs ): Warnings_Bag {
		$warnings = Warnings_Bag::make();

		foreach ( $index as $element_id => $element ) {
			$type = $element['widgetType'] ?? $element['elType'] ?? null;
			$schema = $this->type_resolver->get_props_schema( $type, $widget_configs ) ?? [];

			$missing = array_filter(
				self::WEBMCP_PROPS,
				fn( $prop ) => isset( $schema[ $prop ] ) && empty( $element['settings'][ $prop ]['value'] )
			);

			if ( empty( $missing ) ) {
				continue;
			}

			$warnings->add(
				self::WARNING_CODE,
				sprintf(
					'<%1$s> has no value for "%2$s". Set it from the purpose of the form so AI agents can discover and fill it, using elementor/manage-elements.',
					$type,
					implode( '", "', $missing )
				),
				(string) $element_id
			);
		}

		return $warnings;
	}
}
