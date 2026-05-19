<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;

class Styles_Renderer {
	const DEFAULT_SELECTOR_PREFIX = '.elementor';

	/**
	 * @var array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}>
	 */
	private array $breakpoints;

	private $on_prop_transform;

	private string $selector_prefix;

	/**
	 * @var array<string, array>
	 */
	private array $dynamic_placeholders = [];

	private Scoped_Dynamic_Css_Emitter $scoped_dynamic_emitter;

	/**
	 * @param array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}> $breakpoints
	 * @param string                                                                          $selector_prefix
	 */
	private function __construct( array $breakpoints, string $selector_prefix = self::DEFAULT_SELECTOR_PREFIX ) {
		$this->breakpoints = $breakpoints;
		$this->selector_prefix = $selector_prefix;
		$this->scoped_dynamic_emitter = new Scoped_Dynamic_Css_Emitter();
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

	public function on_prop_transform( callable $callback ): self {
		$this->on_prop_transform = $callback;

		return $this;
	}

	public function get_dynamic_placeholders(): array {
		return $this->dynamic_placeholders;
	}

	private function style_definition_to_css_string( array $style ): string {
		$base_selector = $this->get_base_selector( $style );

		if ( ! $base_selector ) {
			return '';
		}

		$class_id = $style['id'] ?? '';
		$stylesheet = [];

		foreach ( $style['variants'] as $variant_index => $variant ) {
			$style_declaration = $this->variant_to_css_string( $base_selector, $variant, $class_id, (int) $variant_index );

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

	private function variant_to_css_string( string $base_selector, array $variant, string $class_id = '', int $variant_index = 0 ): string {
		$props = $variant['props'] ?? [];
		$placeholder_css = '';

		if ( ! empty( $variant['meta']['is_scoped'] ) && '' !== $class_id ) {
			$emitted = $this->scoped_dynamic_emitter->emit( $props, $class_id, $variant_index );
			$props = $emitted['static_props'];
			$placeholder_css = $emitted['placeholder_css'];
			$this->dynamic_placeholders = array_merge( $this->dynamic_placeholders, $emitted['definitions'] );
		}

		$css = $this->props_to_css_string( $props ) ?? '';
		$css = $placeholder_css . $css;
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
			->map( function ( $value, $prop ) {
				if ( $this->on_prop_transform ) {
					call_user_func( $this->on_prop_transform, $prop, $value );
				}

				return $prop . ':' . $value . ';';
			} )
			->implode( '' );
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
