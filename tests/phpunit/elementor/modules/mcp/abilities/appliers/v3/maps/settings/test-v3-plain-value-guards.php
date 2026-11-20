<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Css_Selector_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Date_Time_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Gallery_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Number_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Repeater_Setting_Adapter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Plain_Value_Guards extends TestCase {

	public function test_number_adapter__never_casts_a_float_beyond_the_exact_range_to_an_int() {
		// Arrange.
		$adapter = new Number_Setting_Adapter();

		// Act.
		$stored = $adapter->to_control_value( [ 'value' => 1e19 ], [] );

		// Assert.
		$this->assertSame( 1e19, $stored );
	}

	/**
	 * @dataProvider provide_impossible_dates
	 */
	public function test_date_time_adapter__rejects_dates_that_match_the_format_but_do_not_exist( string $value ) {
		// Arrange.
		$adapter = new Date_Time_Setting_Adapter();

		// Act.
		$reason = $adapter->reject_reason( $value, [] );

		// Assert.
		$this->assertNotNull( $reason );
	}

	public function provide_impossible_dates(): array {
		return [
			'impossible day' => [ '2027-02-30 10:00' ],
			'impossible month' => [ '2027-13-01' ],
			'impossible hour' => [ '2027-01-10 25:00' ],
		];
	}

	public function test_date_time_adapter__accepts_real_dates_and_empty_text() {
		// Arrange.
		$adapter = new Date_Time_Setting_Adapter();

		// Act & Assert.
		$this->assertNull( $adapter->reject_reason( '2027-01-10 12:00', [] ) );
		$this->assertNull( $adapter->reject_reason( '2027-01-10', [] ) );
		$this->assertNull( $adapter->reject_reason( '', [] ) );
	}

	/**
	 * @dataProvider provide_malformed_selectors
	 */
	public function test_css_selector_adapter__rejects_selectors_with_unbalanced_or_dangling_parts( string $value ) {
		// Arrange.
		$adapter = new Css_Selector_Setting_Adapter();

		// Act.
		$reason = $adapter->reject_reason( $value, [] );

		// Assert.
		$this->assertNotNull( $reason );
	}

	public function provide_malformed_selectors(): array {
		return [
			'unbalanced bracket' => [ 'div[data-x="1"' ],
			'unbalanced paren' => [ 'li:not(.a' ],
			'trailing combinator' => [ '.a >' ],
			'leading combinator' => [ '> .a' ],
		];
	}

	public function test_css_selector_adapter__accepts_real_selectors() {
		// Arrange.
		$adapter = new Css_Selector_Setting_Adapter();

		// Act & Assert.
		$this->assertNull( $adapter->reject_reason( '#content .post-body > p:first-child', [] ) );
		$this->assertNull( $adapter->reject_reason( 'article[data-id="7"]', [] ) );
		$this->assertNull( $adapter->reject_reason( '', [] ) );
	}

	public function test_gallery_adapter__rejects_an_attachment_that_does_not_exist() {
		// Arrange.
		$adapter = new Gallery_Setting_Adapter();

		// Act.
		$reason = $adapter->reject_reason( [ [ 'id' => 999999999 ] ], [] );

		// Assert.
		$this->assertStringContainsString( '999999999', $reason );
	}

	public function test_repeater_adapter__reports_the_row_whose_field_breaks_an_exception() {
		// Arrange.
		$adapter = new Repeater_Setting_Adapter();
		$control = [
			'type' => 'repeater',
			'fields' => [
				'_id' => [ 'type' => 'hidden' ],
				'images' => [ 'type' => 'gallery' ],
			],
		];

		// Act.
		$reason = $adapter->reject_reason( [ [ 'images' => [ [ 'id' => 999999999 ] ] ] ], $control );

		// Assert.
		$this->assertStringContainsString( 'row 0', $reason );
	}

	public function test_repeater_adapter__keeps_row_ids_when_the_same_rows_are_written_again() {
		// Arrange.
		$adapter = new Repeater_Setting_Adapter();
		$control = [
			'type' => 'repeater',
			'fields' => [
				'_id' => [ 'type' => 'hidden' ],
				'social_icon' => [ 'type' => 'icons' ],
			],
		];
		$prop_type = $adapter->prop_type( $control );
		$prop_value = $prop_type::generate( [
			[ 'social_icon' => [ '$$type' => 'v3-icons', 'value' => [ 'value' => [ '$$type' => 'string', 'value' => 'fas fa-phone' ], 'library' => [ '$$type' => 'string', 'value' => 'fa-solid' ] ] ] ],
		] );

		// Act.
		$first = $adapter->to_control_value( $prop_value, $control );
		$second = $adapter->to_control_value( $prop_value, $control );

		// Assert.
		$this->assertSame( $first[0]['_id'], $second[0]['_id'] );
	}
}
