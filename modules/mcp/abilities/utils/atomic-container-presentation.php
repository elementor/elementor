<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Every atomic element (not widget) renders with the `.e-con` class. These are the declarations
 * from assets/dev/scss/frontend/_container.scss that affect atomic elements, kept in sync by a
 * PHPUnit check. Declarations the element's own desktop base styles set are omitted, since the
 * base styles override them.
 *
 * The kit's Container Padding (10px by default) is left out on purpose: `.e-con` applies it as
 * inline padding only, the base padding of most atomic elements overrides it, and the value is
 * user-editable per breakpoint so it can't be hardcoded here.
 */
class Atomic_Container_Presentation {

	const WIDGET_EL_TYPE = 'widget';
	const SHELL_SELECTOR = '.e-con';
	const DESKTOP_BREAKPOINT = 'desktop';

	const DECLARATIONS = [
		'position' => 'relative',
		'width' => '100%',
		'min-width' => '0',
	];

	const DOCUMENT_ROOT_DECLARATIONS = [
		'margin-inline-start' => 'auto',
		'margin-inline-end' => 'auto',
		'max-width' => '100%',
	];

	const SHORTHANDS = [
		'margin-inline-start' => 'margin',
		'margin-inline-end' => 'margin',
	];

	public static function applies_to( array $element_config ): bool {
		$is_atomic = ! empty( $element_config['atomic'] );
		$is_element = self::WIDGET_EL_TYPE !== ( $element_config['elType'] ?? self::WIDGET_EL_TYPE );

		return $is_atomic && $is_element;
	}

	public static function to_map(): array {
		return self::DECLARATIONS;
	}

	public static function to_css_string( array $base_styles = [], bool $is_document_root = false ): string {
		$declarations = $is_document_root
			? array_merge( self::DECLARATIONS, self::DOCUMENT_ROOT_DECLARATIONS )
			: self::DECLARATIONS;

		$overridden = self::get_desktop_base_properties( $base_styles );
		$remaining = array_filter(
			$declarations,
			fn( $property ) => ! isset( $overridden[ $property ] ) && ! isset( $overridden[ self::SHORTHANDS[ $property ] ?? '' ] ),
			ARRAY_FILTER_USE_KEY
		);

		if ( empty( $remaining ) ) {
			return '';
		}

		$formatted = array_map( fn( $property, $value ) => $property . ':' . $value . ';', array_keys( $remaining ), $remaining );

		return self::SHELL_SELECTOR . '{' . implode( '', $formatted ) . '}';
	}

	private static function get_desktop_base_properties( array $base_styles ): array {
		$properties = [];

		foreach ( $base_styles as $style ) {
			foreach ( $style['variants'] ?? [] as $variant ) {
				$breakpoint = $variant['meta']['breakpoint'] ?? self::DESKTOP_BREAKPOINT;
				$state = $variant['meta']['state'] ?? null;

				if ( self::DESKTOP_BREAKPOINT === $breakpoint && null === $state ) {
					$properties += $variant['props'] ?? [];
				}
			}
		}

		return $properties;
	}
}
