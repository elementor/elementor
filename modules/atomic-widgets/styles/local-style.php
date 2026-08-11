<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Represents a single stored local style (the first entry in an element's
 * `styles` map) and knows how to render its variants into the MCP round-trip
 * CSS string: top-level declarations for desktop, `&:state { ... }` for
 * pseudo variants, and `@media(--<breakpoint>) { ... }` for non-desktop
 * breakpoints — merged into one media block per breakpoint.
 */
class Local_Style {

	const DESKTOP_BREAKPOINT = 'desktop';

	private string $id;

	/**
	 * @var Local_Style_Variant[]
	 */
	private array $variants;

	/**
	 * @param Local_Style_Variant[] $variants
	 */
	private function __construct( string $id, array $variants ) {
		$this->id       = $id;
		$this->variants = $variants;
	}

	public static function from_styles_map( array $styles ): ?self {
		$entry = self::pick_first_entry( $styles );

		if ( null === $entry ) {
			return null;
		}

		$raw_variants = is_array( $entry['variants'] ?? null ) ? $entry['variants'] : [];

		if ( empty( $raw_variants ) ) {
			return null;
		}

		$variants = array_map(
			[ Local_Style_Variant::class, 'from_array' ],
			$raw_variants
		);

		return new self( (string) ( $entry['id'] ?? '' ), $variants );
	}

	public function id(): string {
		return $this->id;
	}

	public function to_css(): string {
		$grouped = $this->group_variants_by_breakpoint();

		$desktop_variants = $grouped[ self::DESKTOP_BREAKPOINT ] ?? [];
		unset( $grouped[ self::DESKTOP_BREAKPOINT ] );

		$sections = [];

		$desktop_css = $this->concat_fragments( $desktop_variants );
		if ( '' !== $desktop_css ) {
			$sections[] = $desktop_css;
		}

		foreach ( $grouped as $breakpoint => $variants ) {
			$inner = $this->concat_fragments( $variants );

			if ( '' === $inner ) {
				continue;
			}

			$sections[] = sprintf( '@media(--%s) { %s }', $breakpoint, $inner );
		}

		return implode( "\n", $sections );
	}

	/**
	 * @return array<string, Local_Style_Variant[]>
	 */
	private function group_variants_by_breakpoint(): array {
		$grouped = [];

		foreach ( $this->variants as $variant ) {
			$grouped[ $variant->breakpoint() ][] = $variant;
		}

		return $grouped;
	}

	/**
	 * @param Local_Style_Variant[] $variants
	 */
	private function concat_fragments( array $variants ): string {
		$fragments = [];

		foreach ( $variants as $variant ) {
			$fragment = $variant->to_css_fragment();

			if ( '' !== $fragment ) {
				$fragments[] = $fragment;
			}
		}

		return implode( ' ', $fragments );
	}

	private static function pick_first_entry( array $styles ): ?array {
		if ( empty( $styles ) ) {
			return null;
		}

		$first = reset( $styles );

		return is_array( $first ) ? $first : null;
	}
}
