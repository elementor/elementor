<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Overrides_Builder;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Serializer_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Serializer_Registry_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Block_Renderer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serializes a V3 widget's flat style settings back into a CSS string that
 * V3_Style_Mapper can consume. Reverse of V3_Style_Mapper.
 *
 * The output is grouped by breakpoint / pseudo-state to match what the write path
 * expects: base declarations, then `&:hover|focus|active { ... }`, then
 * `@media(--breakpoint) { ... }` blocks with the same nesting inside.
 */
class V3_Style_Serializer {

	private V3_Serializer_Registry $registry;
	private Block_Renderer $renderer;

	public function __construct( ?V3_Serializer_Registry $registry = null, ?Block_Renderer $renderer = null ) {
		$this->registry = $registry ?? V3_Serializer_Registry_Factory::create();
		$this->renderer = $renderer ?? new Block_Renderer();
	}

	public function serialize( array $settings, string $widget_type, array $widget_config ): string {
		$map_overrides = V3_Widget_Map_Registry::instance()->get_style_overrides_from_map( $widget_type );
		$is_map_driven = null !== $map_overrides;
		$overrides = $map_overrides ?? V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );
		$controls = $widget_config['controls'] ?? [];
		$generic = $is_map_driven
			? []
			: V3_Style_Settings_Index::build( is_array( $controls ) ? $controls : [], $overrides );

		$blocks = new V3_Block_Accumulator();
		$routing = $is_map_driven ? V3_Widget_Map_Registry::instance()->get_style_routing( $widget_type ) : null;
		$default_target = $routing['default_target'] ?? null;

		foreach ( $overrides as $match_key => $entry ) {
			[ $target, $property, $state ] = V3_Map_Overrides_Builder::split_match_key( (string) $match_key );
			$target_blocks = $blocks->for_target( $target === $default_target ? null : $target );
			$this->dispatch_entry( $target_blocks, $settings, $entry, $property, $state );
		}

		foreach ( $generic as $match_key => $entry ) {
			[ , $property, $state ] = V3_Map_Overrides_Builder::split_match_key( (string) $match_key );
			$this->dispatch_entry( $blocks, $settings, $entry, $property, $state );
		}

		$mapped_css = $this->renderer->render( $blocks );

		if ( $is_map_driven ) {
			return $mapped_css;
		}

		$custom_css = $this->unwrap_custom_css( $settings['custom_css'] ?? null );

		if ( '' === $mapped_css ) {
			return $custom_css;
		}

		if ( '' === $custom_css ) {
			return $mapped_css;
		}

		return $mapped_css . ' ' . $custom_css;
	}

	/**
	 * @param mixed $custom_css
	 */
	private function unwrap_custom_css( $custom_css ): string {
		if ( ! is_string( $custom_css ) ) {
			return '';
		}

		$custom_css = trim( $custom_css );
		if ( '' === $custom_css ) {
			return '';
		}

		if ( preg_match( '/^\s*selector\s*\{\s*([\s\S]*?)\s*\}\s*$/i', $custom_css, $matches ) ) {
			return trim( $matches[1] );
		}

		return $custom_css;
	}

	private function dispatch_entry( V3_Block_Accumulator $blocks, array $settings, array $entry, string $property, ?string $state ): void {
		if ( false === ( $entry['_map_descriptor']['readback'] ?? true ) ) {
			return;
		}

		foreach ( $this->registry->all() as $serializer ) {
			if ( ! $serializer->is_supported( $entry, $property, $state ) ) {
				continue;
			}

			$serializer->emit( $blocks, $settings, $entry, $property, $state );

			return;
		}
	}
}
