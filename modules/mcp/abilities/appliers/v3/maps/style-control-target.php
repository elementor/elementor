<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Resolved_Patch_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Control_Target {

	const KIND_SIMPLE = 'simple';
	const KIND_TYPOGRAPHY = 'typography';
	const KIND_BORDER = 'border';
	const KIND_BOX_SHADOW = 'box_shadow';

	const CHOICE_RESOLVER = 'choice';
	const BORDER_STYLE_RESOLVER = 'border_style';
	const BOX_SHADOW_RESOLVER = 'box_shadow';
	const BOX_SHADOW_TOGGLE_RESOLVER = 'box_shadow_toggle';

	const TYPOGRAPHY_TOGGLE_FIELD = 'typography';
	const TYPOGRAPHY_TOGGLE_RESOLVER = 'typography_toggle';
	const TYPOGRAPHY_TOGGLE_VALUE = 'custom';

	const TYPOGRAPHY_FIELDS = [
		'font-family' => [
			'field' => 'font_family',
			'resolver' => 'font_family',
			'responsive' => false,
		],
		'font-size' => [
			'field' => 'font_size',
			'resolver' => 'slider',
			'responsive' => true,
		],
		'font-weight' => [
			'field' => 'font_weight',
			'resolver' => 'text',
			'responsive' => false,
		],
		'text-transform' => [
			'field' => 'text_transform',
			'resolver' => 'text',
			'responsive' => false,
		],
		'font-style' => [
			'field' => 'font_style',
			'resolver' => 'text',
			'responsive' => false,
		],
		'text-decoration' => [
			'field' => 'text_decoration',
			'resolver' => 'text',
			'responsive' => false,
		],
		'line-height' => [
			'field' => 'line_height',
			'resolver' => 'line_height',
			'responsive' => true,
		],
		'letter-spacing' => [
			'field' => 'letter_spacing',
			'resolver' => 'slider',
			'responsive' => true,
		],
		'word-spacing' => [
			'field' => 'word_spacing',
			'resolver' => 'slider',
			'responsive' => true,
		],
	];

	const RESOLVER_SHAPES = [
		'slider' => V3_Resolved_Patch_Validator::SHAPE_DIMENSION,
		'dimension' => V3_Resolved_Patch_Validator::SHAPE_DIMENSION,
		'line_height' => V3_Resolved_Patch_Validator::SHAPE_DIMENSION,
		'sides' => V3_Resolved_Patch_Validator::SHAPE_SIDES,
		self::BOX_SHADOW_RESOLVER => V3_Resolved_Patch_Validator::SHAPE_BOX_SHADOW,
	];

	/**
	 * @return array{kind: string, resolver: string, responsive: bool, destinations: array<int, array{setting: string, shape: string, resolver: string}>}
	 */
	public static function control( string $key, string $resolver, bool $responsive = false ): array {
		return [
			'kind' => self::KIND_SIMPLE,
			'resolver' => $resolver,
			'responsive' => $responsive,
			'destinations' => [
				self::destination( $key, $resolver ),
			],
		];
	}

	/**
	 * A single field of a Group_Control_Typography. Writing the field also switches the
	 * group's popover toggle to `custom`, otherwise Elementor ignores the field value.
	 *
	 * @return array{kind: string, resolver: string, responsive: bool, destinations: array<int, array{setting: string, shape: string, resolver: string}>, companion_settings: array<string, string>}
	 */
	public static function typography( string $prefix, string $field, string $resolver, bool $responsive = false ): array {
		$toggle_key = $prefix . '_' . self::TYPOGRAPHY_TOGGLE_FIELD;

		return [
			'kind' => self::KIND_TYPOGRAPHY,
			'resolver' => $resolver,
			'responsive' => $responsive,
			'destinations' => [
				self::destination( $prefix . '_' . $field, $resolver ),
				self::destination( $toggle_key, self::TYPOGRAPHY_TOGGLE_RESOLVER ),
			],
			'companion_settings' => [
				$toggle_key => self::TYPOGRAPHY_TOGGLE_VALUE,
			],
		];
	}

	/**
	 * Every CSS property backed by one Group_Control_Typography, keyed for a target's
	 * `css_properties`, all in the given state. Pass the group's `exclude` as CSS properties.
	 *
	 * @param string   $prefix
	 * @param string   $state
	 * @param string[] $excluded_properties
	 * @return array<string, array<string, array>>
	 */
	public static function typography_group( string $prefix, string $state = 'default', array $excluded_properties = [] ): array {
		$properties = [];

		foreach ( array_diff_key( self::TYPOGRAPHY_FIELDS, array_flip( $excluded_properties ) ) as $property => $field ) {
			$properties[ $property ] = [
				$state => self::typography( $prefix, $field['field'], $field['resolver'], $field['responsive'] ),
			];
		}

		return $properties;
	}

	/**
	 * A SELECT / CHOOSE control whose option keys (or `selectors_dictionary` values) are CSS
	 * values. The compiler bakes the `css value => option key` map into `value_map`.
	 *
	 * @param string                     $key
	 * @param bool                       $responsive
	 * @param array<string, string>|null $css_values Explicit `css value => option key` pairs.
	 */
	public static function choice( string $key, bool $responsive = false, ?array $css_values = null ): array {
		$descriptor = self::control( $key, self::CHOICE_RESOLVER, $responsive );

		if ( null !== $css_values ) {
			$descriptor['css_values'] = $css_values;
		}

		return $descriptor;
	}

	/**
	 * The `border` shorthand of a Group_Control_Border. Only the style is guaranteed by the
	 * shorthand, so width and color are optional destinations.
	 */
	public static function border( string $prefix ): array {
		return [
			'kind' => self::KIND_BORDER,
			'prefix' => $prefix,
			'resolver' => 'border',
			'responsive' => false,
			'destinations' => [
				self::destination( $prefix . '_border', self::BORDER_STYLE_RESOLVER ),
				self::destination( $prefix . '_width', 'sides' ) + [ 'optional' => true ],
				self::destination( $prefix . '_color', 'color' ) + [ 'optional' => true ],
			],
		];
	}

	/**
	 * Every CSS property backed by one Group_Control_Border, keyed for a target's `css_properties`.
	 * Readback goes through the longhands, which also carry responsive widths.
	 *
	 * @return array<string, array<string, array>>
	 */
	public static function border_group( string $prefix, string $state = 'default' ): array {
		return [
			'border' => [ $state => self::border( $prefix ) + [ 'readback' => false ] ],
			'border-style' => [ $state => self::choice( $prefix . '_border' ) ],
			'border-width' => [ $state => self::control( $prefix . '_width', 'sides', true ) ],
			'border-color' => [ $state => self::control( $prefix . '_color', 'color' ) ],
		];
	}

	/**
	 * A Group_Control_Box_Shadow: writes the shadow shape together with its popover toggle.
	 */
	public static function box_shadow( string $prefix ): array {
		return [
			'kind' => self::KIND_BOX_SHADOW,
			'prefix' => $prefix,
			'resolver' => self::BOX_SHADOW_RESOLVER,
			'responsive' => false,
			'destinations' => [
				self::destination( $prefix . '_box_shadow', self::BOX_SHADOW_RESOLVER ),
				self::destination( $prefix . '_box_shadow_type', self::BOX_SHADOW_TOGGLE_RESOLVER ),
			],
		];
	}

	/**
	 * @return array{setting: string, shape: string, resolver: string}
	 */
	private static function destination( string $key, string $resolver ): array {
		return [
			'setting' => $key,
			'shape' => self::RESOLVER_SHAPES[ $resolver ] ?? V3_Resolved_Patch_Validator::SHAPE_STRING,
			'resolver' => $resolver,
		];
	}
}
