<?php

namespace Elementor\Modules\Components\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Remap_Variants_Element_Ids {
	public static function apply( array $variants, array $id_map ): array {
		if ( empty( $id_map ) || empty( $variants['variants'] ) ) {
			return $variants;
		}

		$variants['variants'] = array_map(
			static function ( array $variant ) use ( $id_map ) {
				if ( empty( $variant['widgets'] ) || ! is_array( $variant['widgets'] ) ) {
					return $variant;
				}

				$widgets = [];

				foreach ( $variant['widgets'] as $element_id => $widget ) {
					$widgets[ $id_map[ $element_id ] ?? $element_id ] = $widget;
				}

				$variant['widgets'] = $widgets;

				return $variant;
			},
			$variants['variants']
		);

		return $variants;
	}
}
