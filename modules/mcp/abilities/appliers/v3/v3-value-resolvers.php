<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pure functions that turn CSS values into legacy V3 control value shapes.
 */
class V3_Value_Resolvers {

	const DEFAULT_UNIT = 'px';

	const ELEMENT_WIDTH_MODE_INITIAL = 'initial';
	const ELEMENT_WIDTH_MODE_INHERIT = 'inherit';
	const ELEMENT_WIDTH_MODE_AUTO = 'auto';

	const ELEMENT_WIDTH_SETTING = '_element_width';
	const ELEMENT_CUSTOM_WIDTH_SETTING = '_element_custom_width';

	/**
	 * @return array{unit: string, size: float}|array{rejected: true, reason: string, value: string, property: string}|null
	 */
	public static function resolve_dimension( string $css_value, string $property = '' ) {
		$rejection = self::maybe_reject_variable( $css_value, $property );
		if ( null !== $rejection ) {
			return $rejection;
		}

		$parsed = self::parse_length( trim( $css_value ) );

		if ( null === $parsed ) {
			return null;
		}

		return [
			'unit' => $parsed['unit'],
			'size' => $parsed['size'],
		];
	}

	/**
	 * Line-height may be unitless (e.g. 1.5); Elementor expects an empty unit in that case.
	 *
	 * @return array{unit: string, size: float}|array{rejected: true, reason: string, value: string, property: string}|null
	 */
	public static function resolve_line_height( string $css_value, string $property = 'line-height' ) {
		$rejection = self::maybe_reject_variable( $css_value, $property );
		if ( null !== $rejection ) {
			return $rejection;
		}

		$value = trim( $css_value );

		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%)?$/i', $value, $matches ) ) {
			$unit = strtolower( $matches[2] ?? '' );

			return [
				'unit' => $unit,
				'size' => (float) $matches[1],
			];
		}

		return self::resolve_dimension( $value, $property );
	}

	/**
	 * When a background color is written, Elementor also needs the background type choose set to `classic`.
	 *
	 * @param array<string, mixed> $patch
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	public static function supplement_background_group_toggles( array $patch, array $controls ): array {
		foreach ( $patch as $setting => $value ) {
			if ( ! is_string( $setting ) || ! str_ends_with( $setting, '_color' ) ) {
				continue;
			}

			if ( ! self::is_background_color_setting( $setting ) ) {
				continue;
			}

			$type_key = preg_replace( '/_color$/', '_background', $setting );

			if ( ! is_string( $type_key ) || ! isset( $controls[ $type_key ] ) ) {
				continue;
			}

			if ( 'choose' !== ( $controls[ $type_key ]['type'] ?? '' ) ) {
				continue;
			}

			$patch[ $type_key ] = 'classic';
		}

		return $patch;
	}

	/**
	 * Container carries separate `flex_*` and `grid_*` alignment/gap settings that are only
	 * consumed under the matching `container_type`. An LLM writes standard CSS names like
	 * `align-items: center` once — the mapper routes it to the flex setting by default, then
	 * this helper mirrors the value onto the grid twin so the write survives a later
	 * container_type flip. Unused settings are harmless noise.
	 *
	 * @param array<string, mixed> $patch
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	public static function supplement_flex_grid_twin_alignments( array $patch, array $controls ): array {
		$twins = [
			'flex_align_items' => 'grid_align_items',
			'flex_justify_content' => 'grid_justify_content',
			'flex_align_content' => 'grid_align_content',
			'flex_gap' => 'grid_gaps',
		];

		foreach ( $twins as $source => $target ) {
			foreach ( self::responsive_variants( $source, $patch ) as $suffix ) {
				if ( isset( $controls[ $target . $suffix ] ) && ! isset( $patch[ $target . $suffix ] ) ) {
					$patch[ $target . $suffix ] = $patch[ $source . $suffix ];
				}
			}
		}

		return $patch;
	}

	/**
	 * @param array<string, mixed> $patch
	 * @return string[] Breakpoint suffixes ('', '_mobile', '_tablet', ...) that the patch
	 *                  contains for the given base setting.
	 */
	private static function responsive_variants( string $setting, array $patch ): array {
		$suffixes = [];

		foreach ( array_keys( $patch ) as $key ) {
			if ( ! is_string( $key ) ) {
				continue;
			}

			if ( $key === $setting ) {
				$suffixes[] = '';
				continue;
			}

			if ( 0 === strpos( $key, $setting . '_' ) ) {
				$suffixes[] = substr( $key, strlen( $setting ) );
			}
		}

		return $suffixes;
	}

	/**
	 * Container's grid group controls are conditional on `container_type = grid`. When any of
	 * them lands in the patch (`grid_columns_grid`, `grid_rows_grid`, `grid_gaps`,
	 * `grid_auto_flow`, `grid_justify_items`, `grid_align_items`, `grid_justify_content`,
	 * `grid_align_content`) the container has to be flipped from its default `flex` to `grid`
	 * or the setting stays inert. Mirrors the background-color / content-width toggle pattern.
	 *
	 * @param array<string, mixed> $patch
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	public static function supplement_container_type_toggle( array $patch, array $controls ): array {
		if ( ! isset( $controls['container_type'] ) ) {
			return $patch;
		}

		// Only "grid-exclusive" signals flip the mode. Settings like `grid_align_items` /
		// `grid_gaps` also come from `supplement_flex_grid_twin_alignments` (mirrored from the
		// flex twin), so relying on them would flip a legitimately-flex container to grid.
		$grid_exclusive_prefixes = [
			'grid_columns_grid',
			'grid_rows_grid',
			'grid_auto_flow',
			'grid_justify_items',
		];

		foreach ( array_keys( $patch ) as $setting ) {
			if ( ! is_string( $setting ) ) {
				continue;
			}

			foreach ( $grid_exclusive_prefixes as $prefix ) {
				if ( $setting === $prefix || 0 === strpos( $setting, $prefix . '_' ) ) {
					$patch['container_type'] = 'grid';

					return $patch;
				}
			}
		}

		return $patch;
	}

	/**
	 * `boxed_width` (V3 container's max-width setting) is a conditional control that only takes
	 * effect when `content_width` is `boxed`. When the LLM writes `max-width: X` on a container,
	 * the resolver routes to `boxed_width`; this pairs `content_width=boxed` so the width is
	 * actually applied. Mirrors the background-color toggle pattern.
	 *
	 * @param array<string, mixed> $patch
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	public static function supplement_content_width_toggle( array $patch, array $controls ): array {
		if ( ! isset( $controls['boxed_width'], $controls['content_width'] ) ) {
			return $patch;
		}

		foreach ( array_keys( $patch ) as $setting ) {
			if ( is_string( $setting ) && ( 'boxed_width' === $setting || 0 === strpos( $setting, 'boxed_width_' ) ) ) {
				$patch['content_width'] = 'boxed';

				return $patch;
			}
		}

		return $patch;
	}

	private static function is_background_color_setting( string $setting ): bool {
		if ( str_contains( $setting, '_background_' ) ) {
			return true;
		}

		return (bool) preg_match( '/_background_color$/', $setting );
	}

	/**
	 * Parses padding/margin/border-radius shorthand into Elementor dimensions shape.
	 *
	 * @return array{top: string, right: string, bottom: string, left: string, unit: string, isLinked: bool}|array{rejected: true, reason: string, value: string, property: string}|null
	 */
	public static function resolve_sides_shorthand( string $css_value, string $property = '' ) {
		$rejection = self::maybe_reject_variable( $css_value, $property );
		if ( null !== $rejection ) {
			return $rejection;
		}

		$tokens = self::tokenize_css_values( trim( $css_value ) );

		if ( empty( $tokens ) || count( $tokens ) > 4 ) {
			return null;
		}

		$parsed = [];
		foreach ( $tokens as $token ) {
			$length = self::parse_length( $token );
			if ( null === $length ) {
				return null;
			}
			$parsed[] = $length;
		}

		$unit = $parsed[0]['unit'];
		foreach ( $parsed as $item ) {
			if ( $item['unit'] !== $unit ) {
				return null;
			}
		}

		$sizes = array_column( $parsed, 'size' );
		$count = count( $sizes );

		if ( 1 === $count ) {
			$top = $sizes[0];
			$right = $sizes[0];
			$bottom = $sizes[0];
			$left = $sizes[0];
		} elseif ( 2 === $count ) {
			$top = $sizes[0];
			$bottom = $sizes[0];
			$right = $sizes[1];
			$left = $sizes[1];
		} elseif ( 3 === $count ) {
			$top = $sizes[0];
			$right = $sizes[1];
			$left = $sizes[1];
			$bottom = $sizes[2];
		} else {
			[ $top, $right, $bottom, $left ] = $sizes;
		}

		$linked = $top === $right && $right === $bottom && $bottom === $left;

		return [
			'top' => (string) $top,
			'right' => (string) $right,
			'bottom' => (string) $bottom,
			'left' => (string) $left,
			'unit' => $unit,
			'isLinked' => $linked,
		];
	}

	/**
	 * @return array{top: string, right: string, bottom: string, left: string, unit: string, isLinked: bool}|array{rejected: true, reason: string, value: string, property: string}|null
	 */
	public static function resolve_single_dimension_side( string $css_value, string $side, string $property = '' ) {
		$rejection = self::maybe_reject_variable( $css_value, $property );
		if ( null !== $rejection ) {
			return $rejection;
		}

		$parsed = self::parse_length( trim( $css_value ) );

		if ( null === $parsed || ! in_array( $side, [ 'top', 'right', 'bottom', 'left' ], true ) ) {
			return null;
		}

		return [
			'top' => 'top' === $side ? (string) $parsed['size'] : '',
			'right' => 'right' === $side ? (string) $parsed['size'] : '',
			'bottom' => 'bottom' === $side ? (string) $parsed['size'] : '',
			'left' => 'left' === $side ? (string) $parsed['size'] : '',
			'unit' => $parsed['unit'],
			'isLinked' => false,
		];
	}

	/**
	 * Native V3 color/fill controls store the raw string. Passing a malformed hex
	 * (`#gggggg`, `#12`) into a native control corrupts the panel picker for that
	 * setting — the frontend still renders as HTTP 200, but the control shows garbage.
	 *
	 * Non-hex forms (`rgb()`, `rgba()`, `hsl()`, `var(--x)`, named colors, `transparent`)
	 * are passed through unchanged; only `#...` values are shape-checked.
	 *
	 * @param string $css_value
	 * @param string $property
	 * @return string|array{rejected: true, reason: string, value: string, property: string}
	 */
	public static function resolve_color( string $css_value, string $property = 'color' ) {
		$value = trim( $css_value );

		if ( '' === $value ) {
			return $value;
		}

		if ( '#' === $value[0] && ! self::is_valid_hex( $value ) ) {
			return [
				'rejected' => true,
				'property' => $property,
				'value' => $value,
				'reason' => __( 'Invalid hex color; expected #rgb, #rgba, #rrggbb, or #rrggbbaa.', 'elementor' ),
			];
		}

		return $value;
	}

	private static function is_valid_hex( string $value ): bool {
		return (bool) preg_match( '/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $value );
	}

	/**
	 * Maps width / max-width CSS to Elementor's paired Advanced-tab controls.
	 *
	 * @return array<string, mixed>|array{rejected: true, reason: string, value: string, property: string}|null
	 */
	public static function resolve_element_width( string $css_value, string $property = 'width' ) {
		$rejection = self::maybe_reject_variable( $css_value, $property );
		if ( null !== $rejection ) {
			return $rejection;
		}

		$normalized = strtolower( trim( $css_value ) );

		if ( '100%' === $normalized ) {
			return [
				self::ELEMENT_WIDTH_SETTING => self::ELEMENT_WIDTH_MODE_INHERIT,
			];
		}

		if ( self::ELEMENT_WIDTH_MODE_AUTO === $normalized ) {
			return [
				self::ELEMENT_WIDTH_SETTING => self::ELEMENT_WIDTH_MODE_AUTO,
			];
		}

		$dimension = self::resolve_dimension( $css_value );
		if ( null === $dimension ) {
			return null;
		}

		return [
			self::ELEMENT_WIDTH_SETTING => self::ELEMENT_WIDTH_MODE_INITIAL,
			self::ELEMENT_CUSTOM_WIDTH_SETTING => $dimension,
		];
	}

	/**
	 * Parses a single box-shadow declaration into Elementor's box_shadow control shape.
	 *
	 * @return array{box_shadow_type: string, box_shadow: array}|null
	 */
	public static function resolve_box_shadow( string $css_value ): ?array {
		$value = trim( $css_value );

		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return [
				'box_shadow_type' => '',
				'box_shadow' => [
					'horizontal' => 0,
					'vertical' => 0,
					'blur' => 0,
					'spread' => 0,
					'color' => 'rgba(0,0,0,0.5)',
				],
			];
		}

		$position = 'outline';
		if ( preg_match( '/\binset\b/i', $value ) ) {
			$position = 'inset';
			$value = trim( preg_replace( '/\binset\b/i', '', $value ) );
		}

		$color = null;
		if ( preg_match( '/^(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\s+(.+)$/', $value, $matches ) ) {
			$color = $matches[1];
			$value = trim( $matches[2] );
		} elseif ( preg_match( '/^(.+?)\s+(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/', $value, $matches ) ) {
			$value = trim( $matches[1] );
			$color = $matches[2];
		}

		$lengths = self::tokenize_css_values( $value );
		if ( count( $lengths ) < 2 || count( $lengths ) > 4 ) {
			return null;
		}

		$parsed_lengths = [];
		foreach ( $lengths as $token ) {
			$length = self::parse_length( $token );
			if ( null === $length ) {
				return null;
			}
			$parsed_lengths[] = $length['size'];
		}

		return [
			'box_shadow_type' => 'yes',
			'box_shadow' => [
				'horizontal' => $parsed_lengths[0],
				'vertical' => $parsed_lengths[1],
				'blur' => $parsed_lengths[2] ?? 0,
				'spread' => $parsed_lengths[3] ?? 0,
				'color' => $color ?? 'rgba(0,0,0,0.5)',
				'position' => $position,
			],
		];
	}

	/**
	 * Spreads typography-related CSS properties into legacy typography_* keys and
	 * forces the group toggle to `custom`.
	 *
	 * @param array<string, string> $declarations property => css value
	 * @param string                $prefix       Control group prefix, e.g. `typography` or `menu_typography`.
	 * @return array<string, mixed>
	 */
	public static function resolve_typography_group( array $declarations, string $prefix = 'typography' ): array {
		$result = self::resolve_typography_group_with_rejections( $declarations, $prefix );

		return $result['patch'];
	}

	/**
	 * Same as {@see resolve_typography_group()} but also surfaces the per-property
	 * rejections triggered by unsupported `var()` inputs. The style mapper uses this
	 * variant so it can warn the caller when a variable was silently dropped.
	 *
	 * @param array<string, string> $declarations property => css value
	 * @return array{patch: array<string, mixed>, rejections: array<int, array{property: string, value: string, reason: string}>}
	 */
	public static function resolve_typography_group_with_rejections( array $declarations, string $prefix = 'typography' ): array {
		$patch = [];
		$rejections = [];

		$map = [
			'font-family' => $prefix . '_font_family',
			'font-weight' => $prefix . '_font_weight',
			'text-transform' => $prefix . '_text_transform',
			'font-style' => $prefix . '_font_style',
			'text-decoration' => $prefix . '_text_decoration',
			'line-height' => $prefix . '_line_height',
			'letter-spacing' => $prefix . '_letter_spacing',
			'word-spacing' => $prefix . '_word_spacing',
			'font-size' => $prefix . '_font_size',
		];

		foreach ( $declarations as $property => $value ) {
			$key = $map[ $property ] ?? null;
			if ( null === $key ) {
				continue;
			}

			if ( 'line-height' === $property ) {
				$dimension = self::resolve_line_height( $value, $property );
				if ( self::is_rejected( $dimension ) ) {
					$rejections[] = self::rejection_summary( $dimension );
					continue;
				}
				if ( null !== $dimension ) {
					$patch[ $key ] = $dimension;
				}
				continue;
			}

			if ( in_array( $property, [ 'font-size', 'letter-spacing', 'word-spacing' ], true ) ) {
				$dimension = self::resolve_dimension( $value, $property );
				if ( self::is_rejected( $dimension ) ) {
					$rejections[] = self::rejection_summary( $dimension );
					continue;
				}
				if ( null !== $dimension ) {
					$patch[ $key ] = $dimension;
				}
				continue;
			}

			if ( V3_Variable_Compatibility::is_var_reference( (string) $value )
				&& ! V3_Variable_Compatibility::supports( $property ) ) {
				$rejections[] = [
					'property' => $property,
					'value' => (string) $value,
					'reason' => V3_Variable_Compatibility::reject_reason( $property ),
				];
				continue;
			}

			if ( 'font-family' === $property ) {
				$value = self::normalize_font_family( $value );
				if ( '' === $value ) {
					continue;
				}
			}

			$patch[ $key ] = trim( $value );
		}

		if ( empty( $patch ) ) {
			return [ 'patch' => [], 'rejections' => $rejections ];
		}

		$patch[ $prefix . '_typography' ] = 'custom';

		return [ 'patch' => $patch, 'rejections' => $rejections ];
	}

	/**
	 * Parses `border: WIDTH STYLE COLOR` into Elementor border group keys.
	 *
	 * @param string $css_value
	 * @param string $prefix    e.g. `border` or `image_border` or `dropdown_border`.
	 * @return array<string, mixed>|null
	 */
	public static function resolve_border_shorthand( string $css_value, string $prefix = 'border' ): ?array {
		$value = trim( $css_value );

		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return [
				$prefix . '_border' => '',
			];
		}

		$style = null;
		$styles = [ 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden' ];
		foreach ( $styles as $candidate ) {
			if ( preg_match( '/\b' . preg_quote( $candidate, '/' ) . '\b/i', $value ) ) {
				$style = strtolower( $candidate );
				$value = trim( preg_replace( '/\b' . preg_quote( $candidate, '/' ) . '\b/i', '', $value ) );
				break;
			}
		}

		$color = null;
		if ( preg_match( '/(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/', $value, $matches ) ) {
			$color = $matches[1];
			$value = trim( substr( $value, 0, -strlen( $color ) ) );
		}

		$width = null;
		$tokens = self::tokenize_css_values( $value );
		if ( ! empty( $tokens ) ) {
			$width = self::resolve_sides_shorthand( implode( ' ', $tokens ) );
		}

		$patch = [
			$prefix . '_border' => $style ?? 'solid',
		];

		if ( null !== $width ) {
			$patch[ $prefix . '_width' ] = $width;
		}

		if ( null !== $color ) {
			$patch[ $prefix . '_color' ] = $color;
		}

		return $patch;
	}

	/**
	 * Parses a CSS `gap` value (`gap: 1rem` or `gap: 1rem 2rem` — first is row-gap, second is
	 * column-gap) into the shape Controls_Manager::GAPS stores: `{column, row, unit, isLinked}`.
	 * Two-value form uses different row/column values and marks isLinked=false; single-value
	 * mirrors row=column and marks isLinked=true.
	 *
	 * @return array{column: string, row: string, unit: string, isLinked: bool}|array{rejected: true, reason: string, value: string, property: string}|null
	 */
	public static function resolve_gaps( string $css_value, string $property = 'gap' ) {
		$rejection = self::maybe_reject_variable( $css_value, $property );
		if ( null !== $rejection ) {
			return $rejection;
		}

		$tokens = self::tokenize_css_values( trim( $css_value ) );
		if ( empty( $tokens ) || count( $tokens ) > 2 ) {
			return null;
		}

		$parsed = [];
		foreach ( $tokens as $token ) {
			$length = self::parse_length( $token );
			if ( null === $length ) {
				return null;
			}
			$parsed[] = $length;
		}

		if ( count( $parsed ) === 2 && $parsed[0]['unit'] !== $parsed[1]['unit'] ) {
			return null;
		}

		$row = (string) $parsed[0]['size'];
		$column = count( $parsed ) === 2 ? (string) $parsed[1]['size'] : $row;

		return [
			'column' => $column,
			'row' => $row,
			'unit' => $parsed[0]['unit'],
			'isLinked' => $row === $column,
		];
	}

	/**
	 * Dispatches a named resolver against a CSS value.
	 *
	 * @param string               $resolver_name One of: color, dimension, sides, box_shadow, border, text, slider, gaps, element_width.
	 * @param string               $css_value
	 * @param array<string, mixed> $args          Extra args (prefix for border/typography).
	 * @return mixed|null
	 */
	public static function resolve( string $resolver_name, string $css_value, array $args = [] ) {
		$property = (string) ( $args['property'] ?? '' );

		switch ( $resolver_name ) {
			case 'color':
				return self::resolve_color( $css_value, $property );
			case 'dimension':
				return self::resolve_dimension( $css_value, $property );
			case 'sides':
				return self::resolve_sides_shorthand( $css_value, $property );
			case 'dimension_side':
				return self::resolve_single_dimension_side( $css_value, (string) ( $args['side'] ?? '' ), $property );
			case 'box_shadow':
				return self::resolve_box_shadow( $css_value );
			case 'border':
				return self::resolve_border_shorthand( $css_value, $args['prefix'] ?? 'border' );
			case 'slider':
				return self::resolve_dimension( $css_value, $property );
			case 'text':
				return trim( $css_value );
			case 'element_width':
				return self::resolve_element_width( $css_value, $property );
			case 'gaps':
				return self::resolve_gaps( $css_value, $property );
			case 'raw_slider':
				return self::resolve_raw_slider( $css_value );
			case 'border_side':
				return self::resolve_border_side_shorthand(
					$css_value,
					(string) ( $args['side'] ?? '' ),
					(string) ( $args['prefix'] ?? 'border' )
				);
			default:
				return null;
		}
	}

	/**
	 * Stores an arbitrary CSS expression in a V3 SLIDER control that supports the `custom` unit
	 * (e.g. `grid-template-columns: repeat(3, 1fr)` -> `{size: 'repeat(3, 1fr)', unit: 'custom'}`).
	 * The control's selector template writes `{{SIZE}}` verbatim when unit is `custom`, so
	 * anything CSS accepts here — `repeat()`, `minmax()`, per-column tracks like `1fr 2fr 1fr`.
	 *
	 * @return array{unit: string, size: string}
	 */
	public static function resolve_raw_slider( string $css_value ): array {
		return [
			'unit' => 'custom',
			'size' => trim( $css_value ),
		];
	}

	/**
	 * Parses `border-top: 1px solid #ccc` (and its 3 siblings) into the V3 border-group patch,
	 * setting only the requested side's width. The other three sides fall back to zero so a
	 * standalone per-side write does not leak into unrelated sides — full linked writes should
	 * use `border` (the shorthand of all four).
	 *
	 * @return array<string, mixed>|null
	 */
	public static function resolve_border_side_shorthand( string $css_value, string $side, string $prefix = 'border' ): ?array {
		if ( ! in_array( $side, [ 'top', 'right', 'bottom', 'left' ], true ) ) {
			return null;
		}

		$patch = self::resolve_border_shorthand( $css_value, $prefix );
		if ( null === $patch ) {
			return null;
		}

		$width = $patch[ $prefix . '_width' ] ?? null;
		if ( is_array( $width ) ) {
			$sides = [ 'top', 'right', 'bottom', 'left' ];
			$only_side_value = $width[ $side ];
			foreach ( $sides as $s ) {
				$width[ $s ] = $s === $side ? (string) $only_side_value : '0';
			}
			$width['isLinked'] = false;
			$patch[ $prefix . '_width' ] = $width;
		}

		return $patch;
	}

	/**
	 * @param mixed $resolved
	 */
	public static function is_rejected( $resolved ): bool {
		return is_array( $resolved ) && ! empty( $resolved['rejected'] );
	}

	/**
	 * @param array{rejected: true, reason: string, value: string, property: string} $rejection
	 * @return array{property: string, value: string, reason: string}
	 */
	public static function rejection_summary( array $rejection ): array {
		return [
			'property' => (string) ( $rejection['property'] ?? '' ),
			'value' => (string) ( $rejection['value'] ?? '' ),
			'reason' => (string) ( $rejection['reason'] ?? '' ),
		];
	}

	/**
	 * @return array{rejected: true, reason: string, value: string, property: string}|null
	 */
	private static function maybe_reject_variable( string $css_value, string $property ): ?array {
		if ( ! V3_Variable_Compatibility::is_var_reference( $css_value ) ) {
			return null;
		}

		if ( V3_Variable_Compatibility::supports( $property ) ) {
			return null;
		}

		return [
			'rejected' => true,
			'property' => $property,
			'value' => trim( $css_value ),
			'reason' => V3_Variable_Compatibility::reject_reason( $property ),
		];
	}

	/**
	 * @return array{size: float, unit: string}|null
	 */
	private static function parse_length( string $token ): ?array {
		$token = trim( $token );

		if ( '' === $token ) {
			return null;
		}

		if ( '0' === $token ) {
			return [
				'size' => 0.0,
				'unit' => self::DEFAULT_UNIT,
			];
		}

		if ( ! preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|svh|svw|dvh|dvw|lvh|lvw)?$/i', $token, $matches ) ) {
			return null;
		}

		return [
			'size' => (float) $matches[1],
			'unit' => strtolower( $matches[2] ?? self::DEFAULT_UNIT ),
		];
	}

	/**
	 * V3 typography controls accept a single named font; CSS stacks are reduced to the first family.
	 */
	private static function normalize_font_family( string $value ): string {
		$first = trim( explode( ',', $value, 2 )[0] );

		if (
			( str_starts_with( $first, '"' ) && str_ends_with( $first, '"' ) )
			|| ( str_starts_with( $first, "'" ) && str_ends_with( $first, "'" ) )
		) {
			$first = substr( $first, 1, -1 );
		}

		return trim( $first );
	}

	/**
	 * @return string[]
	 */
	private static function tokenize_css_values( string $value ): array {
		if ( '' === $value ) {
			return [];
		}

		preg_match_all( '/(?:rgba?\([^)]+\)|hsla?\([^)]+\)|[^\s]+)/', $value, $matches );

		return $matches[0] ?? [];
	}
}
