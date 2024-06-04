<?php

namespace Elementor\Tests\Phpunit\Includes\Widgets;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Widget_Heading extends Elementor_Test_Base {
	public function test_sanitize__data_attributes() {
		$html_to_sanitize = '
			<div data-foo="bar" data-settings="{&quot;submenu_icon&quot;:{&quot;value&quot;:&quot;&lt;img src=x onerror=alert()&gt;&quot;,&quot;library&quot;:&quot;&quot;},&quot;layout&quot;:&quot;horizontal&quot;,&quot;toggle&quot;:&quot;burger&quot;}">
				<h1>Heading</h1>
			</div>
		';
		$heading_widget = Plugin::instance()->widgets_manager->get_widget_types( 'heading' );

		// assert that string is not containing data attributes
		$this->assertStringNotContainsString( 'data-foo', $heading_widget->sanitize( $html_to_sanitize ) );
		$this->assertStringNotContainsString( 'data-settings', $heading_widget->sanitize( $html_to_sanitize ) );
		$this->assertStringNotContainsString( 'alert()', $heading_widget->sanitize( $html_to_sanitize ) );
	}

	public function test_sanitize__img() {
		$html_to_sanitize = '
			<div>
				<img src="x" onerror="alert()">
			</div>
		';
		$heading_widget = Plugin::instance()->widgets_manager->get_widget_types( 'heading' );

		// assert that string is not containing data attributes
		$this->assertStringNotContainsString( '<img src="x" onerror="alert()">', $heading_widget->sanitize( $html_to_sanitize ) );
	}
}
