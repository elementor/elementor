<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Visibility;
use Elementor\Modules\Mcp\Abilities\Appliers\V3_Node_Bridge;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clears the style a map-driven widget exposes on read, so `replace` never deletes a setting
 * the agent could not see, such as one hidden by an inactive condition.
 */
class V3_Map_Style_Clearer {

	private V3_Map_Style_Reader $reader;

	public function __construct( ?V3_Map_Style_Reader $reader = null ) {
		$this->reader = $reader ?? new V3_Map_Style_Reader( V3_Control_Adapter_Registry::create_default() );
	}

	public function clear( array &$node, Compiled_V3_Map $map, string $widget_type ): void {
		$settings = is_array( $node['settings'] ?? null ) ? $node['settings'] : [];
		$keys = $this->reader->readable_keys(
			$map,
			$settings,
			V3_Widget_Map_Registry::instance()->get_registered_controls( $widget_type ),
			V3_Control_Visibility::for_widget( $widget_type )
		);
		$links = is_array( $settings[ V3_Settings_Patch::GLOBALS_KEY ] ?? null ) ? $settings[ V3_Settings_Patch::GLOBALS_KEY ] : [];
		$cleared = array_flip( $keys );

		$user_css = implode( "\n", $this->user_css_rules( $settings, $map ) );

		$settings = array_diff_key( $settings, $cleared );
		$links = array_diff_key( $links, $cleared );
		unset( $settings[ V3_Settings_Patch::GLOBALS_KEY ], $settings[ V3_Node_Bridge::V3_CUSTOM_CSS_SETTING ] );

		if ( ! empty( $links ) ) {
			$settings[ V3_Settings_Patch::GLOBALS_KEY ] = $links;
		}

		if ( '' !== $user_css ) {
			$settings[ V3_Node_Bridge::V3_CUSTOM_CSS_SETTING ] = $user_css;
		}

		$node['settings'] = $settings;
	}

	/**
	 * Custom CSS rules outside every style target, which the read returns as written.
	 *
	 * @return string[]
	 */
	public static function user_css_rules( array $settings, Compiled_V3_Map $map ): array {
		$custom_css = $settings[ V3_Node_Bridge::V3_CUSTOM_CSS_SETTING ] ?? '';

		return is_string( $custom_css ) ? V3_Custom_Css_Fallback::for_map( $map )->parse( $custom_css )['unmatched'] : [];
	}
}
