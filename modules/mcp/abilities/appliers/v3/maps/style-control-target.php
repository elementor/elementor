<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Resolved_Patch_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Control_Target {

	const KIND_SIMPLE = 'simple';
	const KIND_TYPOGRAPHY = 'typography';

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
	 * `css_properties`, all in the given state.
	 *
	 * @return array<string, array<string, array>>
	 */
	public static function typography_group( string $prefix, string $state = 'default' ): array {
		$properties = [];

		foreach ( self::TYPOGRAPHY_FIELDS as $property => $field ) {
			$properties[ $property ] = [
				$state => self::typography( $prefix, $field['field'], $field['resolver'], $field['responsive'] ),
			];
		}

		return $properties;
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
