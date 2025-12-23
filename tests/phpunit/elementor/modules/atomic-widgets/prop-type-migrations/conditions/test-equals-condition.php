<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions\Equals_Condition;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Equals_Condition extends Elementor_Test_Base {

	/**
	 * @dataProvider evaluate_data_provider
	 */
	public function test_evaluate( $value, array $config, bool $expected ) {
		// Arrange.
		$condition = new Equals_Condition();

		// Act.
		$result = $condition->evaluate( $value, $config );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function evaluate_data_provider(): array {
		return [
			'string equals' => [
				'value' => 'link',
				'config' => [ 'value' => 'link' ],
				'expected' => true,
			],
			'string not equals' => [
				'value' => 'string',
				'config' => [ 'value' => 'link' ],
				'expected' => false,
			],
			'number equals' => [
				'value' => 123,
				'config' => [ 'value' => 123 ],
				'expected' => true,
			],
			'strict type comparison' => [
				'value' => '123',
				'config' => [ 'value' => 123 ],
				'expected' => false,
			],
			'null equals null' => [
				'value' => null,
				'config' => [ 'value' => null ],
				'expected' => true,
			],
			'boolean equals' => [
				'value' => true,
				'config' => [ 'value' => true ],
				'expected' => true,
			],
		];
	}

	public function test_get_name() {
		$this->assertSame( 'equals', Equals_Condition::get_name() );
	}
}
