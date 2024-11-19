<?php

namespace Elementor\Modules\PlayingCards\Tests;

use Elementor\Modules\PlayingCards\Widgets\Playing_Cards;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_PlayingCards_Widget extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
	}

	public function test_widget_registration() {
		$widget = new Playing_Cards();
		$this->assertInstanceOf(Playing_Cards::class, $widget);
	}

	public function test_widget_name() {
		$widget = new Playing_Cards();
		$this->assertEquals('playing-cards', $widget->get_name());
	}

	public function test_widget_title() {
		$widget = new Playing_Cards();
		$this->assertEquals('Playing Cards', $widget->get_title());
	}

	public function test_widget_icon() {
		$widget = new Playing_Cards();
		$this->assertEquals('eicon-shape', $widget->get_icon());
	}

	public function test_widget_style_depends() {
		$widget = new Playing_Cards();
		$this->assertContains('widget-playing-cards', $widget->get_style_depends());
	}

	public function test_register_controls() {
		$reflection = new \ReflectionClass( Playing_Cards::class );
		$method = $reflection->getMethod( 'register_controls' );
		$method->setAccessible( true );
		$widget = new Playing_Cards();
		$method->invokeArgs( $widget, [] );

		$controls = $widget->get_controls();
		$this->assertNotEmpty($controls);
	}

	public function test_render() {
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
		ob_start();
		$method->invokeArgs( $widget, [] );
		$output = ob_get_clean();
		$this->assertStringContainsString('e-playing-cards', $output);
		$this->assertStringContainsString('A', $output);
		$this->assertStringContainsString('❤️', $output);
	}
}
