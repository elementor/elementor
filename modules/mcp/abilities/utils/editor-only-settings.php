<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings the MCP exposes as regular element settings while Elementor stores them in
 * `editor_settings`, so they never reach the props schema or the frontend.
 */
class Editor_Only_Settings {

	const DECORATIVE = 'decorative';

	const DECORATIVE_ELEMENT_TYPES = [ 'e-div-block', 'e-flexbox', 'e-grid' ];

	const DECORATIVE_DESCRIPTION = 'Editor only: never rendered on the frontend. Set true on a visual-only container that will stay empty (a shape, glow, gradient or other HTML/CSS composition), so the editor does not force its empty-container placeholder min-height and min-width on it. Give it an explicit width and height in style. Leave false for containers that will get children.';

	public static function get_properties_schema( string $element_type ): array {
		if ( ! self::supports_decorative( $element_type ) ) {
			return [];
		}

		return [
			self::DECORATIVE => [
				'type' => 'boolean',
				'description' => self::DECORATIVE_DESCRIPTION,
			],
		];
	}

	/**
	 * Moves editor-only keys from `$settings` into the node's `editor_settings` and returns the
	 * remaining settings for the props schema.
	 */
	public static function apply( array &$node, array $settings, string $element_type, string $config_id, Warnings_Bag $warnings ): array {
		if ( ! self::supports_decorative( $element_type ) || ! array_key_exists( self::DECORATIVE, $settings ) ) {
			return $settings;
		}

		$value = $settings[ self::DECORATIVE ];
		unset( $settings[ self::DECORATIVE ] );

		if ( null === $value ) {
			unset( $node['editor_settings'][ self::DECORATIVE ] );
			return $settings;
		}

		if ( ! is_bool( $value ) ) {
			$warnings->add(
				'prop_value_invalid',
				sprintf( 'Property "%s" on "%s" must be a boolean and was skipped.', self::DECORATIVE, $element_type ),
				$config_id
			);
			return $settings;
		}

		$node['editor_settings'][ self::DECORATIVE ] = $value;

		return $settings;
	}

	private static function supports_decorative( string $element_type ): bool {
		return in_array( $element_type, self::DECORATIVE_ELEMENT_TYPES, true );
	}
}
