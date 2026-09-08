<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Control_Target {

	const KIND_SIMPLE = 'simple';

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
					'shape' => 'string',
					'resolver' => $resolver,
				],
			],
		];
	}
}
