<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Neutralizes the per-widget `-base` CSS that ships with v4 atomic widgets.
 *
 * Each atomic widget registers a base style class (e.g. `.elementor .e-flexbox-base { padding: 10px; ... }`)
 * which applies to every instance unless an element-level local class overrides each property explicitly.
 * make-page-ability builds local classes from a friendly spec, so unset properties silently fall through
 * to the base defaults — surprising for callers who expect "what I wrote is what I get".
 *
 * This trait owns a per-element-type map of reset CSS strings. When the consumer parses a user's CSS
 * into v4 props, it calls `merge_base_style_resets()` to layer the resets underneath: any prop key
 * absent from the user's CSS gets the reset value; user-supplied props win by key.
 *
 * Functional `display` is preserved (e-flexbox stays `display: flex`, e-div-block stays `display: block`,
 * etc.) so choosing a widget type still implies its layout role. Only "incidental" base props (padding,
 * min-width, decorative button styles, ...) get reset.
 *
 * Consumer must also use Css_Shorthand_Parser — `merge_base_style_resets()` calls `$this->css_to_props()`.
 */
trait Base_Styles_Reset {

	private const BASE_STYLE_RESETS = [
		'e-flexbox'   => 'padding: 0; flex-direction: column;',
		'e-div-block' => 'padding: 0; min-width: auto;',
		'e-heading'   => '',
		'e-paragraph' => '',
		'e-button'    => 'background: transparent; padding: 0; border-radius: 0; text-align: start; text-decoration: none;',
		'e-image'     => '',
	];

	protected function merge_base_style_resets( array $user_props, string $el_type ): array {
		$reset_css = self::BASE_STYLE_RESETS[ $el_type ] ?? '';
		if ( '' === $reset_css ) {
			return $user_props;
		}

		$reset_props = $this->css_to_props( $reset_css );

		foreach ( $reset_props as $key => $value ) {
			if ( ! array_key_exists( $key, $user_props ) ) {
				$user_props[ $key ] = $value;
			}
		}

		return $user_props;
	}
}
