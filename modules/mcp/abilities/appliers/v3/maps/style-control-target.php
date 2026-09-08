<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Control_Target {

	const KIND_SIMPLE = 'simple';
	const KIND_TYPOGRAPHY = 'typography';
	const KIND_BORDER = 'border';
	const KIND_BOX_SHADOW = 'box-shadow';
	const KIND_SPACING = 'spacing';

	const KINDS = [
		self::KIND_SIMPLE,
		self::KIND_TYPOGRAPHY,
		self::KIND_BORDER,
		self::KIND_BOX_SHADOW,
		self::KIND_SPACING,
	];

	const TYPOGRAPHY_TEXT_PROPERTIES = [
		'font-family' => 'font_family',
		'font-weight' => 'font_weight',
		'font-style' => 'font_style',
		'text-transform' => 'text_transform',
		'text-decoration' => 'text_decoration',
	];

	const TYPOGRAPHY_DIMENSION_PROPERTIES = [
		'font-size' => 'font_size',
		'line-height' => 'line_height',
		'letter-spacing' => 'letter_spacing',
		'word-spacing' => 'word_spacing',
	];

	/**
	 * @return array{kind: string, resolver: string, responsive: bool, destinations: array<int, array{setting: string, shape: string, resolver: string}>}
	 */
	public static function control( string $setting, string $resolver, bool $responsive = false ): array {
		return [
			'kind' => self::KIND_SIMPLE,
			'resolver' => $resolver,
			'responsive' => $responsive,
			'destinations' => [
				[
					'setting' => $setting,
					'shape' => self::shape_for_resolver( $resolver ),
					'resolver' => $resolver,
				],
			],
		];
	}

	/**
	 * @return array{kind: string, resolver: string, responsive: bool, destinations: array<int, array{setting: string, shape: string, resolver: string}>}
	 */
	public static function typography( string $prefix, bool $responsive = true ): array {
		$destinations = [
			[
				'setting' => $prefix . '_typography',
				'shape' => 'string',
				'resolver' => 'text',
			],
		];

		foreach ( self::TYPOGRAPHY_TEXT_PROPERTIES as $suffix ) {
			$destinations[] = [
				'setting' => $prefix . '_' . $suffix,
				'shape' => 'string',
				'resolver' => 'text',
			];
		}

		foreach ( self::TYPOGRAPHY_DIMENSION_PROPERTIES as $suffix ) {
			$destinations[] = [
				'setting' => $prefix . '_' . $suffix,
				'shape' => 'dimension',
				'resolver' => 'dimension',
			];
		}

		return [
			'kind' => self::KIND_TYPOGRAPHY,
			'resolver' => 'typography',
			'responsive' => $responsive,
			'destinations' => $destinations,
		];
	}

	/**
	 * @return array{kind: string, resolver: string, responsive: bool, destinations: array<int, array{setting: string, shape: string, resolver: string}>}
	 */
	public static function border( string $prefix, bool $responsive = true ): array {
		return [
			'kind' => self::KIND_BORDER,
			'resolver' => 'border',
			'responsive' => $responsive,
			'destinations' => [
				[
					'setting' => $prefix . '_border',
					'shape' => 'string',
					'resolver' => 'text',
				],
				[
					'setting' => $prefix . '_width',
					'shape' => 'sides',
					'resolver' => 'sides',
				],
				[
					'setting' => $prefix . '_color',
					'shape' => 'string',
					'resolver' => 'color',
				],
			],
		];
	}

	/**
	 * @return array{kind: string, resolver: string, responsive: bool, destinations: array<int, array{setting: string, shape: string, resolver: string}>}
	 */
	public static function box_shadow( string $prefix, bool $responsive = false ): array {
		return [
			'kind' => self::KIND_BOX_SHADOW,
			'resolver' => 'box_shadow',
			'responsive' => $responsive,
			'destinations' => [
				[
					'setting' => $prefix . '_box_shadow_type',
					'shape' => 'string',
					'resolver' => 'text',
				],
				[
					'setting' => $prefix . '_box_shadow',
					'shape' => 'box_shadow',
					'resolver' => 'box_shadow',
				],
			],
		];
	}

	/**
	 * @return array{kind: string, resolver: string, responsive: bool, destinations: array<int, array{setting: string, shape: string, resolver: string}>}
	 */
	public static function spacing( string $setting, bool $responsive = true ): array {
		return [
			'kind' => self::KIND_SPACING,
			'resolver' => 'sides',
			'responsive' => $responsive,
			'destinations' => [
				[
					'setting' => $setting,
					'shape' => 'sides',
					'resolver' => 'sides',
				],
			],
		];
	}

	public static function shape_for_resolver( string $resolver ): string {
		switch ( $resolver ) {
			case 'dimension':
			case 'slider':
				return 'dimension';
			case 'sides':
			case 'dimension_side':
				return 'sides';
			case 'box_shadow':
				return 'box_shadow';
			case 'border':
				return 'border';
			default:
				return 'string';
		}
	}
}
