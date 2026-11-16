<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stores the kit keys, and their global links, on the active kit and every other setting on the
 * element, for widgets whose own targets sit next to kit-hosted ones.
 */
class Split_Settings_Host implements V3_Map_Settings_Host {

	/**
	 * @var array<string, int>
	 */
	private array $kit_keys;

	private Node_Settings_Host $node_host;

	private Kit_Settings_Host $kit_host;

	/**
	 * @param string[] $kit_keys
	 */
	public function __construct( array $kit_keys ) {
		$this->kit_keys = array_flip( $kit_keys );
		$this->node_host = new Node_Settings_Host();
		$this->kit_host = new Kit_Settings_Host();
	}

	public function read( array $node ): array {
		return $this->with_site_settings( $this->node_host->read( $node ), $this->site_settings( $this->kit_host->read( $node ) ) );
	}

	public function write( array &$node, array $settings ): void {
		$this->node_host->write( $node, $this->with_site_settings( $settings, [] ) );

		$site_settings = $this->site_settings( $settings );
		$kit_settings = $this->kit_host->read( $node );

		if ( $this->site_settings( $kit_settings ) === $site_settings ) {
			return;
		}

		$this->kit_host->write( $node, $this->with_site_settings( $kit_settings, $site_settings ) );
	}

	public function site_settings( array $settings ): array {
		$site_settings = array_intersect_key( $settings, $this->kit_keys );
		$site_globals = array_intersect_key( self::globals( $settings ), $this->kit_keys );

		return self::with_globals( $site_settings, $site_globals );
	}

	public function with_site_settings( array $settings, array $site_settings ): array {
		$own_settings = array_diff_key( $settings, $this->kit_keys, [ V3_Settings_Patch::GLOBALS_KEY => true ] );
		$own_globals = array_diff_key( self::globals( $settings ), $this->kit_keys );
		$merged = array_merge( $own_settings, array_diff_key( $site_settings, [ V3_Settings_Patch::GLOBALS_KEY => true ] ) );

		return self::with_globals( $merged, array_merge( $own_globals, self::globals( $site_settings ) ) );
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function globals( array $settings ): array {
		$globals = $settings[ V3_Settings_Patch::GLOBALS_KEY ] ?? [];

		return is_array( $globals ) ? $globals : [];
	}

	private static function with_globals( array $settings, array $globals ): array {
		if ( ! empty( $globals ) ) {
			$settings[ V3_Settings_Patch::GLOBALS_KEY ] = $globals;
		}

		return $settings;
	}
}
