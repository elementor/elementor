<?php

use Elementor\Modules\DataFlow\Actions_Converter;
use Elementor\Modules\DataFlow\Actions_Parser;
use Elementor\Modules\DataFlow\Actions_Registry;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_Actions_Converter extends Elementor_Test_Base {

	const TILT = [
		'input' => 'pointer',
		'space' => 'local',
		'reducedMotion' => 'run',
		'write' => [
			'tilt_x' => [
				'from' => 'y',
				'map' => [ -1, 1, 12, -12 ],
				'round' => 2,
				'spring' => [ 'damping' => 18 ],
			],
		],
	];

	public function setUp(): void {
		parent::setUp();

		Actions_Registry::reset();
	}

	public function test_from_plain__round_trips_event_and_input_actions() {
		// Arrange
		$plain = [
			[
				'on' => 'state',
				'key' => 'tab',
				'do' => 'class/toggle',
				'args' => [ 'class_name' => 'is-active', 'equals' => 'one' ],
			],
			[
				'on' => 'click',
				'do' => 'state/increment',
				'args' => [ 'key' => 'count', 'by' => 2, 'wrap' => true ],
			],
			self::TILT,
		];

		// Act
		$converted = Actions_Converter::make()->from_plain( $plain );

		// Assert
		$this->assertSame( [], $converted['errors'] );
		$this->assertSame(
			wp_json_encode( $plain ),
			wp_json_encode( Actions_Converter::to_plain( $converted['items'] ) )
		);
	}

	/**
	 * @dataProvider invalid_actions
	 */
	public function test_from_plain__drops_invalid_actions_with_an_error( array $plain ) {
		// Act
		$converted = Actions_Converter::make()->from_plain( [ $plain ] );

		// Assert
		$this->assertSame( [], $converted['items'] );
		$this->assertCount( 1, $converted['errors'] );
	}

	public function invalid_actions(): array {
		return [
			'unknown action' => [ [ 'on' => 'click', 'do' => 'acme/missing' ] ],
			'unknown event' => [ [ 'on' => 'scroll', 'do' => 'state/toggle', 'args' => [ 'key' => 'open' ] ] ],
			'state event without key' => [ [ 'on' => 'state', 'do' => 'element/visible' ] ],
			'unknown argument' => [ [ 'on' => 'click', 'do' => 'state/toggle', 'args' => [ 'key' => 'open', 'extra' => 1 ] ] ],
			'missing required argument' => [ [ 'on' => 'click', 'do' => 'state/toggle' ] ],
			'invalid key' => [ [ 'on' => 'click', 'do' => 'state/toggle', 'args' => [ 'key' => '1 bad' ] ] ],
			'attribute outside data and aria' => [ [ 'on' => 'click', 'do' => 'attribute/set', 'args' => [ 'name' => 'onclick', 'value' => 'x' ] ] ],
			'selector with markup' => [ [ 'on' => 'click', 'do' => 'element/visible', 'args' => [ 'selector' => '<img>' ] ] ],
			'unknown input' => [ [ 'input' => 'gyro', 'write' => [ 'x' => [ 'from' => 'x' ] ] ] ],
			'input value from another input' => [ [ 'input' => 'time', 'write' => [ 'x' => [ 'from' => 'progress' ] ] ] ],
			'input without writes' => [ [ 'input' => 'scroll', 'write' => [] ] ],
		];
	}

	public function test_parse__keeps_valid_items_up_to_the_limit() {
		// Arrange
		$valid = Actions_Converter::make()->from_plain( [ [ 'on' => 'click', 'do' => 'state/toggle', 'args' => [ 'key' => 'open' ] ] ] )['items'][0];
		$items = array_merge( [ [ '$$type' => 'event-action', 'value' => [] ] ], array_fill( 0, Actions_Parser::MAX_ITEMS + 5, $valid ) );

		// Act
		$parsed = Actions_Parser::parse( wp_json_encode( [ 'items' => $items ] ) );

		// Assert
		$this->assertSame( Actions_Parser::VERSION, $parsed['version'] );
		$this->assertCount( Actions_Parser::MAX_ITEMS, $parsed['items'] );
		$this->assertSame( [ 'state/toggle' ], Actions_Parser::get_action_names( Actions_Parser::to_runtime( $parsed ) ) );
	}
}
