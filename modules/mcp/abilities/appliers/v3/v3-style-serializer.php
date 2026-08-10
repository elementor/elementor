<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

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

	const RESPONSIVE_SUFFIXES = [
		'_tablet' => 'tablet',
		'_mobile' => 'mobile',
	];

	const TYPOGRAPHY_PROPERTIES = [
		'font-family' => 'font_family',
		'font-weight' => 'font_weight',
		'font-style' => 'font_style',
		'text-transform' => 'text_transform',
		'text-decoration' => 'text_decoration',
		'font-size' => 'font_size',
		'line-height' => 'line_height',
		'letter-spacing' => 'letter_spacing',
		'word-spacing' => 'word_spacing',
	];

	const TYPOGRAPHY_DIMENSION_PROPERTIES = [ 'font-size', 'line-height', 'letter-spacing', 'word-spacing' ];

	const DEFAULT_BREAKPOINT = 'desktop';

	public function serialize( array $settings, string $widget_type, array $widget_config ): string {
		$overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );
		$controls = $widget_config['controls'] ?? [];
		$generic = V3_Style_Settings_Index::build( is_array( $controls ) ? $controls : [], $overrides );

		$blocks = [];

		foreach ( $overrides as $match_key => $override ) {
			[ $property, $state ] = $this->split_match_key( (string) $match_key );
			$this->emit_override( $blocks, $settings, $property, $state, $override );
		}

		foreach ( $generic as $match_key => $rule ) {
			[ $property, $state ] = $this->split_match_key( (string) $match_key );
			$this->emit_simple( $blocks, $settings, $property, $state, (string) $rule['setting'], (string) $rule['resolver'], ! empty( $rule['responsive'] ) );
		}

		$mapped_css = $this->render_blocks( $blocks );
		$custom_css = $this->unwrap_custom_css( $settings['custom_css'] ?? null );

		if ( '' === $mapped_css ) {
			return $custom_css;
		}

		if ( '' === $custom_css ) {
			return $mapped_css;
		}

		return $mapped_css . ' ' . $custom_css;
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

	private function emit_override( array &$blocks, array $settings, string $property, ?string $state, array $override ): void {
		if ( isset( $override['typography_prefix'] ) ) {
			$this->emit_typography( $blocks, $settings, $property, $state, (string) $override['typography_prefix'], ! empty( $override['responsive'] ) );
			return;
		}

		if ( isset( $override['border_prefix'] ) ) {
			$this->emit_border( $blocks, $settings, $state, (string) $override['border_prefix'], ! empty( $override['responsive'] ) );
			return;
		}

		if ( isset( $override['box_shadow_prefix'] ) ) {
			$this->emit_box_shadow( $blocks, $settings, $state, (string) $override['box_shadow_prefix'] );
			return;
		}

		if ( isset( $override['setting'], $override['resolver'] ) ) {
			$this->emit_simple( $blocks, $settings, $property, $state, (string) $override['setting'], (string) $override['resolver'], ! empty( $override['responsive'] ) );
		}
	}

	private function emit_simple( array &$blocks, array $settings, string $property, ?string $state, string $setting_key, string $resolver, bool $responsive ): void {
		$this->emit_setting_at_breakpoint( $blocks, $settings, $property, $state, $setting_key, $resolver, self::DEFAULT_BREAKPOINT );

		if ( ! $responsive ) {
			return;
		}

		foreach ( self::RESPONSIVE_SUFFIXES as $suffix => $breakpoint ) {
			$this->emit_setting_at_breakpoint( $blocks, $settings, $property, $state, $setting_key . $suffix, $resolver, $breakpoint );
		}
	}

	private function emit_setting_at_breakpoint( array &$blocks, array $settings, string $property, ?string $state, string $setting_key, string $resolver, string $breakpoint ): void {
		if ( ! array_key_exists( $setting_key, $settings ) ) {
			return;
		}

		$css_value = $this->format_value( $resolver, $settings[ $setting_key ] );
		if ( null === $css_value ) {
			return;
		}

		$this->push( $blocks, $breakpoint, $state, $property, $css_value );
	}

	private function emit_typography( array &$blocks, array $settings, string $property, ?string $state, string $prefix, bool $responsive ): void {
		$suffix = self::TYPOGRAPHY_PROPERTIES[ $property ] ?? null;
		if ( null === $suffix ) {
			return;
		}

		$is_dimension = in_array( $property, self::TYPOGRAPHY_DIMENSION_PROPERTIES, true );
		$resolver = $is_dimension ? 'dimension' : 'text';
		$setting_key = $prefix . '_' . $suffix;

		$this->emit_setting_at_breakpoint( $blocks, $settings, $property, $state, $setting_key, $resolver, self::DEFAULT_BREAKPOINT );

		if ( ! $responsive ) {
			return;
		}

		foreach ( self::RESPONSIVE_SUFFIXES as $sfx => $breakpoint ) {
			$this->emit_setting_at_breakpoint( $blocks, $settings, $property, $state, $setting_key . $sfx, $resolver, $breakpoint );
		}
	}

	private function emit_border( array &$blocks, array $settings, ?string $state, string $prefix, bool $responsive ): void {
		$style = $settings[ $prefix . '_border' ] ?? null;
		if ( ! is_string( $style ) || '' === $style ) {
			return;
		}

		$width_value = $this->format_value( 'sides', $settings[ $prefix . '_width' ] ?? null );
		$color_value = $this->format_value( 'color', $settings[ $prefix . '_color' ] ?? null );

		$parts = [];
		if ( null !== $width_value ) {
			$parts[] = $width_value;
		}
		$parts[] = $style;
		if ( null !== $color_value ) {
			$parts[] = $color_value;
		}

		$this->push( $blocks, self::DEFAULT_BREAKPOINT, $state, 'border', implode( ' ', $parts ) );

		if ( ! $responsive ) {
			return;
		}

		foreach ( self::RESPONSIVE_SUFFIXES as $suffix => $breakpoint ) {
			$responsive_width = $this->format_value( 'sides', $settings[ $prefix . '_width' . $suffix ] ?? null );
			if ( null === $responsive_width ) {
				continue;
			}

			$parts = [ $responsive_width, $style ];
			if ( null !== $color_value ) {
				$parts[] = $color_value;
			}

			$this->push( $blocks, $breakpoint, $state, 'border', implode( ' ', $parts ) );
		}
	}

	private function emit_box_shadow( array &$blocks, array $settings, ?string $state, string $prefix ): void {
		$type = $settings[ $prefix . '_box_shadow_type' ] ?? null;
		$shadow = $settings[ $prefix . '_box_shadow' ] ?? null;
		if ( 'yes' !== $type || ! is_array( $shadow ) ) {
			return;
		}

		$parts = [
			$this->format_size( $shadow['horizontal'] ?? 0 ),
			$this->format_size( $shadow['vertical'] ?? 0 ),
			$this->format_size( $shadow['blur'] ?? 0 ),
			$this->format_size( $shadow['spread'] ?? 0 ),
		];
		if ( isset( $shadow['color'] ) && '' !== $shadow['color'] ) {
			$parts[] = $shadow['color'];
		}
		if ( isset( $shadow['position'] ) && 'inset' === $shadow['position'] ) {
			array_unshift( $parts, 'inset' );
		}

		$this->push( $blocks, self::DEFAULT_BREAKPOINT, $state, 'box-shadow', implode( ' ', $parts ) );
	}

	/**
	 * @param string $resolver Resolver name from V3_Value_Resolvers::resolve.
	 * @param mixed  $value    Raw setting value.
	 * @return string|null
	 */
	private function format_value( string $resolver, $value ): ?string {
		if ( null === $value || '' === $value ) {
			return null;
		}

		switch ( $resolver ) {
			case 'text':
			case 'color':
				return is_scalar( $value ) ? (string) $value : null;

			case 'dimension':
			case 'slider':
				return $this->format_dimension( $value );

			case 'sides':
				return $this->format_sides( $value );

			default:
				return null;
		}
	}

	/**
	 * @param mixed $value
	 */
	private function format_dimension( $value ): ?string {
		if ( ! is_array( $value ) || ! array_key_exists( 'size', $value ) ) {
			return null;
		}

		if ( '' === $value['size'] || null === $value['size'] ) {
			return null;
		}

		return $this->format_size( $value['size'] ) . ( isset( $value['unit'] ) && 'px' !== $value['unit'] ? $value['unit'] : 'px' );
	}

	/**
	 * @param mixed $value
	 */
	private function format_sides( $value ): ?string {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$sides = [ 'top', 'right', 'bottom', 'left' ];
		foreach ( $sides as $side ) {
			if ( ! array_key_exists( $side, $value ) || '' === $value[ $side ] || null === $value[ $side ] ) {
				return null;
			}
		}

		$unit = isset( $value['unit'] ) && '' !== $value['unit'] ? $value['unit'] : 'px';
		$top = $this->format_size( $value['top'] );
		$right = $this->format_size( $value['right'] );
		$bottom = $this->format_size( $value['bottom'] );
		$left = $this->format_size( $value['left'] );

		if ( ! empty( $value['isLinked'] ) && $top === $right && $right === $bottom && $bottom === $left ) {
			return $top . $unit;
		}

		return sprintf( '%s%s %s%s %s%s %s%s', $top, $unit, $right, $unit, $bottom, $unit, $left, $unit );
	}

	/**
	 * @param mixed $size
	 */
	private function format_size( $size ): string {
		if ( is_int( $size ) ) {
			return (string) $size;
		}

		if ( is_float( $size ) ) {
			return rtrim( rtrim( sprintf( '%.4f', $size ), '0' ), '.' );
		}

		if ( is_string( $size ) && '' !== $size ) {
			return $size;
		}

		return '0';
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

	private function push( array &$blocks, string $breakpoint, ?string $state, string $property, string $value ): void {
		$state_key = $state ?? '';
		$blocks[ $breakpoint ][ $state_key ][ $property ] = $value;
	}

	/**
	 * @param array<string, array<string, array<string, string>>> $blocks
	 */
	private function render_blocks( array $blocks ): string {
		$parts = [];

		$default = $blocks[ self::DEFAULT_BREAKPOINT ] ?? [];
		unset( $blocks[ self::DEFAULT_BREAKPOINT ] );

		$rendered_default = $this->render_state_group( $default );
		if ( '' !== $rendered_default ) {
			$parts[] = $rendered_default;
		}

		foreach ( $blocks as $breakpoint => $state_group ) {
			$rendered = $this->render_state_group( $state_group );
			if ( '' === $rendered ) {
				continue;
			}
			$parts[] = sprintf( '@media(--%s) { %s }', $breakpoint, $rendered );
		}

		return implode( ' ', $parts );
	}

	/**
	 * @param array<string, array<string, string>> $state_group
	 */
	private function render_state_group( array $state_group ): string {
		$parts = [];

		$base = $state_group[''] ?? [];
		unset( $state_group[''] );
		if ( ! empty( $base ) ) {
			$parts[] = $this->render_declarations( $base );
		}

		foreach ( $state_group as $state => $declarations ) {
			if ( empty( $declarations ) ) {
				continue;
			}
			$parts[] = sprintf( '&:%s { %s }', $state, $this->render_declarations( $declarations ) );
		}

		return implode( ' ', $parts );
	}

	/**
	 * @param array<string, string> $declarations
	 */
	private function render_declarations( array $declarations ): string {
		$parts = [];
		foreach ( $declarations as $property => $value ) {
			$parts[] = sprintf( '%s: %s;', $property, $value );
		}
		return implode( ' ', $parts );
	}
}
