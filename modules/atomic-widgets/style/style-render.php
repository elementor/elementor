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
		$cssStyle = [];

		foreach ( $this->styles as $styleDef ) {
			$style = $this->render_style( $styleDef );
			$cssStyle[] = $style;
		}

		return implode( '', $cssStyle );
	}

	private function render_style( array $style ): string {
		$baseSelector = $this->get_base_selector( $style );

		if ( !$baseSelector ) {
			return '';
		}

		$stylesheet = [];

		foreach ( $style[ 'variants' ] as $variant ) {
			$styleDeclaration = $this->variant_to_style_declaration( $baseSelector, $variant );

			if ( $styleDeclaration ) {
				$stylesheet[] = $styleDeclaration;
			}
		}

		return implode( '', $stylesheet );
	}

	private function get_base_selector( array $styleDef ): string {
		$map = [
			'class' => '.',
		];

		return $map[ $styleDef[ 'type' ] ] . $styleDef[ 'id' ];
	}

	private function variant_to_style_declaration( string $baseSelector, array $variant ): string {
		$css = $this->props_to_css( $variant[ 'props' ] );

		if ( !$css ) {
			return '';
		}

		$state = isset( $variant[ 'meta' ][ 'state' ] ) ? ':' . $variant[ 'meta' ][ 'state' ] : '';
		$selector = $baseSelector . $state;

		$styleDeclaration = $selector . '{' . $css . '}';

		if ( isset( $variant[ 'meta' ][ 'breakpoint' ] ) ) {
			$styleDeclaration = $this->wrap_with_media_query( $variant[ 'meta' ][ 'breakpoint' ], $styleDeclaration );
		}

		return $styleDeclaration;
	}

	private function props_to_css( array $props ): string {
		$css = [];

		foreach ( $props as $cssProp => $cssValue ) {
			$prop = $this->camel_case_to_dash( $cssProp );
			$value = $this->transform_value( $cssValue );
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
		return isset( $breakpoint[ 'type' ] ) ? $breakpoint[ 'type' ] . ':' . $breakpoint[ 'width' ] . 'px' : null;
	}

	private function transform_value( $value ) {
		if ( is_array( $value ) ) {
			if (
				isset( $value[ '$$type' ] ) &&
				isset( $this->transformers[ $value[ '$$type' ] ] ) &&
				is_callable( $this->transformers[ $value[ '$$type' ] ] )
			) {
				return $this->transformers[ $value[ '$$type' ] ]( $value[ 'value' ] );
			}
			return 'unset';
		}
		return $value;
	}
}
