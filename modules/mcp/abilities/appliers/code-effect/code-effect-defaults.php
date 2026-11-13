<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\CodeEffect;

use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\Interactions\Presets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Code effects ignore type and timing, but every stored interaction item must carry them.
 */
class Code_Effect_Defaults {
	const TYPE = 'in';

	public static function fill( array $plain_item ): array {
		$animation = $plain_item['animation'] ?? null;

		if ( ! is_array( $animation ) || Presets::CODE_EFFECT !== ( $animation['effect'] ?? null ) ) {
			return $plain_item;
		}

		$plain_item['trigger'] = $plain_item['trigger'] ?? Presets::CODE_EFFECT_TRIGGER;
		$plain_item['animation'] = $animation + [
			'type' => self::TYPE,
			'timing_config' => [
				'duration' => self::time_size( Presets::DEFAULT_DURATION ),
				'delay' => self::time_size( Presets::DEFAULT_DELAY ),
			],
		];

		return $plain_item;
	}

	private static function time_size( int $milliseconds ): array {
		return [
			'size' => $milliseconds,
			'unit' => Size_Constants::UNIT_MILLI_SECOND,
		];
	}
}
