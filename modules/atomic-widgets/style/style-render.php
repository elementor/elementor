<?php

namespace Elementor\Modules\AtomicWidgets\Style;

class Style_Render {
	private array $styles;
	private array $transformers;
	private array $breakpoints;

	public function __construct( array $styles, array $transformers, array $breakpoints ) {
		$this->styles = $styles;
		$this->transformers = $transformers;
		$this->breakpoints = $breakpoints;
	}

	public function render(): string {
		$css_style = [];

		foreach ( $this->styles as $style_def ) {
			$style = $this->render_style( $style_def );
			$css_style[] = $style;
		}

		return implode( '', $css_style );
	}

	private function render_style( array $style ): string {
		$base_selector = $this->get_base_selector( $style );

		if ( ! $base_selector ) {
			return '';
		}

		$stylesheet = [];

		foreach ( $style['variants'] as $variant ) {
			$style_declaration = $this->variant_to_style_declaration( $base_selector, $variant );

			if ( $style_declaration ) {
				$stylesheet[] = $style_declaration;
			}
		}

		return implode( '', $stylesheet );
	}

	private function get_base_selector( array $style_def ): string {
		$map = [
			'class' => '.',
		];

		return $map[ $style_def['type'] ] . $style_def['id'];
	}

	private function variant_to_style_declaration( string $base_selector, array $variant ): string {
		$css = $this->props_to_css( $variant['props'] );

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

	private function props_to_css( array $props ): string {
		$css = [];

		foreach ( $props as $css_prop => $css_value ) {
			$prop = $this->camel_case_to_dash( $css_prop );
			$value = $this->transform_value( $css_value );
			$css[] = $prop . ':' . $value;
		}

		return implode( ';', $css );
	}

	private function camel_case_to_dash( string $str ): string {
		return strtolower( preg_replace( '/([a-zA-Z])(?=[A-Z])/', '$1-', $str ) );
	}

	private function wrap_with_media_query( string $breakpoint, string $css ): string {
		$size = $this->get_breakpoint_size( $this->breakpoints[ $breakpoint ] );
		return $size ? '@media(' . $size . '){' . $css . '}' : $css;
	}

	private function get_breakpoint_size( array $breakpoint ): ?string {
		return isset( $breakpoint['type'] ) ? $breakpoint['type'] . ':' . $breakpoint['width'] . 'px' : null;
	}

	private function transform_value( $value ) {
		if ( is_array( $value ) ) {
			if (
				isset( $value['$$type'] ) &&
				isset( $this->transformers[ $value['$$type'] ] ) &&
				is_callable( $this->transformers[ $value['$$type'] ] )
			) {
				return $this->transformers[ $value['$$type'] ]( $value['value'] );
			}
			return 'unset';
		}
		return $value;
	}
}
