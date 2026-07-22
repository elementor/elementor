<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Expanders;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Var_Token_Resolver;
use Elementor\Modules\AtomicWidgets\CssConverter\Shorthand_Expander_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;
use Elementor\Modules\Variables\Services\Variables_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Expands a `background` shorthand into its constituent longhand declarations so the
 * existing per-property converters can process each one independently.
 *
 * Each comma-separated layer is parsed into role slots: image, repeat, attachment, clip, position,
 * size, and (last layer only) color. Slot values are then aggregated across layers to form the
 * longhand values:
 *  - background-image:      comma-joined per layer (none for layers without an explicit image).
 *  - background-repeat:     comma-joined if all layers that have an image also specify it.
 *  - background-attachment: same.
 *  - background-position:   same.
 *  - background-size:       same (position must also be present when size is used).
 *  - background-color:      from the last layer only.
 *  - background-clip:       from the last layer only (single scalar in our model).
 *
 * A layer whose tokens cannot be unambiguously classified declines the entire shorthand (returns [])
 * so the original declaration is kept and routed to custom_css.
 */
class Background_Shorthand_Expander extends Shorthand_Expander_Base {
	private ?Variables_Service $variables_service;

	const REPEAT_ENUM = [ 'repeat', 'repeat-x', 'repeat-y', 'no-repeat' ];
	const ATTACHMENT_ENUM = [ 'fixed', 'scroll' ];
	const CLIP_ENUM = [ 'border-box', 'padding-box', 'content-box', 'text' ];
	const POSITION_KEYWORDS = [ 'top', 'bottom', 'left', 'right', 'center' ];
	const SIZE_KEYWORDS = [ 'cover', 'contain', 'auto' ];

	public function __construct( ?Variables_Service $variables_service = null ) {
		$this->variables_service = $variables_service;
	}

	protected function get_supported_properties(): array {
		return [ 'background' ];
	}

	const ALL_LONGHANDS = [
		'background-image',
		'background-repeat',
		'background-attachment',
		'background-position',
		'background-size',
		'background-clip',
		'background-color',
	];

	protected function expand_null( array $rule ): array {
		return array_map( fn( $p ) => $this->null_rule( $p ), self::ALL_LONGHANDS );
	}

	protected function do_expand( array $rule ): array {
		$layers = Css_Token_Splitter::split_by_comma( trim( $rule['value'] ) );

		if ( empty( $layers ) ) {
			return [];
		}

		$parsed = [];

		foreach ( $layers as $layer ) {
			$result = $this->parse_layer( trim( $layer ) );

			if ( null === $result ) {
				return [];
			}

			$parsed[] = $result;
		}

		return $this->build_rules( $parsed );
	}

	/**
	 * @return array{image:string|null,repeat:string|null,attachment:string|null,clip:string|null,position:string|null,size:string|null,color:string|null}|null
	 */
	private function parse_layer( string $layer ): ?array {
		if ( $this->is_var_only_layer( $layer ) ) {
			return $this->parse_var_only_layer( $layer );
		}

		$tokens = Css_Token_Splitter::split_by_whitespace( $layer );

		$image = null;
		$repeat = null;
		$attachment = null;
		$clip = null;
		$color = null;
		$position_tokens = [];
		$size_tokens = [];
		$after_slash = false;

		$n = count( $tokens );

		for ( $i = 0; $i < $n; $i++ ) {
			$token = $tokens[ $i ];
			$lower = strtolower( $token );

			if ( '/' === $token ) {
				$after_slash = true;
				continue;
			}

			if ( $after_slash ) {
				if ( $this->is_size_token( $token ) ) {
					$size_tokens[] = $token;
					if ( count( $size_tokens ) >= 2 ) {
						$after_slash = false;
					}
					continue;
				}
				$after_slash = false;
			}

			if ( $this->is_image_token( $lower ) ) {
				if ( null !== $image ) {
					return null;
				}
				$image = $token;
				continue;
			}

			if ( in_array( $lower, self::REPEAT_ENUM, true ) ) {
				if ( null !== $repeat ) {
					return null;
				}
				$repeat = $token;
				continue;
			}

			if ( in_array( $lower, self::ATTACHMENT_ENUM, true ) ) {
				if ( null !== $attachment ) {
					return null;
				}
				$attachment = $token;
				continue;
			}

			if ( in_array( $lower, self::CLIP_ENUM, true ) ) {
				if ( null !== $clip ) {
					return null;
				}
				$clip = $token;
				continue;
			}

			if ( $this->is_position_token( $lower ) ) {
				$position_tokens[] = $token;
				if ( count( $position_tokens ) > 2 ) {
					return null;
				}
				continue;
			}

			if ( null !== $color ) {
				return null;
			}

			$color = $token;
		}

		if ( ! empty( $size_tokens ) && empty( $position_tokens ) ) {
			return null;
		}

		$position = empty( $position_tokens ) ? null : implode( ' ', $position_tokens );
		$size = empty( $size_tokens ) ? null : implode( ' ', $size_tokens );

		return compact( 'image', 'repeat', 'attachment', 'clip', 'color', 'position', 'size' );
	}

	private function is_var_only_layer( string $layer ): bool {
		return Css_Var_Token_Resolver::is_var_only_token( $layer );
	}

	/**
	 * @return array{image:string|null,repeat:string|null,attachment:string|null,clip:string|null,position:string|null,size:string|null,color:string|null}|null
	 */
	private function parse_var_only_layer( string $layer ): ?array {
		$resolved_type = Css_Var_Token_Resolver::resolve_var_only_token_type( $this->variables_service, $layer );
		$empty_layer = $this->empty_layer();

		if ( 'color' === $resolved_type ) {
			$empty_layer['color'] = $layer;

			return $empty_layer;
		}

		if ( 'size' === $resolved_type ) {
			$empty_layer['position'] = 'center center';
			$empty_layer['size'] = $layer;

			return $empty_layer;
		}

		return null;
	}

	/**
	 * @return array{image:string|null,repeat:string|null,attachment:string|null,clip:string|null,position:string|null,size:string|null,color:string|null}
	 */
	private function empty_layer(): array {
		return [
			'image' => null,
			'repeat' => null,
			'attachment' => null,
			'clip' => null,
			'position' => null,
			'size' => null,
			'color' => null,
		];
	}

	private function is_image_token( string $lower ): bool {
		return 'none' === $lower
			|| 0 === strpos( $lower, 'url(' )
			|| false !== strpos( $lower, '-gradient(' );
	}

	private function is_size_token( string $token ): bool {
		return in_array( strtolower( $token ), self::SIZE_KEYWORDS, true )
			|| null !== Size_Plain_Resolver::parse( $token );
	}

	private function is_position_token( string $lower ): bool {
		return in_array( $lower, self::POSITION_KEYWORDS, true )
			|| null !== Size_Plain_Resolver::parse( $lower );
	}

	/**
	 * @param array[] $parsed
	 * @return array[]
	 */
	private function build_rules( array $parsed ): array {
		$layer_count = count( $parsed );
		$rules = [];

		$has_image = ! empty( array_filter( $parsed, fn( $l ) => null !== $l['image'] ) );

		if ( $has_image ) {
			$images = array_map( fn( $l ) => $l['image'] ?? 'none', $parsed );
			$rules['background-image'] = implode( ', ', $images );
		}

		$per_layer_slots = [
			'repeat' => 'background-repeat',
			'attachment' => 'background-attachment',
			'position' => 'background-position',
			'size' => 'background-size',
		];

		foreach ( $per_layer_slots as $slot => $property ) {
			$values = array_column( $parsed, $slot );
			$non_null = array_filter( $values, fn( $v ) => null !== $v );

			if ( empty( $non_null ) ) {
				continue;
			}

			if ( count( $non_null ) === 1 || count( $non_null ) === $layer_count ) {
				$rules[ $property ] = implode( ', ', $non_null );
			}
		}

		$last = end( $parsed );

		if ( null !== $last['clip'] ) {
			$rules['background-clip'] = $last['clip'];
		}

		if ( null !== $last['color'] ) {
			$rules['background-color'] = $last['color'];
		}

		return $this->emit_rules( $rules );
	}

	/**
	 * @param array<string, string> $longhands
	 * @return array[]
	 */
	private function emit_rules( array $longhands ): array {
		$rules = [];

		foreach ( $longhands as $property => $value ) {
			$rules[] = [
				'property' => $property,
				'value' => $value,
				'declaration' => $property . ': ' . $value,
			];
		}

		return $rules;
	}
}
