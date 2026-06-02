<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Css_Prop_Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Neutralizes the per-widget `-base` CSS that ships with v4 atomic widgets.
 *
 * Each atomic widget registers a base style class (e.g. `.elementor .e-flexbox-base { padding: 10px; ... }`)
 * which applies to every instance unless an element-level local class overrides each property explicitly.
 * Friendly-spec builds local classes from caller CSS, so unset properties silently fall through to the
 * base defaults — surprising for callers who expect "what I wrote is what I get".
 *
 * `apply()` layers the resets underneath the caller's typed props: any prop key absent from the user's
 * CSS gets the reset value; user-supplied props win by key. Functional `display` is preserved
 * (e-flexbox stays `display: flex`, e-div-block stays `display: block`) so the widget's layout role
 * is intact. Only "incidental" base props (padding, decorative button styles) get reset.
 */
class Base_Styles_Reset {

	private const BASE_STYLE_RESETS = [
		'e-flexbox' => 'padding: 0;',
		'e-div-block' => 'padding: 0; min-width: auto;',
		'e-heading' => '',
		'e-paragraph' => '',
		'e-button' => 'text-align: left; padding-block-start: 0; padding-block-end: 0; padding-inline-start: 0; padding-inline-end: 0; border-radius: 0; background-color: transparent;',
		'e-image' => '',
		'e-svg' => '',
	];

	public static function has_resets_for( string $el_type ): bool {
		return ! empty( self::BASE_STYLE_RESETS[ $el_type ] ?? '' );
	}

	public static function apply( array $user_props, string $el_type ): array {
		return self::apply_widget_type_resets( $user_props, $el_type );
	}

	private static function apply_widget_type_resets( array $user_props, string $el_type ): array {
		$reset_css = self::BASE_STYLE_RESETS[ $el_type ] ?? '';

		if ( '' === $reset_css ) {
			return $user_props;
		}

		$reset_props = Css_Prop_Converter::make()->convert( $reset_css )->get_props();

		foreach ( $reset_props as $key => $value ) {
			if ( ! array_key_exists( $key, $user_props ) ) {
				$user_props[ $key ] = $value;
			}
		}

		return $user_props;
	}
}
