<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Score_Tiers;
use PHPUnit\Framework\TestCase;

class Test_Score_Tiers extends TestCase {

	/**
	 * @dataProvider tier_boundaries_provider
	 */
	public function test_get_tier__maps_score_boundaries( $score, $expected_tier ) {
		// Act
		$tier = Score_Tiers::get_tier( $score );

		// Assert
		$this->assertSame( $expected_tier, $tier );
	}

	public function tier_boundaries_provider(): array {
		return [
			'zero' => [ 0, Score_Tiers::TIER_LOW ],
			'low upper bound' => [ 30, Score_Tiers::TIER_LOW ],
			'mid lower bound' => [ 31, Score_Tiers::TIER_MID ],
			'mid upper bound' => [ 80, Score_Tiers::TIER_MID ],
			'high lower bound' => [ 81, Score_Tiers::TIER_HIGH ],
			'perfect' => [ 100, Score_Tiers::TIER_HIGH ],
		];
	}

	public function test_to_array__exposes_thresholds_for_scanner_script() {
		// Act
		$thresholds = Score_Tiers::to_array();

		// Assert
		$this->assertSame( [
			'lowMax' => Score_Tiers::LOW_MAX,
			'highMin' => Score_Tiers::HIGH_MIN,
		], $thresholds );
	}
}
