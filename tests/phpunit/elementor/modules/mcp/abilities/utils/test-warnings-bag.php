<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;
use PHPUnit\Framework\TestCase;

class Test_Warnings_Bag extends TestCase {

	public function test_make__starts_empty() {
		// Act.
		$bag = Warnings_Bag::make();

		// Assert.
		$this->assertTrue( $bag->is_empty() );
		$this->assertSame( [], $bag->all() );
		$this->assertSame( [], $bag->messages() );
		$this->assertSame( [], $bag->codes() );
	}

	public function test_add__stores_one_entry_with_all_data() {
		// Arrange.
		$bag = Warnings_Bag::make();

		// Act.
		$bag->add( 'prop_value_invalid', 'Property "tag" is invalid.', 'hero-title' );

		// Assert.
		$this->assertFalse( $bag->is_empty() );
		$this->assertSame(
			[
				[
					'code' => 'prop_value_invalid',
					'config_id' => 'hero-title',
					'message' => '[hero-title] Property "tag" is invalid.',
				],
			],
			$bag->all()
		);
	}

	public function test_add__without_config_id_keeps_plain_message() {
		// Arrange.
		$bag = Warnings_Bag::make();

		// Act.
		$bag->add( 'root_auto_wrapped', 'Content was wrapped in a flexbox.' );

		// Assert.
		$this->assertSame(
			[
				[
					'code' => 'root_auto_wrapped',
					'config_id' => null,
					'message' => 'Content was wrapped in a flexbox.',
				],
			],
			$bag->all()
		);
	}

	public function test_messages__returns_formatted_messages_in_order() {
		// Arrange.
		$bag = Warnings_Bag::make()
			->add( 'css_parse_failed', 'Bad CSS.', 'card' )
			->add( 'root_auto_wrapped', 'Wrapped.' );

		// Act.
		$messages = $bag->messages();

		// Assert.
		$this->assertSame( [ '[card] Bad CSS.', 'Wrapped.' ], $messages );
	}

	public function test_codes__returns_unique_codes() {
		// Arrange.
		$bag = Warnings_Bag::make()
			->add( 'prop_value_invalid', 'First.', 'a' )
			->add( 'unknown_global_class', 'Second.', 'b' )
			->add( 'prop_value_invalid', 'Third.', 'c' );

		// Act.
		$codes = $bag->codes();

		// Assert.
		$this->assertSame( [ 'prop_value_invalid', 'unknown_global_class' ], $codes );
	}

	public function test_add_to_response__adds_messages_and_details_when_not_empty() {
		// Arrange.
		$bag = Warnings_Bag::make()->add( 'css_parse_failed', 'Bad CSS.', 'card' );

		// Act.
		$response = $bag->add_to_response( [ 'success' => true ] );

		// Assert.
		$this->assertSame(
			[
				'success' => true,
				'warnings' => [ '[card] Bad CSS.' ],
				'warning_details' => [
					[
						'code' => 'css_parse_failed',
						'config_id' => 'card',
						'message' => '[card] Bad CSS.',
					],
				],
			],
			$response
		);
	}

	public function test_add_to_response__leaves_response_unchanged_when_empty() {
		// Arrange.
		$bag = Warnings_Bag::make();

		// Act.
		$response = $bag->add_to_response( [ 'success' => true ] );

		// Assert.
		$this->assertSame( [ 'success' => true ], $response );
	}

	public function test_merge__appends_entries_from_other_bag_in_order() {
		// Arrange.
		$bag = Warnings_Bag::make()->add( 'css_parse_failed', 'First.', 'a' );
		$other = Warnings_Bag::make()->add( 'interaction_invalid', 'Second.', 'b' );

		// Act.
		$result = $bag->merge( $other );

		// Assert.
		$this->assertSame( $bag, $result );
		$this->assertSame( [ '[a] First.', '[b] Second.' ], $bag->messages() );
		$this->assertSame( [ '[b] Second.' ], $other->messages() );
	}
}
