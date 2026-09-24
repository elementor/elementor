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
