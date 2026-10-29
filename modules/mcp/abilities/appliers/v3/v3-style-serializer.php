<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Compiled_V3_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Custom_Css_Fallback;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Style_Reader;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Block_Renderer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serializes a V3 widget's flat style settings back into a CSS string that
 * V3_Style_Mapper can consume, through the widget's compiled map. Reverse of V3_Style_Mapper.
 *
 * The output is grouped by breakpoint / pseudo-state to match what the write path
 * expects: base declarations, then `&:hover|focus|active { ... }`, then
 * `@media(--breakpoint) { ... }` blocks with the same nesting inside.
 */
class V3_Style_Serializer {

	private Block_Renderer $renderer;
	private V3_Map_Style_Reader $map_reader;

	public function __construct( ?Block_Renderer $renderer = null, ?V3_Map_Style_Reader $map_reader = null ) {
		$this->renderer = $renderer ?? new Block_Renderer();
		$this->map_reader = $map_reader ?? new V3_Map_Style_Reader( V3_Control_Adapter_Registry::create_default() );
	}

	/**
	 * Breakpoints come from the active kit, so they are only loaded when there is CSS to parse.
	 *
	 * @param Compiled_V3_Map $map
	 * @param mixed           $custom_css
	 * @return array{rules: array, unmatched: string[]}
	 */
	private function parse_custom_css( Compiled_V3_Map $map, $custom_css ): array {
		if ( ! is_string( $custom_css ) || '' === trim( $custom_css ) ) {
			return [
				'rules' => [],
				'unmatched' => [],
			];
		}

		return V3_Custom_Css_Fallback::for_map( $map )->parse( $custom_css );
	}

	public function serialize( array $settings, string $widget_type ): string {
		$map_registry = V3_Widget_Map_Registry::instance();
		$map = $map_registry->get_map( $widget_type );

		if ( null === $map ) {
			return '';
		}

		$target_blocks = $this->map_reader->read(
			$map,
			$settings,
			$map_registry->get_registered_controls( $widget_type ),
			V3_Control_Visibility::for_widget( $widget_type )
		);

		$custom_css = $this->parse_custom_css( $map, $settings['custom_css'] ?? null );
		$custom_media_css = $this->push_fallback_rules( $target_blocks, $custom_css['rules'], $map->get_default_target() );
		$mapped_css = $this->join_css( $this->renderer->render_targets( $target_blocks, $map->get_default_target() ), $custom_media_css );

		return $this->join_css( $mapped_css, implode( ' ', $custom_css['unmatched'] ) );
	}

	/**
	 * Fallback rules read back inside their target's block, like V4 renders a variant's custom CSS
	 * with its props. Rules under a media query that is not a site breakpoint render in their own
	 * `@media` block, which is returned.
	 *
	 * @param array<string, V3_Block_Accumulator> $target_blocks
	 * @param array[]                             $rules         {@see V3_Custom_Css_Fallback::parse()} rules.
	 * @param string                              $default_target
	 */
	private function push_fallback_rules( array $target_blocks, array $rules, string $default_target ): string {
		$custom_media_blocks = [];

		foreach ( $rules as $rule ) {
			$media = $rule['media'] ?? null;

			if ( null !== $media ) {
				$custom_media_blocks[ $media ][ $rule['target'] ] ??= new V3_Block_Accumulator();
			}

			$blocks = null === $media ? $target_blocks[ $rule['target'] ] : $custom_media_blocks[ $media ][ $rule['target'] ];

			foreach ( $rule['declarations'] as $property => $value ) {
				$blocks->push( $rule['breakpoint'], $rule['state'], (string) $property, (string) $value );
			}
		}

		$custom_media_css = [];

		foreach ( $custom_media_blocks as $media => $media_target_blocks ) {
			$custom_media_css[] = sprintf( '@media %s { %s }', $media, $this->renderer->render_targets( $media_target_blocks, $default_target ) );
		}

		return implode( ' ', $custom_media_css );
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
}
