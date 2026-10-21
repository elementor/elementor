<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Where the style settings of a map-driven element are stored: the element itself, or the active
 * kit for maps that style site-wide Site Settings ({@see V3_Widget_Map::kit_tab()}).
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
}
