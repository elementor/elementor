<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps legacy V3-style element_config keys to V4 style CSS guidance for skipped-property warnings.
 */
class V4_Legacy_Key_Hints {

	const LAYOUT_ELEMENT_TYPES = [ 'e-flexbox', 'e-div-block' ];

	const LAYOUT_HINTS = [
		'flex_direction' => 'flex-direction',
		'flex_align_items' => 'align-items',
		'flex_justify_content' => 'justify-content',
		'gap' => 'gap',
		'flex_gap' => 'gap',
		'content_width' => 'max-width',
		'width' => 'max-width',
	];

	const BUTTON_HINTS = [
		'size' => 'padding and font-size',
		'align' => 'text-align on the parent container',
	];

	public static function hint_for( string $element_type, string $property ): ?string {
		if ( in_array( $element_type, self::LAYOUT_ELEMENT_TYPES, true ) ) {
			return self::LAYOUT_HINTS[ $property ] ?? null;
		}

		if ( 'e-button' === $element_type ) {
			return self::BUTTON_HINTS[ $property ] ?? null;
		}

		return null;
	}

	public static function warning_suffix( string $element_type, string $property, string $config_id ): ?string {
		$hint = self::hint_for( $element_type, $property );

		if ( null === $hint ) {
			return null;
		}

		if ( str_contains( $hint, ' on the parent' ) ) {
			return sprintf(
				'Use `%s` in the `style` CSS string instead (e.g. "style": { "<parent-config-id>": "text-align: center; ..." }).',
				$hint
			);
		}

		if ( str_contains( $hint, ' and ' ) ) {
			return sprintf(
				'Use `%s` in the `style` CSS string instead (e.g. "style": { "%s": "padding: 1rem 2.5rem; font-size: 1rem; ..." }).',
				$hint,
				$config_id
			);
		}

		return sprintf(
			'Use `%s` in the `style` CSS string instead (e.g. "style": { "%s": "%s: column; ..." }).',
			$hint,
			$config_id,
			$hint
		);
	}
}
