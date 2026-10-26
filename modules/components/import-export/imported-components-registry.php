<?php

namespace Elementor\Modules\Components\ImportExport;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Keeps per-request state about components imported so far, keyed by their source-site post id,
 * so components imported later (dependency order) can resolve ids that live in a nested one.
 */
class Imported_Components_Registry {
	private static array $element_id_maps = [];

	private static array $overridable_props = [];

	public static function add( int $source_id, array $element_id_map, array $overridable_props ): void {
		self::$element_id_maps[ $source_id ] = $element_id_map;
		self::$overridable_props[ $source_id ] = $overridable_props;
	}

	public static function get_element_id_maps(): array {
		return self::$element_id_maps;
	}

	public static function get_overridable_props(): array {
		return self::$overridable_props;
	}

	public static function reset(): void {
		self::$element_id_maps = [];
		self::$overridable_props = [];
	}
}
