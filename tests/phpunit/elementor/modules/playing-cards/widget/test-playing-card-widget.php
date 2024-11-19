<?php

namespace Elementor\Modules\PlayingCards\Tests;

use Elementor\Modules\PlayingCards\Widgets\PlayingCardsWidget;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_PlayingCards_Widget extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
	}

	public function test_widget_registration() {
		$widget = new PlayingCardsWidget();
		$this->assertInstanceOf(PlayingCardsWidget::class, $widget);
	}

	public function test_widget_name() {
		$widget = new PlayingCardsWidget();
		$this->assertEquals('playing-cards', $widget->get_name());
	}

	public function test_widget_title() {
		$widget = new PlayingCardsWidget();
		$this->assertEquals('Playing Cards', $widget->get_title());
	}

	public function test_widget_icon() {
		$widget = new PlayingCardsWidget();
		$this->assertEquals('eicon-shape', $widget->get_icon());
	}

	public function test_widget_style_depends() {
		$widget = new PlayingCardsWidget();
		$this->assertContains('widget-playing-cards', $widget->get_style_depends());
	}

	public function test_register_controls() {
		$widget = new PlayingCardsWidget();
		$widget->register_controls();
		$controls = $widget->get_controls();
		$this->assertNotEmpty($controls);
	}

	public function test_render() {
		$widget = new PlayingCardsWidget();
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
		$widget->render();
		$output = ob_get_clean();
		$this->assertStringContainsString('e-playing-cards', $output);
		$this->assertStringContainsString('A', $output);
		$this->assertStringContainsString('❤️', $output);
	}
}
