<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A single stored variant on a local style (breakpoint + optional pseudo-state)
 * that knows how to render itself into the MCP round-trip CSS format.
 *
 * Wrapping in `@media(--<breakpoint>) { ... }` is intentionally not this
 * object's responsibility — a variant has no visibility into its siblings, so
 * merging by breakpoint lives on `Local_Style`.
 */
class Local_Style_Variant {

	const PSEUDO_STATES = [ 'hover', 'focus', 'active' ];

	private array $meta;
	private array $props;
	private string $custom_css;

	private function __construct( array $meta, array $props, string $custom_css ) {
		$this->meta       = $meta;
		$this->props      = $props;
		$this->custom_css = $custom_css;
	}

	public static function from_array( array $variant ): self {
		return new self(
			is_array( $variant['meta'] ?? null ) ? $variant['meta'] : [],
			is_array( $variant['props'] ?? null ) ? $variant['props'] : [],
			Utils::decode_string( $variant['custom_css']['raw'] ?? '', '' )
		);
	}

	public function breakpoint(): string {
		return $this->meta['breakpoint'] ?? Local_Style::DESKTOP_BREAKPOINT;
	}

	public function to_css_fragment(): string {
		$declarations = $this->render_declarations();

		if ( '' === $declarations ) {
			return '';
		}

		$state = $this->meta['state'] ?? null;

		if ( null === $state ) {
			return $declarations;
		}

		if ( ! in_array( $state, self::PSEUDO_STATES, true ) ) {
			return '';
		}

		return sprintf( '&:%s { %s }', $state, $declarations );
	}

	private function render_declarations(): string {
		$parts = [];

		foreach ( Style_Props_To_Css::to_map( $this->props ) as $prop => $value ) {
			$parts[] = $prop . ': ' . $value . ';';
		}

		if ( '' !== $this->custom_css ) {
			$parts[] = trim( $this->custom_css );
		}

		return implode( ' ', $parts );
	}
}
