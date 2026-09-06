<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Single source of truth for the shared `style` field description that every MCP tool taking a
 * raw CSS string exposes (`build-composition`, `manage-elements`, `manage-classes`,
 * `manage-default-styles`, `manage-component`). Callers prepend a short tool-specific intro
 * (e.g. "Record mapping configuration-id → …") and append this contract verbatim so the trap
 * list, breakpoint spelling, and variable/class rules never drift between tools.
 *
 * Elaboration lives in `elementor://build-guidelines`; the tool-side description carries the
 * short authoritative teaser only.
 */
class Style_Field_Contract {

	public static function description( string $intro = '' ): string {
		$trailing = self::trap_list();

		return '' !== $intro
			? trim( $intro ) . ' ' . $trailing
			: $trailing;
	}

	private static function trap_list(): string {
		return 'Supports &:hover/&:focus/&:active and @media(--breakpoint) blocks (--mobile, --tablet, --laptop). Variables by label — var(--label), never the internal --e-gv-* prefix. Global classes attach by label from elementor://global-classes, never the internal g-* ids; they are prepended before local styles (local styles win on conflicts). CSS routed to custom_css may not render reliably — common traps: pixel queries (@media (max-width:…) — use @media(--breakpoint) instead), two-value gap / row-gap (only column-gap converts), per-side border-color / border-style, elliptical border-radius (slash form), transform matrix / skew / perspective / rotate3d, box-shadow with var(...) inside, font-family fallback stacks (single Google Font name only), unknown var() references. animation and its longhands are rejected outright. See elementor://build-guidelines for depth.';
	}
}
