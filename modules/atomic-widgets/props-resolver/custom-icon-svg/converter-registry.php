<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Converter_Registry {
	/**
	 * @return Svg_Converter[]
	 */
	public static function all(): array {
		$converters = apply_filters(
			'elementor/atomic-widgets/icon/svg-converters',
			[ new Fontello_Converter() ]
		);

		if ( ! is_array( $converters ) ) {
			return [];
		}

		return array_values( array_filter(
			$converters,
			static fn( $converter ) => $converter instanceof Svg_Converter
		) );
	}

	public static function for_tab( array $tab ): ?Svg_Converter {
		$type = isset( $tab['custom_icon_type'] ) && is_string( $tab['custom_icon_type'] )
			? strtolower( $tab['custom_icon_type'] )
			: '';

		foreach ( self::all() as $converter ) {
			if ( '' !== $type && $converter instanceof Fontello_Converter && 'fontello' !== $type ) {
				continue;
			}

			if ( $converter->supports( $tab ) ) {
				return $converter;
			}
		}

		return null;
	}
}
