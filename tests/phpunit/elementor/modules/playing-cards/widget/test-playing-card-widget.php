<?php

namespace Elementor\Modules\PlayingCards\Tests;

use Elementor\Modules\PlayingCards\Widgets\Playing_Cards;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_PlayingCards_Widget extends Elementor_Test_Base {

	public function test_register_controls() {
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

		$this->assertArrayHasKey( 'card_value', $controls['cards_list'] );
		$this->assertArrayHasKey( 'card_suit', $controls['cards_list'] );
		$this->assertArrayHasKey( 'show_back', $controls['cards_list'] );
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
