<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver;

class Styles_Renderer {
	/**
	 * @var array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}> $breakpoints
	 */
	private array $breakpoints;

	/**
	 * Styles_Renderer constructor.
	 *
	 * @param array{
	 *     breakpoints: array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}>
	 * } $config
	 */
	public function __construct( array $config ) {
		$this->breakpoints = $config['breakpoints'];
	}

	public static function make( array $config ): self {
		return new self( $config );
	}

	/**
	 * Render the styles to a CSS string.
	 *
	 * @param array<int, array{
	 *     id: string,
	 *     type: string,
	 *     variants: array<int, array{
	 *         props: array<string, mixed>,
	 *         meta: array<string, mixed>
	 *     }>
	 * }> $styles Array of style definitions.
	 *
	 * @return string Rendered CSS string.
	 */
	public function render( array $styles ): string {
		$css_style = [];

		foreach ( $styles as $style_def ) {
			$style = $this->style_definition_to_css_string( $style_def );
			$css_style[] = $style;
		}

		return implode( '', $css_style );
	}

	private function style_definition_to_css_string( array $style ): string {
		$base_selector = $this->get_base_selector( $style );

		if ( ! $base_selector ) {
			return '';
		}

		$stylesheet = [];

		foreach ( $style['variants'] as $variant ) {
			$style_declaration = $this->variant_to_css_string( $base_selector, $variant );

			if ( $style_declaration ) {
				$stylesheet[] = $style_declaration;
			}
		}

		return implode( '', $stylesheet );
	}

	private function get_base_selector( array $style_def ): ?string {
		$map = [
			'class' => '.',
		];

		if (
			isset( $style_def['type'] ) &&
			isset( $style_def['id'] ) &&
			isset( $map[ $style_def['type'] ] ) &&
			$style_def['id']
		) {
			return $map[ $style_def['type'] ] . $style_def['id'];
		}

		return null;
	}

	private function variant_to_css_string( string $base_selector, array $variant ): string {
		$css = $this->props_to_css_string( $variant['props'] );

		if ( ! $css ) {
			return '';
		}

		$state = isset( $variant['meta']['state'] ) ? ':' . $variant['meta']['state'] : '';
		$selector = $base_selector . $state;

		$style_declaration = $selector . '{' . $css . '}';

		if ( isset( $variant['meta']['breakpoint'] ) ) {
			$style_declaration = $this->wrap_with_media_query( $variant['meta']['breakpoint'], $style_declaration );
		}

		return $style_declaration;
	}

	private function props_to_css_string( array $props ): string {
		$schema = Style_Schema::get();

		return Collection::make( Props_Resolver::for_styles()->resolve( $schema, $props ) )
			->filter()
			->map( function ( $value, $prop ) {
				return $prop . ':' . $value . ';';
			} )
			->implode( '' );
	}

	private function wrap_with_media_query( string $breakpoint_id, string $css ): string {
		if ( ! isset( $this->breakpoints[ $breakpoint_id ] ) ) {
			return $css;
		}

		$breakpoint = $this->breakpoints[ $breakpoint_id ];
		if ( isset( $breakpoint['is_enabled'] ) && ! $breakpoint['is_enabled'] ) {
			return '';
		}

		$size = $this->get_breakpoint_size( $this->breakpoints[ $breakpoint_id ] );

		return $size ? '@media(' . $size . '){' . $css . '}' : $css;
	}

	private function get_breakpoint_size( array $breakpoint ): ?string {
		$bound = 'min' === $breakpoint['direction'] ? 'min-width' : 'max-width';
		$width = $breakpoint['value'] . 'px';

		return "{$bound}:{$width}";
	}
}
