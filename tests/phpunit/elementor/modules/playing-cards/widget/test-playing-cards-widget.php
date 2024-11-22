<?php

namespace Elementor\Testing\Modules\PlayingCards\Widget;

use Elementor\Modules\PlayingCards\Widgets\Playing_Cards;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Playing_Cards_Widget extends Elementor_Test_Base {

	public function test_playing_cards_register_controls() {
		// Arrange
		$reflection = new \ReflectionClass( Playing_Cards::class );
		$method = $reflection->getMethod( 'register_controls' );
		$method->setAccessible( true );
		$widget = new Playing_Cards();

		// Act
		$method->invokeArgs( $widget, [] );
		$controls = $widget->get_controls();

		// Assert
		$this->assertNotEmpty($controls);
		$this->assertArrayHasKey( 'cards_list', $controls );
		$this->assertArrayHasKey( 'card_back_background_url', $controls );
		$this->assertArrayHasKey( 'card_border_radius', $controls );
		$this->assertArrayHasKey( 'card_size', $controls );
		$this->assertArrayHasKey( 'playing_cards_item_space_between', $controls );
		$this->assertArrayHasKey( 'card_value', $controls['cards_list']['fields'] );
		$this->assertEquals( [
			'A' => 'A',
			'2' => '2',
			'3' => '3',
			'4' => '4',
			'5' => '5',
			'6' => '6',
			'7' => '7',
			'8' => '8',
			'9' => '9',
			'10' => '10',
			'J' => 'J',
			'Q' => 'Q',
			'K' => 'K',
		], $controls['cards_list']['fields']['card_value']['options'] );

		$this->assertEquals( [
			'♠️' => 'Spades',
			'♣️' => 'Club',
			'♦️' => 'Diamonds',
			'❤️' => 'Hearts',
		], $controls['cards_list']['fields']['card_suit']['options'] );

		$this->assertEquals( 'Back', $controls['cards_list']['fields']['show_back']['label_on'] );
		$this->assertEquals( 'Suit', $controls['cards_list']['fields']['show_back']['label_off'] );
	}

	public function test_render() {
		// Arrange
		$reflection = new \ReflectionClass( Playing_Cards::class );
		$method = $reflection->getMethod( 'render' );
		$method->setAccessible( true );

		$widget = new Playing_Cards();
		$widget->set_settings([
			'cards_list' => [
				[
					'card_value' => 'A',
					'card_suit' => '❤️',
					'show_back' => 'no',
				],
			],
		]);

		// Act
		ob_start();
		$method->invokeArgs( $widget, [] );
		$output = ob_get_clean();

		// Assert
		$this->assertStringContainsString( 'e-playing-cards', $output );
		$this->assertStringContainsString( 'A', $output );
		$this->assertStringContainsString( '❤️', $output );
	}
}
