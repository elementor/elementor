<?php

namespace Elementor\Modules\PlayingCards\Tests;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\PlayingCards\Widgets\PlayingCardsWidget;

class Test_PlayingCards_Module extends Elementor_Test_Base {
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
}
