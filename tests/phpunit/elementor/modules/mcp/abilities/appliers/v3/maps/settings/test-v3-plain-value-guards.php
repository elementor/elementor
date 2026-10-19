<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Css_Selector_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Date_Time_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Gallery_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Icons_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Multi_Enum_From_Control_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Number_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Repeater_Setting_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings\Switcher_Setting_Adapter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Plain_Value_Guards extends TestCase {

	/**
	 * @dataProvider provide_non_boolean_values
	 */
	public function test_switcher_adapter__rejects_anything_that_is_not_a_boolean( $value ) {
		// Arrange.
		$adapter = new Switcher_Setting_Adapter();

		// Act.
		$reason = $adapter->reject_reason( $value, [] );

		// Assert.
		$this->assertNotNull( $reason );
	}

	public function provide_non_boolean_values(): array {
		return [
			'string false' => [ 'false' ],
			'string no' => [ 'no' ],
			'string maybe' => [ 'maybe' ],
			'int' => [ 2 ],
			'list' => [ [ true ] ],
			'null' => [ null ],
		];
	}

	public function test_switcher_adapter__accepts_booleans() {
		// Arrange.
		$adapter = new Switcher_Setting_Adapter();

		// Act & Assert.
		$this->assertNull( $adapter->reject_reason( true, [] ) );
		$this->assertNull( $adapter->reject_reason( false, [] ) );
	}

	/**
	 * @dataProvider provide_unsupported_numbers
	 */
	public function test_number_adapter__rejects_non_numbers_and_values_beyond_the_exact_range( $value ) {
		// Arrange.
		$adapter = new Number_Setting_Adapter();

		// Act.
		$reason = $adapter->reject_reason( $value, [] );

		// Assert.
		$this->assertNotNull( $reason );
	}

	public function provide_unsupported_numbers(): array {
		return [
			'empty string' => [ '' ],
			'junk' => [ '12abc' ],
			'nan' => [ 'NaN' ],
			'php int max' => [ PHP_INT_MAX ],
			'huge float' => [ 1e30 ],
			'boolean' => [ true ],
		];
	}

	public function test_number_adapter__accepts_numbers_numeric_strings_and_dynamic_tags() {
		// Arrange.
		$adapter = new Number_Setting_Adapter();

		// Act & Assert.
		$this->assertNull( $adapter->reject_reason( -5, [] ) );
		$this->assertNull( $adapter->reject_reason( 1.5, [] ) );
		$this->assertNull( $adapter->reject_reason( '12.5', [] ) );
		$this->assertNull( $adapter->reject_reason( [ 'name' => 'post-id' ], [] ) );
	}

	public function test_number_adapter__never_casts_a_float_beyond_the_exact_range_to_an_int() {
		// Arrange.
		$adapter = new Number_Setting_Adapter();

		// Act.
		$stored = $adapter->to_control_value( [ 'value' => 1e19 ], [] );

		// Assert.
		$this->assertSame( 1e19, $stored );
	}

	/**
	 * @dataProvider provide_invalid_dates
	 */
	public function test_date_time_adapter__rejects_text_the_widget_cannot_parse( $value ) {
		// Arrange.
		$adapter = new Date_Time_Setting_Adapter();

		// Act.
		$reason = $adapter->reject_reason( $value, [] );

		// Assert.
		$this->assertNotNull( $reason );
	}

	public function provide_invalid_dates(): array {
		return [
			'text' => [ 'garbage' ],
			'impossible day' => [ '2027-02-30 10:00' ],
			'impossible month' => [ '2027-13-01' ],
			'null byte' => [ "a\0b" ],
			'markup' => [ '"><img src=x onerror=alert(1)>' ],
			'number' => [ 20270101 ],
		];
	}

	public function test_date_time_adapter__accepts_dates_empty_text_and_dynamic_tags() {
		// Arrange.
		$adapter = new Date_Time_Setting_Adapter();

		// Act & Assert.
		$this->assertNull( $adapter->reject_reason( '2027-01-10 12:00', [] ) );
		$this->assertNull( $adapter->reject_reason( '2027-01-10', [] ) );
		$this->assertNull( $adapter->reject_reason( '', [] ) );
		$this->assertNull( $adapter->reject_reason( [ 'name' => 'post-date' ], [] ) );
	}

	/**
	 * @dataProvider provide_invalid_selectors
	 */
	public function test_css_selector_adapter__rejects_selectors_that_would_throw_on_the_frontend( $value ) {
		// Arrange.
		$adapter = new Css_Selector_Setting_Adapter();

		// Act.
		$reason = $adapter->reject_reason( $value, [] );

		// Assert.
		$this->assertNotNull( $reason );
	}

	public function provide_invalid_selectors(): array {
		return [
			'markup' => [ '"><script>alert(1)</script>' ],
			'unbalanced bracket' => [ 'div[data-x="1"' ],
			'unbalanced paren' => [ 'li:not(.a' ],
			'trailing combinator' => [ '.a >' ],
			'too long' => [ str_repeat( 'a', 300 ) ],
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

	public function test_multi_enum_adapter__rejects_an_associative_array() {
		// Arrange.
		$adapter = new Multi_Enum_From_Control_Setting_Adapter();

		// Act & Assert.
		$this->assertNotNull( $adapter->reject_reason( [ 'a' => 'hide' ], [] ) );
		$this->assertNull( $adapter->reject_reason( [ 'hide', 'message' ], [] ) );
	}

	/**
	 * @dataProvider provide_invalid_gallery_items
	 */
	public function test_gallery_adapter__rejects_items_it_would_otherwise_drop_silently( $items ) {
		// Arrange.
		$adapter = new Gallery_Setting_Adapter();

		// Act.
		$reason = $adapter->reject_reason( $items, [] );

		// Assert.
		$this->assertNotNull( $reason );
	}

	public function provide_invalid_gallery_items(): array {
		return [
			'not a list' => [ [ 'id' => 1 ] ],
			'null item' => [ [ null ] ],
			'scalar item' => [ [ 131 ] ],
			'negative id' => [ [ [ 'id' => -1 ] ] ],
			'text id' => [ [ [ 'id' => 'abc' ] ] ],
			'unsupported key' => [ [ [ 'id' => 1, 'caption' => 'x' ] ] ],
			'missing attachment' => [ [ [ 'id' => 999999999 ] ] ],
		];
	}

	public function test_icons_adapter__rejects_values_that_are_not_class_names() {
		// Arrange.
		$adapter = new Icons_Setting_Adapter();

		// Act & Assert.
		$this->assertNotNull( $adapter->reject_reason( [ 'value' => '"><script>', 'library' => 'fa-brands' ], [] ) );
		$this->assertNotNull( $adapter->reject_reason( [ 'value' => 'fab fa-github', 'library' => 'x', 'extra' => 1 ], [] ) );
		$this->assertNull( $adapter->reject_reason( [ 'value' => 'fab fa-github', 'library' => 'fa-brands' ], [] ) );
	}

	public function test_repeater_adapter__reports_the_row_that_breaks_the_rules() {
		// Arrange.
		$adapter = new Repeater_Setting_Adapter();
		$control = [
			'type' => 'repeater',
			'fields' => [
				'_id' => [ 'type' => 'hidden' ],
				'social_icon' => [ 'type' => 'icons' ],
			],
		];

		// Act.
		$unknown_key = $adapter->reject_reason( [ [ 'bogus' => 1 ] ], $control );
		$bad_icon = $adapter->reject_reason( [ [ 'social_icon' => [ 'value' => '<b>', 'library' => 'fa-solid' ] ] ], $control );
		$valid = $adapter->reject_reason( [ [ 'social_icon' => [ 'value' => 'fas fa-phone', 'library' => 'fa-solid' ] ] ], $control );

		// Assert.
		$this->assertStringContainsString( 'row 0', $unknown_key );
		$this->assertStringContainsString( 'row 0', $bad_icon );
		$this->assertNull( $valid );
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
