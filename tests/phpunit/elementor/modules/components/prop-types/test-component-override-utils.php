<?php

namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\Components\PropTypes\Component_Override_Utils;
use Elementor\Modules\Components\Documents\Component_Overridable_Props;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/component-prop-types-test-base.php';

class Test_Component_Override_Utils extends Component_Prop_Type_Test_Base {

	private Component_Overridable_Props $component_overridable_props;

	public function setUp(): void {
		parent::setUp();

		$this->component_overridable_props = Component_Overridable_Props::make( $this->mocks->get_mock_component_overridable_props() );
	}

	public function test_validate__passes_with_valid_override() {
		// Arrange
		$component_override_utils = new Component_Override_Utils($this->component_overridable_props);

		// Act
		$result = $component_override_utils->validate( [
			'override_key' => 'prop-uuid-1',
			'value' => [ '$$type' => 'html', 'value' => 'New Title' ],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_when_override_key_not_in_component_props() {
		// Arrange
		$component_override_utils = new Component_Override_Utils($this->component_overridable_props);

		// Act
		$result = $component_override_utils->validate( [
			'override_key' => 'non-existent-key',
			'value' => [ '$$type' => 'string', 'value' => 'Some Value' ],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function invalid_structure_data_provider() {
		return [
			'non-array value' => [ 'not-an-array' ],
			'missing override_key' => [ [ 'value' => [ '$$type' => 'html', 'value' => 'New Title' ] ] ],
			`missing value['value']` => [ [ 'value' => [ 'override_key' => 'prop-uuid-1' ] ] ],
			'non-string override_key' => [ [ 
				'value' => [ 
					'override_key' => 123, 
					'value' => [ '$$type' => 'html', 'value' => 'New Title' ] 
				], 
			] ],
			`non-array value['value']` => [ [ 
					'override_key' => 'prop-uuid-1',
					'value' => 'not-an-array' 
			] ],
		];
	}

	/**
	 * @dataProvider invalid_structure_data_provider
	 */
	public function test_validate__fail_for_invalid_structure( $value ) {
		// Arrange.
		$component_override_utils = new Component_Override_Utils($this->component_overridable_props);

		// Act.
		$result = $component_override_utils->validate( $value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_value_invalid_against_original_prop_type() {
		// Arrange
		$component_override_utils = new Component_Override_Utils($this->component_overridable_props);

		// Act
		$result = $component_override_utils->validate( [
			'override_key' => 'prop-uuid-1',
			// number is not a valid html value
			'value' => [ '$$type' => 'html', 'value' => 123 ],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_prop_value_not_matching_component_overridable_props() {
		// Arrange
		$component_override_utils = new Component_Override_Utils($this->component_overridable_props);

		// Act
		$result = $component_override_utils->validate( [
			'override_key' => 'prop-uuid-1',
			// prop-uuid-1 should be an html
			'value' => [ '$$type' => 'number', 'value' => 123 ],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_valid_override() {
		// Arrange
		$component_override_utils = new Component_Override_Utils($this->component_overridable_props);

		[
			'before_sanitization' => $before_sanitization,
			'expected_after_sanitization' => $expected_after_sanitization,
		] = $this->mocks->get_mock_image_image_component_override_to_sanitize();

		// Act
		$result = $component_override_utils->sanitize( $before_sanitization );

		// Assert
		$this->assertEquals( $expected_after_sanitization, $result );
	}

	public function test_sanitize__returns_null_when_override_key_not_in_component_props() {
		// Arrange
		$component_override_utils = new Component_Override_Utils($this->component_overridable_props);

		// Act
		$result = $component_override_utils->sanitize( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'non-existent-key',
				'value' => [ '$$type' => 'string', 'value' => 'Some Value' ],
			],
		] );

		// Assert
		$this->assertEquals( null, $result );
	}
}
