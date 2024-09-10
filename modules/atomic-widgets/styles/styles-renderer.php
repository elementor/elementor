<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Base\Style_Transformer_Base;

class Styles_Renderer {

	/**
	 * @var array<string, Style_Transformer_Base> $transformers
	 */
	private array $transformers;

	/**
	 * @var array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}> $breakpoints
	 */
	private array $breakpoints;

	/**
	 * Styles_Renderer constructor.
	 *
	 * @param array{
	 *     transformers: array<string, Style_Transformer_Base>,
	 *     breakpoints: array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}>
	 * } $config
	 */
	public function __construct( array $config ) {
		$this->transformers = $config['transformers'];
		$this->breakpoints = $config['breakpoints'];
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

	private function transform_value( $value ): ?string {
		if ( is_string( $value ) ) {
			return $value;
		}

		if ( ! $this->is_transformable( $value ) ) {
			return 'unset';
		}

		$transformer = $this->get_transformer( $value['$$type'] );

		if ( ! $transformer ) {
			return 'unset';
		}

		try {
			$transformed = $transformer->transform(
				$value['value'],
				fn( $value ) => $this->transform_value( $value )
			);

			return $this->transform_value( $transformed );

		} catch ( \Exception $e ) {
			return 'unset';
		}
	}

	private function is_transformable( $value ): bool {
		return (
			isset( $value['$$type'], $value['value'] ) &&
			is_string( $value['$$type'] )
		);
	}

	private function get_transformer( $type ): ?Style_Transformer_Base {
		if ( ! isset( $this->transformers[ $type ] ) ) {
			return null;
		}

		$transformer = $this->transformers[ $type ];

		if ( ! $transformer instanceof Style_Transformer_Base ) {
			return null;
		}

		return $transformer;
	}
}
