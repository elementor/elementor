<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Exists_Condition;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Exists_Condition extends Elementor_Test_Base {

	/**
	 * @dataProvider evaluate_data_provider
	 */
	public function test_evaluate( $value, bool $expected ) {
		// Arrange.
		$condition = new Exists_Condition();

		// Act.
		$result = $condition->evaluate( $value, [] );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function evaluate_data_provider(): array {
		return [
			'string exists' => [
				'value' => 'value',
				'expected' => true,
			],
			'number exists' => [
				'value' => 123,
				'expected' => true,
			],
			'empty string exists' => [
				'value' => '',
				'expected' => true,
			],
			'zero exists' => [
				'value' => 0,
				'expected' => true,
			],
			'false exists' => [
				'value' => false,
				'expected' => true,
			],
			'array exists' => [
				'value' => [],
				'expected' => true,
			],
			'null does not exist' => [
				'value' => null,
				'expected' => false,
			],
		];
	}

	public function test_get_name() {
		$this->assertSame( 'exists', Exists_Condition::get_name() );
	}
}
