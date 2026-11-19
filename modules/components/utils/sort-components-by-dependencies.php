<?php

namespace Elementor\Modules\Components\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Orders kit components so every component comes after the components it nests,
 * which lets parents be created after their children got their destination ids.
 * Unknown dependency ids and cycles fall back to manifest order.
 */
class Sort_Components_By_Dependencies {
	/**
	 * @param array $manifest     source_id => manifest entry, in manifest order.
	 * @param array $dependencies source_id => [ 'depends_on' => int[] ].
	 */
	public static function apply( array $manifest, array $dependencies ): array {
		$sorted = [];
		$visiting = [];

		foreach ( array_keys( $manifest ) as $source_id ) {
			self::visit( (int) $source_id, $manifest, $dependencies, $sorted, $visiting );
		}

		return $sorted;
	}

	private static function visit( int $source_id, array $manifest, array $dependencies, array &$sorted, array &$visiting ): void {
		if ( array_key_exists( $source_id, $sorted ) || isset( $visiting[ $source_id ] ) || ! array_key_exists( $source_id, $manifest ) ) {
			return;
		}

		$visiting[ $source_id ] = true;

		foreach ( $dependencies[ $source_id ]['depends_on'] ?? [] as $dependency_id ) {
			if ( is_numeric( $dependency_id ) ) {
				self::visit( (int) $dependency_id, $manifest, $dependencies, $sorted, $visiting );
			}
		}

		unset( $visiting[ $source_id ] );

		$sorted[ $source_id ] = $manifest[ $source_id ];
	}
}
