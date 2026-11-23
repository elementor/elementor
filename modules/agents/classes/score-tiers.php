<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Score_Tiers {

	const TIER_LOW = 'low';
	const TIER_MID = 'mid';
	const TIER_HIGH = 'high';

	const SCORE_MAX = 100;
	const LOW_MAX = 30;
	const HIGH_MIN = 81;

	public static function get_tier( int $score ): string {
		if ( $score <= self::LOW_MAX ) {
			return self::TIER_LOW;
		}

		if ( $score < self::HIGH_MIN ) {
			return self::TIER_MID;
		}

		return self::TIER_HIGH;
	}

	public static function to_array(): array {
		return [
			'lowMax' => self::LOW_MAX,
			'highMin' => self::HIGH_MIN,
		];
	}
}
