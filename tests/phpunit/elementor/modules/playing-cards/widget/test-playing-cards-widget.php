<?php

namespace Elementor\Testing\Modules\PlayingCards\Widget;

use Elementor\Modules\PlayingCards\Widgets\Playing_Cards;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Playing_Cards_Widget extends Elementor_Test_Base {

	public function test_playing_cards_render() {
		// Arrange
		$reflection = new \ReflectionClass( Playing_Cards::class );
		$method = $reflection->getMethod( 'render' );
		$method->setAccessible( true );
		$widget = new Playing_Cards([
			'id' => 1,
			'settings' => [
			'cards_list' => [
				'fields' => [
					'card_value' => 'A',
					'card_suit' => '❤️',
					'show_back' => 'no',
				],
			],
		]], []);

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
