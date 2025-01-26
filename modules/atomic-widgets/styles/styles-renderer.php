<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver;

class Styles_Renderer {
	const DEFAULT_SELECTOR_PREFIX = '.elementor';

	/**
	 * @var array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}>
	 */
	private array $breakpoints;

	private string $selector_prefix;

	/**
	 * @param array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}> $breakpoints
	 * @param string $selector_prefix
	 */
	private function __construct( array $breakpoints, string $selector_prefix = self::DEFAULT_SELECTOR_PREFIX ) {
		$this->breakpoints = $breakpoints;
		$this->selector_prefix = $selector_prefix;
	}

	public static function make( array $breakpoints, string $selector_prefix = self::DEFAULT_SELECTOR_PREFIX ): self {
		return new self( $breakpoints, $selector_prefix );
	}

	/**
	 * Render the styles to a CSS string.
	 *
	 * Styles format:
	 *   array<int, array{
	 *     id: string,
	 *     type: string,
	 *     variants: array<int, array{
	 *         props: array<string, mixed>,
	 *         meta: array<string, mixed>
	 *     }>
	 *   }>
	 *
	 * @param array $styles Array of style definitions.
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
			$type = $map[ $style_def['type'] ];
			$id = $style_def['id'];

			$selector_parts = array_filter( [
				$this->selector_prefix,
				"{$type}{$id}",
			] );

			return implode( ' ', $selector_parts );
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
