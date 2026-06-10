<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Font_Enqueueable;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Plugin;
use Elementor\Utils;

class Styles_Renderer {
	const DEFAULT_SELECTOR_PREFIX = '.elementor';

	/**
	 * @var array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}>
	 */
	private array $breakpoints;

	private $on_font_enqueue;

	private string $selector_prefix;

	/**
	 * @param array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}> $breakpoints
	 * @param string                                                                          $selector_prefix
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
	 *     cssName: string | null,
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

	public function on_font_enqueue( callable $callback ): self {
		$this->on_font_enqueue = $callback;

		return $this;
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
			$name = $style_def['cssName'] ?? $style_def['id'];

			$selector_parts = array_filter( [
				$this->selector_prefix,
				"{$type}{$name}",
			] );

			return implode( ' ', $selector_parts );
		}

		return null;
	}

	private function variant_to_css_string( string $base_selector, array $variant ): string {
		$css = $this->props_to_css_string( $variant['props'] ) ?? '';
		$custom_css = $this->custom_css_to_css_string( $variant['custom_css'] ?? null );

		if ( ! $css && ! $custom_css ) {
			return '';
		}

		if ( isset( $variant['meta']['state'] ) ) {
			$selector = Style_States::get_selector_with_state( $base_selector, $variant['meta']['state'] );
		} else {
			$selector = $base_selector;
		}

		$style_declaration = $selector . '{' . $css . $custom_css . '}';

		if ( isset( $variant['meta']['breakpoint'] ) ) {
			$style_declaration = $this->wrap_with_media_query( $variant['meta']['breakpoint'], $style_declaration );
		}

		return $style_declaration;
	}


	private function props_to_css_string( array $props ): string {
		$schema = Style_Schema::get();

		return Collection::make( Render_Props_Resolver::for_styles()->resolve( $schema, $props ) )
			->filter()
			->map( function ( $value, $prop ) use ( $props, $schema ) {
				$this->maybe_enqueue_font( $schema, $prop, $props[ $prop ] ?? null );

				return $prop . ':' . $value . ';';
			} )
			->implode( '' );
	}

	private function maybe_enqueue_font( array $schema, string $prop_key, $prop_value ): void {
		if ( ! $this->on_font_enqueue || ! is_array( $prop_value ) || empty( $prop_value['value'] ) || ! empty( $prop_value['disabled'] ) ) {
			return;
		}

		$enqueueable = $this->resolve_font_enqueueable( $schema[ $prop_key ] ?? null, $prop_value );

		if ( ! $enqueueable ) {
			return;
		}

		$font = $enqueueable->get_enqueue_font_family( $prop_value['value'] );

		if ( $font ) {
			call_user_func( $this->on_font_enqueue, $font );
		}
	}

	private function resolve_font_enqueueable( ?Prop_Type $prop_type, array $prop_value ): ?Font_Enqueueable {
		if ( $prop_type instanceof Union_Prop_Type ) {
			$prop_type = $prop_type->get_prop_type( $prop_value['$$type'] ?? '' );
		}

		if ( $prop_type instanceof Font_Enqueueable ) {
			return $prop_type;
		}

		return null;
	}

	private function custom_css_to_css_string( ?array $custom_css ): string {
		return ! empty( $custom_css['raw'] )
			? Utils::decode_string( $custom_css['raw'], '' ) . '\n'
			: '';
	}

	private function wrap_with_media_query( string $breakpoint_id, string $css ): string {
		if ( ! isset( $this->breakpoints[ $breakpoint_id ] ) ) {
			return $css;
		}

		$breakpoint = $this->breakpoints[ $breakpoint_id ];
		if ( isset( $breakpoint['is_enabled'] ) && ! $breakpoint['is_enabled'] ) {
			return '';
		}

		$query = $this->get_media_query( $this->breakpoints[ $breakpoint_id ] );

		return $query ? $query . '{' . $css . '}' : $css;
	}

	public static function get_media_query( $breakpoint ): ?string {
		if ( isset( $breakpoint['is_enabled'] ) && ! $breakpoint['is_enabled'] ) {
			return null;
		}

		$size = self::get_breakpoint_size( $breakpoint );

		return $size ? '@media(' . $size . ')' : null;
	}

	private static function get_breakpoint_size( array $breakpoint ): ?string {
		$bound = 'min' === $breakpoint['direction'] ? 'min-width' : 'max-width';
		$width = $breakpoint['value'] . 'px';

		return "{$bound}:{$width}";
	}
}
