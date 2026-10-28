<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Settings\Page\Manager as Page_Manager;
use Elementor\Modules\Mcp\Abilities\Appliers\V3_Node_Bridge;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads and writes map style settings on the active kit. Writes wait for the edited document to
 * save, so a dry run or a failed save leaves the site untouched, and then save the kit, which
 * regenerates the kit CSS.
 *
 * The kit custom CSS is the site's own stylesheet, so it is kept out of the settings a map sees.
 */
class Kit_Settings_Host implements V3_Map_Settings_Host {

	const FLUSH_ACTION = 'elementor/document/after_save';

	const EXCLUDED_SETTINGS = [ V3_Node_Bridge::V3_CUSTOM_CSS_SETTING ];

	/**
	 * @var array<int, array{original: array<string, mixed>, settings: array<string, mixed>}> Kit ID => settings read before the first write, and after the last one.
	 */
	private static array $pending = [];

	public function read( array $node ): array {
		$kit_id = self::kit_id();

		return self::$pending[ $kit_id ]['settings'] ?? self::saved_view( $kit_id );
	}

	public function write( array &$node, array $settings ): void {
		$kit_id = self::kit_id();

		self::$pending[ $kit_id ] = [
			'original' => self::$pending[ $kit_id ]['original'] ?? self::saved_view( $kit_id ),
			'settings' => $settings,
		];

		if ( false === has_action( self::FLUSH_ACTION, [ self::class, 'flush' ] ) ) {
			add_action( self::FLUSH_ACTION, [ self::class, 'flush' ] );
		}
	}

	public function site_settings( array $settings ): array {
		return $settings;
	}

	public function with_site_settings( array $settings, array $site_settings ): array {
		return $site_settings;
	}

	public static function can_write(): bool {
		return current_user_can( 'edit_theme_options' );
	}

	/**
	 * Settings other code saved on the kit since the read are kept; only keys the map wrote or
	 * removed change.
	 */
	public static function flush(): void {
		$pending = self::$pending;
		self::$pending = [];

		foreach ( $pending as $kit_id => $change ) {
			$kit = Plugin::$instance->documents->get( $kit_id, false );

			if ( ! $kit instanceof Kit ) {
				continue;
			}

			$removed = array_diff_key( $change['original'], $change['settings'] );
			$settings = array_merge( array_diff_key( self::saved( $kit_id ), $removed ), $change['settings'] );

			$kit->save( [ 'settings' => $settings ] );
		}
	}

	public static function discard_pending(): void {
		self::$pending = [];
	}

	private static function kit_id(): int {
		return (int) Plugin::$instance->kits_manager->get_active_id();
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function saved_view( int $kit_id ): array {
		return array_diff_key( self::saved( $kit_id ), array_flip( self::EXCLUDED_SETTINGS ) );
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function saved( int $kit_id ): array {
		$settings = get_post_meta( $kit_id, Page_Manager::META_KEY, true );

		return is_array( $settings ) ? $settings : [];
	}
}
