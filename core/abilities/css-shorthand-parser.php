<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Self-contained CSS-to-Elementor-v4-props converter.
 *
 * Mirrors the per-property shapes produced by the elementor-html-css-converter plugin
 * (plugins/elementor-html-css-converter/includes/converters/css/properties/*) but reimplements
 * the mapping inline so the trait has no runtime dependency on that plugin. Output shapes are
 * byte-identical to `Prop_Type::generate()` from atomic-widgets.
 *
 * Key divergences from the nestjs MCP cssToProps (intentional, driven by the v4 style schema):
 *  - margin/padding side-keyed props collapse to the `margin`/`padding` shorthand with a
 *    partial dimensions value — the v4 schema has no `margin-top` key.
 *  - `margin:auto`, `calc(...)`, `min/max/clamp(...)` emit `{size:<keyword-or-expr>, unit:"custom"}`.
 *  - `flex` shorthand is fully parsed into `{flexGrow, flexShrink, flexBasis}` because the
 *    schema has no separate `flex-grow` key.
 *  - positioning `top|right|bottom|left` rewrite to `inset-block-start|inline-end|block-end|inline-start`.
 *  - `border-top-left-radius` collapses to `border-radius` with a 4-corner value where unset
 *    corners are `null`.
 *  - `var(--x)` emits `{$$type:'global-size-variable', value:<label>}` (or `-color-`) — the label
 *    form. Downstream resolution (label → id) is the caller's responsibility, matching the
 *    pattern already used for class variant props in Build_Page_Ability.
 */
trait Css_Shorthand_Parser {

	private const VAR_REGEX          = '/^var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,.*?)?\)$/';
	private const SIZE_UNIT_RE       = '/^(-?[\d.]+)(px|em|rem|%|vh|vw|vmin|vmax|fr|pt|svh|svw|dvh|dvw|ch|ex|cm|mm|in|pc|lh|rlh|lvw|lvh)$/i';
	private const CSS_FUNCTION_RE    = '/^(calc|min|max|clamp)\(/i';
	private const CSS_WIDE_KEYWORDS  = [ 'revert', 'initial', 'unset', 'inherit' ];

	private const POSITIONING_MAP = [
		'top'    => 'inset-block-start',
		'right'  => 'inset-inline-end',
		'bottom' => 'inset-block-end',
		'left'   => 'inset-inline-start',
	];

	private const POSITIONING_KEYS = [
		'top', 'right', 'bottom', 'left',
		'inset-block-start', 'inset-inline-end', 'inset-block-end', 'inset-inline-start',
	];

	private const MARGIN_SIDE_MAP = [
		'top'           => 'block-start',
		'right'         => 'inline-end',
		'bottom'        => 'block-end',
		'left'          => 'inline-start',
		'block-start'   => 'block-start',
		'block-end'     => 'block-end',
		'inline-start'  => 'inline-start',
		'inline-end'    => 'inline-end',
	];

	private const BORDER_RADIUS_CORNER_MAP = [
		'border-top-left-radius'     => 'start-start',
		'border-top-right-radius'    => 'start-end',
		'border-bottom-right-radius' => 'end-end',
		'border-bottom-left-radius'  => 'end-start',
		'border-start-start-radius'  => 'start-start',
		'border-start-end-radius'    => 'start-end',
		'border-end-end-radius'      => 'end-end',
		'border-end-start-radius'    => 'end-start',
	];

	private const BORDER_WIDTH_SIDE_MAP = [
		'border-top-width'           => 'block-start',
		'border-right-width'         => 'inline-end',
		'border-bottom-width'        => 'block-end',
		'border-left-width'          => 'inline-start',
		'border-block-start-width'   => 'block-start',
		'border-block-end-width'     => 'block-end',
		'border-inline-start-width'  => 'inline-start',
		'border-inline-end-width'    => 'inline-end',
	];

	private static function color_props(): array {
		return [
			'color',
			'border-color',
			'outline-color',
			'text-decoration-color',
			'text-emphasis-color',
			'caret-color',
			'column-rule-color',
			'fill',
			'stroke',
		];
	}

	private static function size_props(): array {
		return [
			'font-size',
			'width',
			'height',
			'max-width',
			'max-height',
			'min-width',
			'min-height',
			'gap',
			'row-gap',
			'column-gap',
			'letter-spacing',
			'word-spacing',
			'text-indent',
			'flex-basis',
			'outline-width',
			'outline-offset',
			'border-spacing',
			'column-width',
			'column-rule-width',
			'perspective',
			'stroke-width',
		];
	}

	private static function number_props(): array {
		return [
			'z-index',
			'flex-grow',
			'flex-shrink',
			'order',
			'column-count',
			'animation-iteration-count',
			'zoom',
			'tab-size',
		];
	}

	private static function named_colors(): array {
		return [
			'transparent',
			'currentcolor',
			'inherit',
			'black',
			'white',
			'red',
			'green',
			'blue',
			'yellow',
			'cyan',
			'magenta',
			'gray',
			'grey',
			'orange',
			'purple',
			'pink',
			'brown',
			'navy',
			'teal',
			'lime',
			'olive',
			'maroon',
			'silver',
			'aqua',
			'fuchsia',
			'gold',
			'coral',
			'crimson',
			'indigo',
			'violet',
			'turquoise',
			'salmon',
			'khaki',
			'ivory',
			'beige',
			'lavender',
			'wheat',
			'tan',
			'sienna',
			'orchid',
			'plum',
		];
	}

	private function is_css_variable( string $v ): bool {
		return str_starts_with( trim( $v ), 'var(' );
	}

	private function extract_var_label( string $v ): ?string {
		if ( preg_match( self::VAR_REGEX, trim( $v ), $m ) ) {
			return ltrim( $m[1], '-' );
		}
		return null;
	}

	private function is_color_string( string $v ): bool {
		$t = strtolower( trim( $v ) );
		if ( str_starts_with( $t, '#' ) || str_starts_with( $t, 'rgb' ) || str_starts_with( $t, 'hsl' ) ) {
			return true;
		}
		return in_array( $t, self::named_colors(), true );
	}

	private function parse_number_unit( string $v ): ?array {
		$t = trim( $v );
		if ( '0' === $t ) {
			// int 0, not float 0.0 — Size_Prop_Type::validate_value uses strict `=== 0`
			// which rejects 0.0. All other numeric values pass via !empty(size).
			return [
				'size' => 0,
				'unit' => 'px',
			];
		}
		if ( ! preg_match( self::SIZE_UNIT_RE, $t, $m ) ) {
			return null;
		}
		$num = (float) $m[1];
		return [
			'size' => 0.0 === $num ? 0 : $num,
			'unit' => strtolower( $m[2] ),
		];
	}

	private function wrap_size( array $spec ): array {
		return [
			'$$type' => 'size',
			'value'  => $spec,
		];
	}

	private function wrap_number( $n ): array {
		return [
			'$$type' => 'number',
			'value'  => (float) $n,
		];
	}

	private function wrap_string( string $v ): array {
		return [
			'$$type' => 'string',
			'value'  => $v,
		];
	}

	private function resolve_size( string $v ): ?array {
		$t = trim( $v );

		if ( $this->is_css_variable( $t ) ) {
			$label = $this->extract_var_label( $t );
			if ( null === $label ) {
				return null;
			}
			return [
				'$$type' => 'global-size-variable',
				'value'  => $label,
			];
		}

		$lower = strtolower( $t );
		if ( in_array( $lower, self::CSS_WIDE_KEYWORDS, true ) ) {
			return $this->wrap_size( [
				'size' => $lower,
				'unit' => 'custom',
			] );
		}

		if ( 'auto' === $lower ) {
			return $this->wrap_size( [
				'size' => 'auto',
				'unit' => 'custom',
			] );
		}

		if ( preg_match( self::CSS_FUNCTION_RE, $t ) ) {
			return $this->wrap_size( [
				'size' => $t,
				'unit' => 'custom',
			] );
		}

		$parsed = $this->parse_number_unit( $t );
		if ( null === $parsed ) {
			return null;
		}
		return $this->wrap_size( $parsed );
	}

	private function resolve_color( string $v ): ?array {
		$t = trim( $v );

		if ( $this->is_css_variable( $t ) ) {
			$label = $this->extract_var_label( $t );
			if ( null === $label ) {
				return null;
			}
			return [
				'$$type' => 'global-color-variable',
				'value'  => $label,
			];
		}

		if ( 'transparent' === strtolower( $t ) ) {
			return [
				'$$type' => 'color',
				'value'  => 'rgba(0,0,0,0)',
			];
		}

		if ( ! $this->is_color_string( $t ) ) {
			return null;
		}

		return [
			'$$type' => 'color',
			'value'  => $t,
		];
	}

	private function split_whitespace_paren_aware( string $value ): array {
		$out  = [];
		$cur  = '';
		$d    = 0;
		$len  = strlen( $value );
		for ( $i = 0; $i < $len; $i++ ) {
			$ch = $value[ $i ];
			if ( '(' === $ch ) {
				++$d;
				$cur .= $ch;
				continue;
			}
			if ( ')' === $ch ) {
				--$d;
				$cur .= $ch;
				continue;
			}
			if ( 0 === $d && 1 === preg_match( '/\s/', $ch ) ) {
				if ( '' !== trim( $cur ) ) {
					$out[] = trim( $cur );
					$cur   = '';
				}
				continue;
			}
			$cur .= $ch;
		}
		if ( '' !== trim( $cur ) ) {
			$out[] = trim( $cur );
		}
		return $out;
	}

	private function split_comma_paren_aware( string $value ): array {
		$out  = [];
		$cur  = '';
		$d    = 0;
		$len  = strlen( $value );
		for ( $i = 0; $i < $len; $i++ ) {
			$ch = $value[ $i ];
			if ( '(' === $ch ) {
				++$d;
				$cur .= $ch;
				continue;
			}
			if ( ')' === $ch ) {
				--$d;
				$cur .= $ch;
				continue;
			}
			if ( ',' === $ch && 0 === $d ) {
				if ( '' !== trim( $cur ) ) {
					$out[] = trim( $cur );
				}
				$cur = '';
				continue;
			}
			$cur .= $ch;
		}
		if ( '' !== trim( $cur ) ) {
			$out[] = trim( $cur );
		}
		return $out;
	}

	private function expand_shorthand_4( array $parts ): ?array {
		$n = count( $parts );
		if ( 1 === $n ) {
			return [ $parts[0], $parts[0], $parts[0], $parts[0] ];
		}
		if ( 2 === $n ) {
			return [ $parts[0], $parts[1], $parts[0], $parts[1] ];
		}
		if ( 3 === $n ) {
			return [ $parts[0], $parts[1], $parts[2], $parts[1] ];
		}
		if ( 4 === $n ) {
			return [ $parts[0], $parts[1], $parts[2], $parts[3] ];
		}
		return null;
	}

	private function parse_margin_padding( string $prop, string $value ): ?array {
		$output_key = str_starts_with( $prop, 'margin' ) ? 'margin' : 'padding';
		$remainder  = substr( $prop, strlen( $output_key ) );

		// Shorthand: `margin`, `padding`.
		if ( '' === $remainder ) {
			$parts = $this->split_whitespace_paren_aware( trim( $value ) );
			$sides = $this->expand_shorthand_4( $parts );
			if ( null === $sides ) {
				return null;
			}
			[ $top, $right, $bottom, $left ] = $sides;
			$tv = $this->resolve_size( $top );
			$rv = $this->resolve_size( $right );
			$bv = $this->resolve_size( $bottom );
			$lv = $this->resolve_size( $left );
			if ( null === $tv || null === $rv || null === $bv || null === $lv ) {
				return null;
			}
			return [
				'output_key' => $output_key,
				'prop'       => [
					'$$type' => 'dimensions',
					'value'  => [
						'block-start'  => $tv,
						'inline-end'   => $rv,
						'block-end'    => $bv,
						'inline-start' => $lv,
					],
				],
			];
		}

		// Axis shorthand: `margin-block`, `margin-inline`.
		if ( '-block' === $remainder || '-inline' === $remainder ) {
			$axis  = ltrim( $remainder, '-' );
			$parts = $this->split_whitespace_paren_aware( trim( $value ) );
			$n     = count( $parts );
			if ( 1 === $n ) {
				$v = $this->resolve_size( $parts[0] );
				if ( null === $v ) {
					return null;
				}
				return [
					'output_key' => $output_key,
					'prop'       => [
						'$$type' => 'dimensions',
						'value'  => [
							$axis . '-start' => $v,
							$axis . '-end'   => $v,
						],
					],
				];
			}
			if ( 2 === $n ) {
				$s = $this->resolve_size( $parts[0] );
				$e = $this->resolve_size( $parts[1] );
				if ( null === $s || null === $e ) {
					return null;
				}
				return [
					'output_key' => $output_key,
					'prop'       => [
						'$$type' => 'dimensions',
						'value'  => [
							$axis . '-start' => $s,
							$axis . '-end'   => $e,
						],
					],
				];
			}
			return null;
		}

		// Single side: `margin-top`, `margin-block-start`, `padding-inline-end`, etc.
		$side_key = ltrim( $remainder, '-' );
		if ( ! isset( self::MARGIN_SIDE_MAP[ $side_key ] ) ) {
			return null;
		}
		$logical_side = self::MARGIN_SIDE_MAP[ $side_key ];
		$v            = $this->resolve_size( trim( $value ) );
		if ( null === $v ) {
			return null;
		}
		return [
			'output_key' => $output_key,
			'prop'       => [
				'$$type' => 'dimensions',
				'value'  => [
					$logical_side => $v,
				],
			],
		];
	}

	private function parse_border_radius( string $prop, string $value ): ?array {
		if ( 'border-radius' === $prop ) {
			$parts = $this->split_whitespace_paren_aware( trim( $value ) );
			$sides = $this->expand_shorthand_4( $parts );
			if ( null === $sides ) {
				return null;
			}
			[ $tl, $tr, $br, $bl ] = $sides;
			$tlv = $this->resolve_size( $tl );
			$trv = $this->resolve_size( $tr );
			$brv = $this->resolve_size( $br );
			$blv = $this->resolve_size( $bl );
			if ( null === $tlv || null === $trv || null === $brv || null === $blv ) {
				return null;
			}
			return [
				'output_key' => 'border-radius',
				'prop'       => [
					'$$type' => 'border-radius',
					'value'  => [
						'start-start' => $tlv,
						'start-end'   => $trv,
						'end-end'     => $brv,
						'end-start'   => $blv,
					],
				],
			];
		}

		if ( ! isset( self::BORDER_RADIUS_CORNER_MAP[ $prop ] ) ) {
			return null;
		}
		$corner = self::BORDER_RADIUS_CORNER_MAP[ $prop ];
		$v      = $this->resolve_size( trim( $value ) );
		if ( null === $v ) {
			return null;
		}
		return [
			'output_key' => 'border-radius',
			'prop'       => [
				'$$type' => 'border-radius',
				'value'  => [
					'start-start' => 'start-start' === $corner ? $v : null,
					'start-end'   => 'start-end'   === $corner ? $v : null,
					'end-end'     => 'end-end'     === $corner ? $v : null,
					'end-start'   => 'end-start'   === $corner ? $v : null,
				],
			],
		];
	}

	private function parse_border_width( string $prop, string $value ): ?array {
		if ( 'border-width' === $prop ) {
			$parts = $this->split_whitespace_paren_aware( trim( $value ) );
			$sides = $this->expand_shorthand_4( $parts );
			if ( null === $sides ) {
				return null;
			}
			[ $top, $right, $bottom, $left ] = $sides;
			$tv = $this->resolve_size( $top );
			$rv = $this->resolve_size( $right );
			$bv = $this->resolve_size( $bottom );
			$lv = $this->resolve_size( $left );
			if ( null === $tv || null === $rv || null === $bv || null === $lv ) {
				return null;
			}
			return [
				'output_key' => 'border-width',
				'prop'       => [
					'$$type' => 'dimensions',
					'value'  => [
						'block-start'  => $tv,
						'inline-end'   => $rv,
						'block-end'    => $bv,
						'inline-start' => $lv,
					],
				],
			];
		}

		if ( ! isset( self::BORDER_WIDTH_SIDE_MAP[ $prop ] ) ) {
			return null;
		}
		$side = self::BORDER_WIDTH_SIDE_MAP[ $prop ];
		$v    = $this->resolve_size( trim( $value ) );
		if ( null === $v ) {
			return null;
		}
		return [
			'output_key' => 'border-width',
			'prop'       => [
				'$$type' => 'dimensions',
				'value'  => [
					$side => $v,
				],
			],
		];
	}

	private function parse_positioning( string $prop, string $value ): ?array {
		$output_key = self::POSITIONING_MAP[ $prop ] ?? $prop;

		if ( ! in_array( $output_key, [ 'inset-block-start', 'inset-inline-end', 'inset-block-end', 'inset-inline-start' ], true ) ) {
			return null;
		}

		$v = $this->resolve_size( trim( $value ) );
		if ( null === $v ) {
			return null;
		}
		return [
			'output_key' => $output_key,
			'prop'       => $v,
		];
	}

	private function parse_flex_shorthand( string $value ): ?array {
		$value = strtolower( trim( $value ) );

		$defaults = [
			'none'    => [ 'grow' => 0.0, 'shrink' => 0.0, 'basis' => [ 'size' => 'auto', 'unit' => 'custom' ] ],
			'auto'    => [ 'grow' => 1.0, 'shrink' => 1.0, 'basis' => [ 'size' => 'auto', 'unit' => 'custom' ] ],
			'initial' => [ 'grow' => 0.0, 'shrink' => 1.0, 'basis' => [ 'size' => 'auto', 'unit' => 'custom' ] ],
		];
		if ( isset( $defaults[ $value ] ) ) {
			return $this->make_flex(
				$defaults[ $value ]['grow'],
				$defaults[ $value ]['shrink'],
				$defaults[ $value ]['basis']
			);
		}

		$parts = preg_split( '/\s+/', $value );
		$n     = count( $parts );
		if ( $n < 1 || $n > 3 ) {
			return null;
		}

		$grow   = 0.0;
		$shrink = 1.0;
		$basis  = [ 'size' => 'auto', 'unit' => 'custom' ];

		if ( 1 === $n ) {
			if ( is_numeric( $parts[0] ) ) {
				$grow  = (float) $parts[0];
				$basis = [ 'size' => 0, 'unit' => 'px' ];
			} else {
				$parsed = $this->parse_flex_basis( $parts[0] );
				if ( null === $parsed ) {
					return null;
				}
				$basis = $parsed;
			}
		} elseif ( 2 === $n ) {
			if ( ! is_numeric( $parts[0] ) ) {
				return null;
			}
			$grow = (float) $parts[0];
			if ( is_numeric( $parts[1] ) ) {
				$shrink = (float) $parts[1];
				$basis  = [ 'size' => 0, 'unit' => 'px' ];
			} else {
				$parsed = $this->parse_flex_basis( $parts[1] );
				if ( null === $parsed ) {
					return null;
				}
				$basis = $parsed;
			}
		} else {
			if ( ! is_numeric( $parts[0] ) || ! is_numeric( $parts[1] ) ) {
				return null;
			}
			$grow   = (float) $parts[0];
			$shrink = (float) $parts[1];
			$parsed = $this->parse_flex_basis( $parts[2] );
			if ( null === $parsed ) {
				return null;
			}
			$basis = $parsed;
		}

		if ( $grow < 0 || $shrink < 0 ) {
			return null;
		}

		return $this->make_flex( $grow, $shrink, $basis );
	}

	private function parse_flex_basis( string $value ): ?array {
		$v = strtolower( trim( $value ) );
		$kw = [
			'auto'        => [ 'size' => 'auto', 'unit' => 'custom' ],
			'content'     => [ 'size' => 'content', 'unit' => 'custom' ],
			'fit-content' => [ 'size' => 'fit-content', 'unit' => 'custom' ],
			'max-content' => [ 'size' => 'max-content', 'unit' => 'custom' ],
			'min-content' => [ 'size' => 'min-content', 'unit' => 'custom' ],
		];
		if ( isset( $kw[ $v ] ) ) {
			return $kw[ $v ];
		}
		return $this->parse_number_unit( $v );
	}

	private function make_flex( float $grow, float $shrink, array $basis ): array {
		return [
			'$$type' => 'flex',
			'value'  => [
				'flexGrow'   => $this->wrap_number( $grow ),
				'flexShrink' => $this->wrap_number( $shrink ),
				'flexBasis'  => $this->wrap_size( $basis ),
			],
		];
	}

	private function parse_box_shadow( string $v ): array {
		if ( 'none' === strtolower( trim( $v ) ) ) {
			return [
				'$$type' => 'box-shadow',
				'value'  => [],
			];
		}

		$shadows = [];
		foreach ( $this->split_comma_paren_aware( $v ) as $sh_str ) {
			$is_inset = 1 === preg_match( '/\binset\b/i', $sh_str );
			$clean    = preg_replace( '/\s+/', ' ', trim( preg_replace( '/\binset\b/i', '', $sh_str ) ) );
			$parts    = $this->split_whitespace_paren_aware( $clean );

			$sizes = [];
			$clr   = null;
			foreach ( $parts as $p ) {
				if ( $this->is_color_string( $p ) || str_starts_with( $p, 'var(' ) ) {
					$clr = $p;
				} elseif ( '0' === $p || 1 === preg_match( '/^-?[\d.]+[a-z%]+$/i', $p ) ) {
					$sizes[] = $p;
				}
			}

			if ( count( $sizes ) < 2 ) {
				continue;
			}

			$mk_sz = function ( string $s ): array {
				$parsed = $this->parse_number_unit( $s );
				return $this->wrap_size( null !== $parsed ? $parsed : [ 'size' => 0, 'unit' => 'px' ] );
			};

			$color_prop = null !== $clr ? $this->resolve_color( $clr ) : [
				'$$type' => 'color',
				'value'  => 'rgba(0,0,0,0.5)',
			];

			$data = [
				'hOffset' => $mk_sz( $sizes[0] ),
				'vOffset' => $mk_sz( $sizes[1] ),
				'blur'    => $mk_sz( $sizes[2] ?? '0' ),
				'spread'  => $mk_sz( $sizes[3] ?? '0' ),
				'color'   => $color_prop,
			];
			if ( $is_inset ) {
				$data['position'] = 'inset';
			}

			$shadows[] = [
				'$$type' => 'shadow',
				'value'  => $data,
			];
		}

		return [
			'$$type' => 'box-shadow',
			'value'  => $shadows,
		];
	}

	private function parse_opacity( string $value ): ?array {
		$t = trim( $value );

		if ( str_ends_with( $t, '%' ) ) {
			$n = (float) rtrim( $t, '%' );
			if ( $n < 0 || $n > 100 ) {
				return null;
			}
			return $this->wrap_size( [
				'size' => $n,
				'unit' => '%',
			] );
		}

		if ( ! is_numeric( $t ) ) {
			return null;
		}
		$n = (float) $t;
		if ( $n < 0 || $n > 1 ) {
			return null;
		}
		return $this->wrap_size( [
			'size' => $n * 100,
			'unit' => '%',
		] );
	}

	private function merge_dimensions( array &$target, array $incoming ): void {
		if ( ! isset( $target[ $incoming['output_key'] ] ) ) {
			$target[ $incoming['output_key'] ] = $incoming['prop'];
			return;
		}

		$existing = $target[ $incoming['output_key'] ];
		if (
			! is_array( $existing ) ||
			( $existing['$$type'] ?? '' ) !== ( $incoming['prop']['$$type'] ?? '' ) ||
			! isset( $existing['value'], $incoming['prop']['value'] ) ||
			! is_array( $existing['value'] ) ||
			! is_array( $incoming['prop']['value'] )
		) {
			$target[ $incoming['output_key'] ] = $incoming['prop'];
			return;
		}

		$target[ $incoming['output_key'] ]['value'] = array_merge( $existing['value'], $incoming['prop']['value'] );
	}

	private function css_to_props( string $css ): array {
		$result = [];

		foreach ( array_filter( array_map( 'trim', explode( ';', $css ) ) ) as $decl ) {
			$colon = strpos( $decl, ':' );
			if ( false === $colon ) {
				continue;
			}
			$prop  = strtolower( trim( substr( $decl, 0, $colon ) ) );
			$value = trim( substr( $decl, $colon + 1 ) );
			if ( '' === $prop || '' === $value ) {
				continue;
			}

			// margin / padding (shorthand + axes + side variants)
			if (
				'margin' === $prop || 'padding' === $prop ||
				str_starts_with( $prop, 'margin-' ) || str_starts_with( $prop, 'padding-' )
			) {
				$parsed = $this->parse_margin_padding( $prop, $value );
				if ( null !== $parsed ) {
					$this->merge_dimensions( $result, $parsed );
					continue;
				}
				$result[ $prop ] = $this->wrap_string( $value );
				continue;
			}

			// border-radius (shorthand + per-corner)
			if ( 'border-radius' === $prop || str_ends_with( $prop, '-radius' ) ) {
				$parsed = $this->parse_border_radius( $prop, $value );
				if ( null !== $parsed ) {
					$this->merge_dimensions( $result, $parsed );
					continue;
				}
				$result[ $prop ] = $this->wrap_string( $value );
				continue;
			}

			// border-width (shorthand + per-side)
			if ( 'border-width' === $prop || isset( self::BORDER_WIDTH_SIDE_MAP[ $prop ] ) ) {
				$parsed = $this->parse_border_width( $prop, $value );
				if ( null !== $parsed ) {
					$this->merge_dimensions( $result, $parsed );
					continue;
				}
				$result[ $prop ] = $this->wrap_string( $value );
				continue;
			}

			// positioning (top/right/bottom/left → inset-*; inset-* pass through)
			if ( in_array( $prop, self::POSITIONING_KEYS, true ) ) {
				$parsed = $this->parse_positioning( $prop, $value );
				if ( null !== $parsed ) {
					$result[ $parsed['output_key'] ] = $parsed['prop'];
					continue;
				}
				$result[ $prop ] = $this->wrap_string( $value );
				continue;
			}

			// flex shorthand
			if ( 'flex' === $prop ) {
				$parsed = $this->parse_flex_shorthand( $value );
				if ( null !== $parsed ) {
					$result[ $prop ] = $parsed;
					continue;
				}
				$result[ $prop ] = $this->wrap_string( $value );
				continue;
			}

			// color props
			if ( in_array( $prop, self::color_props(), true ) ) {
				$color = $this->resolve_color( $value );
				$result[ $prop ] = null !== $color ? $color : $this->wrap_string( $value );
				continue;
			}

			// box-shadow
			if ( 'box-shadow' === $prop ) {
				$result[ $prop ] = $this->parse_box_shadow( $value );
				continue;
			}

			// opacity
			if ( 'opacity' === $prop ) {
				$parsed          = $this->parse_opacity( $value );
				$result[ $prop ] = null !== $parsed ? $parsed : $this->wrap_string( $value );
				continue;
			}

			// background-color → background.color (Background_Prop_Type has a direct `color` key)
			if ( 'background-color' === $prop ) {
				$color = $this->resolve_color( $value );
				if ( null !== $color ) {
					$result['background'] = $this->wrap_background_color( $color );
				}
				continue;
			}

			// background shorthand (color-only recognition; else string)
			if ( 'background' === $prop ) {
				$color = $this->resolve_color( $value );
				if ( null !== $color ) {
					$result[ $prop ] = $this->wrap_background_color( $color );
				} else {
					$result[ $prop ] = $this->wrap_string( $value );
				}
				continue;
			}

			// background-size
			if ( 'background-size' === $prop ) {
				$parsed          = $this->resolve_size( $value );
				$result[ $prop ] = null !== $parsed ? $parsed : $this->wrap_string( $value );
				continue;
			}

			// line-height: Size_Prop_Type only (no number member in the Union).
			// Unitless ratio → {size:N, unit:"em"} — matches CSS unitless line-height semantics
			// and the html-css-converter plugin's line-height-converter.
			if ( 'line-height' === $prop ) {
				$sz = $this->resolve_size( $value );
				if ( null !== $sz ) {
					$result[ $prop ] = $sz;
					continue;
				}
				if ( is_numeric( $value ) ) {
					$n               = (float) $value;
					$result[ $prop ] = $this->wrap_size( [
						'size' => 0.0 === $n ? 0 : $n,
						'unit' => 'em',
					] );
					continue;
				}
				$result[ $prop ] = $this->wrap_string( $value );
				continue;
			}

			// number props
			if ( in_array( $prop, self::number_props(), true ) ) {
				if ( is_numeric( $value ) ) {
					$result[ $prop ] = $this->wrap_number( $value );
				} else {
					$result[ $prop ] = $this->wrap_string( $value );
				}
				continue;
			}

			// size props
			if ( in_array( $prop, self::size_props(), true ) ) {
				$parsed          = $this->resolve_size( $value );
				$result[ $prop ] = null !== $parsed ? $parsed : $this->wrap_string( $value );
				continue;
			}

			// string fallback (display, position, transform, font-*, justify/align-*, etc.)
			$result[ $prop ] = $this->wrap_string( $value );
		}

		return $result;
	}

	private function wrap_background_color( array $color ): array {
		return [
			'$$type' => 'background',
			'value'  => [
				'color' => $color,
			],
		];
	}

	private const VALID_STRING_PROPS = [
		'display',
		'position',
		'flex-direction',
		'flex-wrap',
		'flex-flow',
		'justify-content',
		'justify-self',
		'justify-items',
		'align-items',
		'align-content',
		'align-self',
		'text-align',
		'text-decoration',
		'text-decoration-line',
		'text-decoration-style',
		'text-transform',
		'text-overflow',
		'font-weight',
		'font-style',
		'font-variant',
		'font-family',
		'font-stretch',
		'overflow',
		'overflow-x',
		'overflow-y',
		'cursor',
		'pointer-events',
		'user-select',
		'visibility',
		'resize',
		'white-space',
		'word-break',
		'word-wrap',
		'overflow-wrap',
		'background-repeat',
		'background-position',
		'background-attachment',
		'background-origin',
		'border-style',
		'outline-style',
		'object-fit',
		'object-position',
		'mix-blend-mode',
		'float',
		'clear',
		'transition',
		'animation',
		'transform',
		'transform-origin',
		'transform-style',
		'box-sizing',
		'list-style',
		'list-style-type',
		'list-style-position',
		'content',
		'vertical-align',
		'direction',
		'writing-mode',
		'will-change',
		'aspect-ratio',
		'grid-template-columns',
		'grid-template-rows',
		'grid-template',
		'grid-column',
		'grid-row',
		'grid-area',
		'column-span',
		'isolation',
	];

	protected function get_v4_gap_hint( string $prop, string $value ): ?string {
		if ( str_starts_with( $prop, '-' ) ) {
			return 'Vendor-prefixed props have no v4 typed equivalent — renders as raw CSS via custom_css.';
		}
		if ( 'background' === $prop ) {
			return 'background supports solid colors (hex, rgb, named, transparent) as typed props; gradients and other complex values render as raw CSS via custom_css.';
		}
		if ( in_array( $prop, [ 'background-clip', 'background-blend-mode' ], true ) ) {
			return 'No v4 typed-prop equivalent — renders as raw CSS via custom_css.';
		}
		if ( 'border' === $prop ) {
			return 'border shorthand could not be fully parsed. For typed props use border-width, border-style, and border-color separately.';
		}
		return null;
	}

	protected function parse_border_shorthand( string $value ): ?array {
		static $border_styles         = [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ];
		static $border_width_keywords = [ 'thin', 'medium', 'thick' ];

		$tokens = $this->split_whitespace_paren_aware( trim( $value ) );
		if ( empty( $tokens ) ) {
			return null;
		}

		$width = null;
		$style = null;
		$color = null;

		foreach ( $tokens as $token ) {
			$lower = strtolower( $token );

			if ( null === $style && in_array( $lower, $border_styles, true ) ) {
				$style = $lower;
				continue;
			}
			if ( null === $width ) {
				if ( in_array( $lower, $border_width_keywords, true ) ) {
					$width = $lower;
					continue;
				}
				if ( null !== $this->parse_number_unit( $token ) ) {
					$width = $token;
					continue;
				}
			}
			if ( null === $color && null !== $this->resolve_color( $token ) ) {
				$color = $token;
				continue;
			}
			return null;
		}

		$decls = [];
		if ( null !== $width ) {
			$decls[] = "border-width: $width";
		}
		if ( null !== $style ) {
			$decls[] = "border-style: $style";
		}
		if ( null !== $color ) {
			$decls[] = "border-color: $color";
		}

		return ! empty( $decls ) ? $decls : null;
	}

	protected function is_v4_gap( string $prop, string $value ): bool {
		// Vendor-prefixed props are never valid v4 prop keys.
		if ( str_starts_with( $prop, '-' ) ) {
			return true;
		}

		// background with a non-color value cannot be typed as $$type:"background".
		if ( 'background' === $prop ) {
			return null === $this->resolve_color( $value );
		}

		return ! $this->is_known_v4_prop( $prop );
	}

	private function is_known_v4_prop( string $prop ): bool {
		// margin / padding (shorthand + axes + side variants)
		if ( 'margin' === $prop || 'padding' === $prop ||
			str_starts_with( $prop, 'margin-' ) || str_starts_with( $prop, 'padding-' ) ) {
			return true;
		}

		// border-radius (shorthand + per-corner)
		if ( 'border-radius' === $prop || str_ends_with( $prop, '-radius' ) ) {
			return true;
		}

		// border-width (shorthand + per-side)
		if ( 'border-width' === $prop ||
			( str_starts_with( $prop, 'border-' ) && str_ends_with( $prop, '-width' ) ) ) {
			return true;
		}

		// positioning
		if ( in_array( $prop, self::POSITIONING_KEYS, true ) ) {
			return true;
		}

		// flex shorthand
		if ( 'flex' === $prop ) {
			return true;
		}

		// color props
		if ( in_array( $prop, self::color_props(), true ) ) {
			return true;
		}

		// explicitly handled scalar props
		if ( in_array( $prop, [ 'box-shadow', 'opacity', 'background-color', 'background', 'background-size', 'line-height' ], true ) ) {
			return true;
		}

		// number props
		if ( in_array( $prop, self::number_props(), true ) ) {
			return true;
		}

		// size props
		if ( in_array( $prop, self::size_props(), true ) ) {
			return true;
		}

		// string props valid in the v4 schema
		return in_array( $prop, self::VALID_STRING_PROPS, true );
	}
}
