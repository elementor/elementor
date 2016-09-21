<?php

class Elementor_Test_Widgets extends WP_UnitTestCase {

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Widgets_Manager', Elementor\Plugin::instance()->widgets_manager );
	}

	public function test_getWidgets() {
		$this->assertNotEmpty( Elementor\Plugin::instance()->widgets_manager->get_widget_types() );
	}

	public function test_elementMethods() {
		foreach ( Elementor\Plugin::instance()->widgets_manager->get_widget_types() as $widget_type ) {
			$name = $widget_type->get_name();

			if ( 'common' === $name ) {
				continue;
			}

			$this->assertNotEmpty( $widget_type->get_title() );
			$this->assertNotEmpty( $widget_type->get_type() );
			$this->assertNotEmpty( $name );
		}
	}

	public function test_registerNUnregisterWidget() {
		$widget_class = '\Elementor\Widget_Text_editor';
		$widget_id = 'text-editor';

		$this->assertTrue( Elementor\Plugin::instance()->widgets_manager->register_widget_type( new $widget_class( [ 'id' => $widget_id ] ) ) );

		$widget = Elementor\Plugin::instance()->widgets_manager->get_widget_types( $widget_id );
		$this->assertInstanceOf( $widget_class, $widget );

		$this->assertTrue( Elementor\Plugin::instance()->widgets_manager->unregister_widget_type( $widget_id ) );
		$this->assertFalse( Elementor\Plugin::instance()->widgets_manager->unregister_widget_type( $widget_id ) );

		$this->assertNull( Elementor\Plugin::instance()->widgets_manager->get_widget_types( $widget_id ) );
	}

	public function test_controlsSelectorsData() {
		$wrapper_text = '{{WRAPPER}}';

		foreach ( Elementor\Plugin::instance()->widgets_manager->get_widget_types() as $widget ) {
			foreach ( $widget->get_style_controls() as $control ) {
				foreach ( $control['selectors'] as $selector => $css_property ) {
					foreach ( explode( ',', $selector ) as $item ) {
						$this->assertTrue( false !== strpos( $item, $wrapper_text ) );
					}
				}
			}
		}
	}

	public function test_controlsDefaultData() {
		foreach ( Elementor\Plugin::instance()->widgets_manager->get_widget_types() as $widget ) {
			foreach ( $widget->get_controls() as $control ) {
				if ( \Elementor\Controls_Manager::SELECT !== $control['type'] )
					continue;
				
				$error_msg = sprintf( 'Widget: %s, Control: %s', $widget->get_name(), $control['name'] );
				
				if ( empty( $control['default'] ) )
					$this->assertTrue( isset( $control['options'][''] ), $error_msg );
				else
					$this->assertArrayHasKey( $control['default'], $control['options'], $error_msg );
			}
		}
	}
}
