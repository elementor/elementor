<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Serializer_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Serializer_Registry_Factory;
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
		$overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );
		$controls = $widget_config['controls'] ?? [];
		$generic = V3_Style_Settings_Index::build( is_array( $controls ) ? $controls : [], $overrides );

		$blocks = new V3_Block_Accumulator();

		foreach ( $overrides as $match_key => $entry ) {
			[ $property, $state ] = $this->split_match_key( (string) $match_key );
			$this->dispatch_entry( $blocks, $settings, $entry, $property, $state );
		}

		foreach ( $generic as $match_key => $entry ) {
			[ $property, $state ] = $this->split_match_key( (string) $match_key );
			$this->dispatch_entry( $blocks, $settings, $entry, $property, $state );
		}

		return $this->renderer->render( $blocks );
	}

	private function dispatch_entry( V3_Block_Accumulator $blocks, array $settings, array $entry, string $property, ?string $state ): void {
		foreach ( $this->registry->all() as $serializer ) {
			if ( ! $serializer->is_supported( $entry, $property, $state ) ) {
				continue;
			}

			$serializer->emit( $blocks, $settings, $entry, $property, $state );

			return;
		}
	}

	/**
	 * @return array{0: string, 1: string|null}
	 */
	private function split_match_key( string $match_key ): array {
		if ( false === strpos( $match_key, '@' ) ) {
			return [ $match_key, null ];
		}

		[ $property, $state ] = explode( '@', $match_key, 2 );

		return [ $property, '' === $state ? null : $state ];
	}
}
