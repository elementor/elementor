<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

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
 *
 * Widgets with inner elements are serialized scope by scope — wrapper declarations first,
 * then one `alias { ... }` block per inner element — so the result can be fed straight back
 * into the write path. Flattening every scope into one block would be lossy: two scopes can
 * map the same property (`color` on both the menu item and the dropdown) to different
 * settings, and the reader could not tell which one a declaration came from.
 */
class V3_Style_Serializer {

	private V3_Serializer_Registry $registry;
	private Block_Renderer $renderer;

	public function __construct( ?V3_Serializer_Registry $registry = null, ?Block_Renderer $renderer = null ) {
		$this->registry = $registry ?? V3_Serializer_Registry_Factory::create();
		$this->renderer = $renderer ?? new Block_Renderer();
	}

	public function serialize( array $settings, string $widget_type, array $widget_config ): string {
		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
		$map = V3_Widget_Map_Loader::get( $widget_type, $controls );
		$parts = [];

		if ( empty( $map['inner_elements'] ) ) {
			$wrapper_css = $this->serialize_scope(
				$settings,
				$widget_config,
				[
					'setting_keys' => array_keys( $controls ),
					'style_overrides' => $map['wrapper']['style_overrides'],
				]
			);
		} else {
			$wrapper_css = $this->serialize_scope( $settings, $widget_config, $map['wrapper'] );

			foreach ( $map['inner_elements'] as $alias => $scope ) {
				$scope_css = $this->serialize_scope( $settings, $widget_config, $scope, (string) $alias );
				if ( '' !== $scope_css ) {
					$parts[] = $scope_css;
				}
			}
		}

		if ( '' !== $wrapper_css ) {
			array_unshift( $parts, $wrapper_css );
		}

		$mapped_css = implode( ' ', $parts );
		$custom_css = $this->unwrap_custom_css( $settings['custom_css'] ?? null );

		if ( '' === $mapped_css ) {
			return $custom_css;
		}

		if ( '' === $custom_css ) {
			return $mapped_css;
		}

		return $mapped_css . ' ' . $custom_css;
	}

	private function serialize_scope( array $settings, array $widget_config, array $scope, ?string $alias = null ): string {
		$mapping = V3_Auto_Mapper::for_scope( $widget_config, $scope );
		$blocks = new V3_Block_Accumulator();

		foreach ( $mapping['overrides'] as $match_key => $entry ) {
			[ $property, $state ] = $this->split_match_key( (string) $match_key );
			$this->dispatch_entry( $blocks, $settings, $entry, $property, $state );
		}

		foreach ( $mapping['generic_index'] as $match_key => $entry ) {
			[ $property, $state ] = $this->split_match_key( (string) $match_key );
			$this->dispatch_entry( $blocks, $settings, $entry, $property, $state );
		}

		if ( null !== $alias ) {
			return $this->renderer->render_scoped( $alias, $blocks );
		}

		return $this->renderer->render( $blocks );
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
