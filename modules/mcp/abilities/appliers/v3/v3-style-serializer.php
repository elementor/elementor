<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Custom_Css_Fallback;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Style_Reader;
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
	private V3_Map_Style_Reader $map_reader;

	/**
	 * @var array<string, string>|null
	 */
	private ?array $fallback_media_queries;

	/**
	 * @param V3_Serializer_Registry|null $registry
	 * @param Block_Renderer|null         $renderer
	 * @param V3_Map_Style_Reader|null    $map_reader
	 * @param array<string, string>|null  $fallback_media_queries Breakpoint name => media query; the site breakpoints when null.
	 */
	public function __construct( ?V3_Serializer_Registry $registry = null, ?Block_Renderer $renderer = null, ?V3_Map_Style_Reader $map_reader = null, ?array $fallback_media_queries = null ) {
		$this->registry = $registry ?? V3_Serializer_Registry_Factory::create();
		$this->renderer = $renderer ?? new Block_Renderer();
		$this->map_reader = $map_reader ?? new V3_Map_Style_Reader( V3_Control_Adapter_Registry::create_default() );
		$this->fallback_media_queries = $fallback_media_queries;
	}

	public function serialize( array $settings, string $widget_type, array $widget_config ): string {
		$map_registry = V3_Widget_Map_Registry::instance();
		$map = $map_registry->get_map( $widget_type );
		$blocks = new V3_Block_Accumulator();

		if ( null !== $map ) {
			$target_blocks = $this->map_reader->read(
				$map,
				$settings,
				$map_registry->get_registered_controls( $widget_type ),
				V3_Control_Visibility::for_widget( $widget_type )
			);

			$custom_css = is_string( $settings['custom_css'] ?? null ) ? $settings['custom_css'] : '';

			if ( '' === trim( $custom_css ) ) {
				return $this->renderer->render_targets( $target_blocks, $map->get_default_target() );
			}

			$fallback = new V3_Custom_Css_Fallback(
				V3_Custom_Css_Fallback::selectors_of( $map ),
				$this->fallback_media_queries ?? V3_Custom_Css_Fallback::site_media_queries()
			);

			$this->push_fallback_rules( $target_blocks, $fallback->read( $custom_css ) );

			return $this->join_css( $this->renderer->render_targets( $target_blocks, $map->get_default_target() ), $fallback->read_verbatim( $custom_css ) );
		}

		$overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );
		$controls = $widget_config['controls'] ?? [];
		$generic = V3_Style_Settings_Index::build( is_array( $controls ) ? $controls : [], $overrides );

		foreach ( $overrides as $match_key => $entry ) {
			[ $property, $state ] = $this->split_match_key( (string) $match_key );
			$this->dispatch_entry( $blocks, $settings, $entry, $property, $state );
		}

		foreach ( $generic as $match_key => $entry ) {
			[ $property, $state ] = $this->split_match_key( (string) $match_key );
			$this->dispatch_entry( $blocks, $settings, $entry, $property, $state );
		}

		return $this->join_css( $this->renderer->render( $blocks ), $this->unwrap_custom_css( $settings['custom_css'] ?? null ) );
	}

	private function join_css( string $mapped_css, string $custom_css ): string {
		if ( '' === $mapped_css ) {
			return $custom_css;
		}

		if ( '' === $custom_css ) {
			return $mapped_css;
		}

		return $mapped_css . ' ' . $custom_css;
	}

	/**
	 * @param array<string, V3_Block_Accumulator> $target_blocks
	 * @param array[]                             $rules {@see V3_Custom_Css_Fallback::read()}.
	 */
	private function push_fallback_rules( array $target_blocks, array $rules ): void {
		foreach ( $rules as $rule ) {
			foreach ( $rule['declarations'] as $property => $value ) {
				$target_blocks[ $rule['target'] ]->push( $rule['breakpoint'], $rule['state'], (string) $property, $value );
			}
		}
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
