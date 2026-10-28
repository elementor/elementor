<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Marks props whose values must not leave the site (export, cloud templates) or reach AI agents.
 *
 * Applied on top-level props of an element's props schema using `Prop_Type::meta()`, e.g.
 * `String_Prop_Type::make()->meta( Prop_Sensitivity::sensitive() )`.
 */
class Prop_Sensitivity {
	const EXPORT_META_KEY = 'export';
	const SENSITIVE_META_KEY = 'sensitive';

	/**
	 * Return a tuple that removes the prop from the element settings on export (kit, template file and cloud template).
	 * The atomic equivalent of a V3 control registered with `'export' => false`.
	 *
	 * Only honored on top-level props of an element props schema (not on object shape fields or array items).
	 */
	public static function not_exportable(): array {
		return [ self::EXPORT_META_KEY, false ];
	}

	/**
	 * Return a tuple that marks the prop as a secret (e.g. an API key): it is not exportable,
	 * it is hidden from AI agents (not published in agent schemas, not writable and not readable by them),
	 * and it cannot be made overridable in components.
	 *
	 * Only honored on top-level props of an element props schema (not on object shape fields or array items).
	 */
	public static function sensitive(): array {
		return [ self::SENSITIVE_META_KEY, true ];
	}

	public static function is_sensitive( $prop_type ): bool {
		return $prop_type instanceof Prop_Type
			&& true === $prop_type->get_meta_item( self::SENSITIVE_META_KEY, false );
	}

	public static function is_exportable( $prop_type ): bool {
		if ( ! ( $prop_type instanceof Prop_Type ) ) {
			return true;
		}

		if ( self::is_sensitive( $prop_type ) ) {
			return false;
		}

		return false !== $prop_type->get_meta_item( self::EXPORT_META_KEY, true );
	}

	/**
	 * @param array<string, Prop_Type> $schema
	 *
	 * @return array<string, Prop_Type> The schema without the sensitive props.
	 */
	public static function without_sensitive_props( array $schema ): array {
		return array_filter( $schema, fn( $prop_type ) => ! self::is_sensitive( $prop_type ) );
	}

	/**
	 * @param array                    $settings Raw element settings.
	 * @param array<string, Prop_Type> $schema   The element props schema.
	 *
	 * @return array The settings without the values of the non-exportable props.
	 */
	public static function strip_non_exportable_settings( array $settings, array $schema ): array {
		foreach ( $schema as $key => $prop_type ) {
			if ( array_key_exists( $key, $settings ) && ! self::is_exportable( $prop_type ) ) {
				unset( $settings[ $key ] );
			}
		}

		return $settings;
	}
}
