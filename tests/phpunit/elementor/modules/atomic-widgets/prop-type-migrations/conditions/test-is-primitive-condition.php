<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Is_Primitive_Condition;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Is_Primitive_Condition extends Elementor_Test_Base {

	/**
	 * @dataProvider evaluate_data_provider
	 */
	public function test_evaluate( $value, bool $expected ) {
		// Arrange.
		$condition = new Is_Primitive_Condition();

		// Act.
		$result = $condition->evaluate( $value, [] );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function evaluate_data_provider(): array {
		return [
			'string is primitive' => [
				'value' => 'text',
				'expected' => true,
			],
			'number is primitive' => [
				'value' => 123,
				'expected' => true,
			],
			'float is primitive' => [
				'value' => 12.5,
				'expected' => true,
			],
			'boolean is primitive' => [
				'value' => true,
				'expected' => true,
			],
			'null is primitive' => [
				'value' => null,
				'expected' => true,
			],
			'array is not primitive' => [
				'value' => [],
				'expected' => false,
			],
			'object array is not primitive' => [
				'value' => [ 'key' => 'value' ],
				'expected' => false,
			],
		];
	}

	public function test_get_name() {
		$this->assertSame( 'is_primitive', Is_Primitive_Condition::get_name() );
	}
}
