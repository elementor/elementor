<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Where the style settings of a map-driven element are stored: the element itself, the active
 * kit for targets that style site-wide Site Settings ({@see Style_Target::kit_hosted()}), or both.
 */
interface V3_Map_Settings_Host {

	/**
	 * @return array<string, mixed>
	 */
	public function read( array $node ): array;

	/**
	 * @param array                $node     Subtree node (by reference).
	 * @param array<string, mixed> $settings The full settings {@see self::read()} returned, after the write.
	 */
	public function write( array &$node, array $settings ): void;

	/**
	 * @param array<string, mixed> $settings Settings in the shape {@see self::read()} returns.
	 * @return array<string, mixed> The part stored on the active kit.
	 */
	public function site_settings( array $settings ): array;

	/**
	 * @param array<string, mixed> $settings      Settings in the shape {@see self::read()} returns.
	 * @param array<string, mixed> $site_settings Replaces the part stored on the active kit.
	 * @return array<string, mixed>
	 */
	public function with_site_settings( array $settings, array $site_settings ): array;
}
