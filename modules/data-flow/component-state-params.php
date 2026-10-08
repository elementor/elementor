<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Modules\Components\Components_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_State_Params {
	/**
	 * @return array{params: array, duplicate_keys: string[]}
	 */
	public static function get( int $component_id, bool $include_autosave = false ): array {
		$component = ( new Components_Repository() )->get( $component_id, $include_autosave );
		$elements = $component ? $component->get_elements_data() : [];

		return self::from_elements( is_array( $elements ) ? $elements : [] );
	}

	public static function get_all_params(): array {
		$params_by_component = [];

		foreach ( ( new Components_Repository() )->all()->all() as $component ) {
			$params = self::get( (int) $component['id'], true )['params'];

			if ( ! empty( $params ) ) {
				$params_by_component[ $component['id'] ] = $params;
			}
		}

		return $params_by_component;
	}

	/**
	 * @return array{params: array, duplicate_keys: string[]}
	 */
	public static function from_elements( array $root_elements ): array {
		return State_Params::merge_roots( array_map(
			fn( $root ) => State_Params::sanitize( is_array( $root ) ? ( $root[ State_Params::DATA_KEY ] ?? [] ) : [] ),
			$root_elements
		) );
	}
}
