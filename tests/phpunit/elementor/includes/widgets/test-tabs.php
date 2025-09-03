<?php

namespace Elementor\Tests\Phpunit\Includes\Widgets;

use Elementor\Plugin;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Tabs extends Elementor_Test_Base
{
	public function test_widget_display_in_panel__depends_on_nested_elements_experiment() {
		$manager = Plugin::instance()->experiments;
		$is_active_nested_elements = isset( $manager->get_active_features()['nested-elements'] );
		$manager->set_feature_default_state( 'nested-elements',Experiments_Manager::STATE_ACTIVE );
		$tabs= Plugin::instance()->widgets_manager->get_widget_types( 'tabs' );
		$this->assertFalse( $tabs->show_in_panel() );
		$manager->set_feature_default_state( 'nested-elements',Experiments_Manager::STATE_INACTIVE );
		$this->assertTrue( $tabs->show_in_panel() );
		// return to previous state
		Plugin::instance()->experiments->set_feature_default_state( 'nested-elements',
			$is_active_nested_elements ? Experiments_Manager::STATE_ACTIVE :  Experiments_Manager::STATE_INACTIVE );

	}
}
