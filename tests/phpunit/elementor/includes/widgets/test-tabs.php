<?php

namespace Elementor\Tests\Phpunit\Includes\Widgets;

use Elementor\Plugin;
use Elementor\Widget_Tabs;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Tabs extends Elementor_Test_Base
{

	public static function setUpBeforeClass() {
		require_once __DIR__ .  './../../../../../Includes/Widgets/tabs.php';
		parent::setUpBeforeClass();
	}

	public function test_widget_display_in_panel__depends_on_nested_elements_experiment() {
		$tabs = new Widget_Tabs();
		$this->assertFalse( $tabs->show_in_panel() );
		Plugin::instance()->experiments->set_feature_default_state( 'nested-elements', false );
		$this->assertTrue( $tabs->show_in_panel() );
	}
}
