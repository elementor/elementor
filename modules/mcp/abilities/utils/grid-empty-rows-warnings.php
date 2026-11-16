<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `fr` row tracks of an `e-grid` do not collapse when no child fills them, so rows beyond
 * the ones the children fill render as an equal-height empty band. Only local styles and
 * the widget's base tracks are known here, so grids with global classes are skipped.
 */
class Grid_Empty_Rows_Warnings {

	const CODE = 'grid_empty_rows';
	const GRID_TYPE = 'e-grid';
	const DESKTOP_BREAKPOINT = 'desktop';
	const DEFAULT_TRACKS = [
		'grid-template-columns' => 3,
		'grid-template-rows' => 2,
	];

	/**
	 * @param array<string, array> $config_id_index
	 */
	public static function report( array $config_id_index, Warnings_Bag $warnings ): void {
		foreach ( $config_id_index as $config_id => $node ) {
			if ( self::GRID_TYPE !== ( $node['elType'] ?? '' ) || self::has_global_classes( $node ) ) {
				continue;
			}

			$columns = self::desktop_fr_tracks( $node, 'grid-template-columns' );
			$rows = self::desktop_fr_tracks( $node, 'grid-template-rows' );

			if ( null === $columns || null === $rows || $columns < 1 ) {
				continue;
			}

			$filled_rows = max( 1, (int) ceil( count( $node['elements'] ?? [] ) / $columns ) );

			if ( $rows <= $filled_rows ) {
				continue;
			}

			$warnings->add(
				self::CODE,
				sprintf(
					/* translators: 1: Row track count, 2: Child count, 3: Rows the children fill */
					__( 'This e-grid has %1$d row tracks but its %2$d children fill only %3$d, so the extra rows render as an empty band. Set grid-template-rows: repeat(%3$d, 1fr) or auto.', 'elementor' ),
					$rows,
					count( $node['elements'] ?? [] ),
					$filled_rows
				),
				(string) $config_id
			);
		}
	}

	private static function desktop_fr_tracks( array $node, string $prop ): ?int {
		$value = self::DEFAULT_TRACKS[ $prop ];

		foreach ( $node['styles'] ?? [] as $style ) {
			foreach ( $style['variants'] ?? [] as $variant ) {
				$meta = $variant['meta'] ?? [];

				if ( self::DESKTOP_BREAKPOINT !== ( $meta['breakpoint'] ?? null ) || null !== ( $meta['state'] ?? null ) || ! isset( $variant['props'][ $prop ] ) ) {
					continue;
				}

				$track = $variant['props'][ $prop ]['value'] ?? [];

				if ( 'fr' !== ( $track['unit'] ?? null ) ) {
					return null;
				}

				$value = (int) $track['size'];
			}
		}

		return $value;
	}

	private static function has_global_classes( array $node ): bool {
		$class_ids = $node['settings']['classes']['value'] ?? [];

		return ! empty( array_diff( is_array( $class_ids ) ? $class_ids : [], array_keys( $node['styles'] ?? [] ) ) );
	}
}
