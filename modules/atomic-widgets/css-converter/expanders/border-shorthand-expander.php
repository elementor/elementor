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
 * Expands a `border` / `border-{side}` shorthand into its width / style / color longhands. There is no
 * aggregate Border prop type; these are independent longhands, so this is a split, not a merge. The
 * concrete longhand property names are injected, so the same logic serves the all-sides `border`
 * (border-width/style/color) and each per-side shorthand (e.g. border-top-width/style/color).
 *
 * Each token is classified once: a border-style keyword (enum from the live schema) -> style; a length
 * the Size parser accepts, or a width keyword (thin/medium/thick) -> width; anything else -> color (the
 * catch-all, mirroring the raw-passthrough color converter). Only the parts present are emitted (omitted
 * parts are not reset to CSS initials). A second token for an already filled role is ambiguous, so the
 * whole expansion declines and the original shorthand is kept for custom_css. A produced longhand can
 * still individually decline downstream (e.g. `border-{side}-style`, which has no converter), degrading
 * to custom_css for that part only.
 */
class Border_Shorthand_Expander extends Shorthand_Expander_Base {
	const WIDTH_KEYWORDS = [ 'thin', 'medium', 'thick' ];
	const ROLE_WIDTH = 'width';
	const ROLE_STYLE = 'style';
	const ROLE_COLOR = 'color';

	private string $property;

	/**
	 * @var array<string, string> Role (width|style|color) -> emitted longhand property name.
	 */
	private array $longhands;

	/**
	 * @var string[]
	 */
	private array $style_keywords;

	private ?Variables_Service $variables_service;

	/**
	 * @param string                $property       The shorthand this expander owns (border, border-top, ...).
	 * @param array<string, string> $longhands      Role -> longhand property name to emit.
	 * @param string[]              $style_keywords The border-style enum, sourced from the live schema.
	 */
	public function __construct(
		string $property,
		array $longhands,
		array $style_keywords,
		?Variables_Service $variables_service = null
	) {
		$this->property = $property;
		$this->longhands = $longhands;
		$this->style_keywords = $style_keywords;
		$this->variables_service = $variables_service;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function expand_null( array $rule ): array {
		return array_map( fn( $p ) => $this->null_rule( $p ), array_values( $this->longhands ) );
	}

	protected function do_expand( array $rule ): array {
		$value = $rule['value'];

		$tokens = Css_Token_Splitter::split_by_whitespace( trim( $value ) );

		if ( empty( $tokens ) ) {
			return [];
		}

		$slots = [
			self::ROLE_WIDTH => null,
			self::ROLE_STYLE => null,
			self::ROLE_COLOR => null,
		];

		foreach ( $tokens as $token ) {
			$role = $this->classify_token( $token );

			if ( null === $role || null !== $slots[ $role ] ) {
				return [];
			}

			$slots[ $role ] = $token;
		}

		$rules = [];

		foreach ( $slots as $role => $slot_value ) {
			if ( null === $slot_value ) {
				continue;
			}

			$property = $this->longhands[ $role ];

			$rules[] = [
				'property' => $property,
				'value' => $slot_value,
				'declaration' => $property . ': ' . $slot_value,
			];
		}

		return $rules;
	}

	private function classify_token( string $token ): ?string {
		if ( Css_Var_Token_Resolver::is_var_only_token( $token ) ) {
			$resolved_type = Css_Var_Token_Resolver::resolve_var_only_token_type( $this->variables_service, $token );

			if ( 'color' === $resolved_type ) {
				return self::ROLE_COLOR;
			}

			if ( 'size' === $resolved_type ) {
				return self::ROLE_WIDTH;
			}

			return null;
		}

		return $this->classify_literal_token( $token );
	}

	private function classify_literal_token( string $token ): string {
		$lower = strtolower( $token );

		if ( in_array( $lower, $this->style_keywords, true ) ) {
			return self::ROLE_STYLE;
		}

		if ( in_array( $lower, self::WIDTH_KEYWORDS, true ) || null !== Size_Plain_Resolver::parse( $token ) ) {
			return self::ROLE_WIDTH;
		}

		return self::ROLE_COLOR;
	}
}
