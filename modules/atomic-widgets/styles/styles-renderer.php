<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

/**
 * @typedef array{
 *     type: string,
 *     width: int
 * } Breakpoint
 */

class Styles_Renderer {

	private array $transformers;

	private array $breakpoints;

	/**
	 * Styles_Renderer constructor.
	 *
	 * @param $transformers array<string, callable> Style transformers
	 * @param $breakpoints array<int, array{type: string, width: int}> Screen breakpoints
	 */
	public function __construct( array $transformers, array $breakpoints ) {
		$this->transformers = $transformers;
		$this->breakpoints = $breakpoints;
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

		if ( isset(
			$style_def['type'],
			$style_def['id'],
			$map[ $style_def['type'] ]
		) && $style_def['id'] ) {
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
		$css = [];

		foreach ( $props as $prop => $raw_value ) {
			$prop = $this->camel_case_to_dash( $prop );
			$value = $this->transform_value( $raw_value );

			if ( $prop && $value ) {
				$css[] = $prop . ':' . $value;
			}
		}

		return implode( ';', $css );
	}

	private function camel_case_to_dash( string $str ): string {
		return strtolower( preg_replace( '/([a-zA-Z])(?=[A-Z])/', '$1-', $str ) );
	}

	private function wrap_with_media_query( string $breakpoint, string $css ): string {
		if ( ! isset( $this->breakpoints[ $breakpoint ] ) ) {
			return $css;
		}

		$size = $this->get_breakpoint_size( $this->breakpoints[ $breakpoint ] );

		return $size ? '@media(' . $size . '){' . $css . '}' : $css;
	}

	private function get_breakpoint_size( array $breakpoint ): ?string {
		return isset( $breakpoint['type'] )
			? $breakpoint['type'] . ':' . $breakpoint['width'] . 'px'
			: null;
	}

	private function transform_value( $value ): ?string {
		if ( ! $this->is_transformable( $value ) && is_string( $value ) ) {
			return $value;
		}

		$transformer = $this->get_transformer( $value['$$type'] );

		if ( $transformer ) {
			$transformed = $transformer( $value['value'] );
			return $this->transform_value( $transformed );
		}

		return 'unset';
	}

	private function is_transformable( $value ): bool {
		return (
			isset( $value['$$type'], $value['value'] ) &&
			is_string( $value['$$type'] )
		);
	}

	private function get_transformer( $type ): ?callable {
		if ( isset( $this->transformers[ $type ] ) ) {
			$transformer = $this->transformers[ $type ];

			if ( $transformer && is_callable( $transformer ) ) {
				return $transformer;
			}
		}

		return null;
	}
}
