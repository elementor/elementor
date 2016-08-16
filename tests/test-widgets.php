<?php

class Elementor_Test_Widgets extends WP_UnitTestCase {

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Widgets_Manager', Elementor\Plugin::instance()->widgets_manager );
	}

	public function test_getWidgets() {
		$this->assertNotEmpty( Elementor\Plugin::instance()->widgets_manager->get_registered_widgets() );
	}

	public function test_elementMethods() {
		foreach ( Elementor\Plugin::instance()->widgets_manager->get_registered_widgets() as $widget ) {
			$this->assertNotEmpty( $widget->get_title() );
			$this->assertNotEmpty( $widget->get_type() );
			$this->assertNotEmpty( $widget->get_id() );
		}
	}

	public function test_registerNUnregisterWidget() {
		$return = Elementor\Plugin::instance()->widgets_manager->register_widget( '\Elementor\Widget_Not_Found' );
		$this->assertInstanceOf( '\WP_Error', $return );
		$this->assertEquals( 'widget_class_name_not_exists', $return->get_error_code() );

		$return = Elementor\Plugin::instance()->widgets_manager->register_widget( '\Elementor\Control_Text' );
		$this->assertInstanceOf( '\WP_Error', $return );
		$this->assertEquals( 'wrong_instance_widget', $return->get_error_code() );

		$widget_class = '\Elementor\Widget_Text_editor';
		$widget_id = 'text-editor';

		$this->assertTrue( Elementor\Plugin::instance()->widgets_manager->register_widget( $widget_class ) );

		$widget = Elementor\Plugin::instance()->widgets_manager->get_widget( $widget_id );
		$this->assertInstanceOf( $widget_class, $widget );

		$this->assertTrue( Elementor\Plugin::instance()->widgets_manager->unregister_widget( $widget_id ) );
		$this->assertFalse( Elementor\Plugin::instance()->widgets_manager->unregister_widget( $widget_id ) );

		$this->assertFalse( Elementor\Plugin::instance()->widgets_manager->get_widget( $widget_id ) );
	}

	public function test_controlsSelectorsData() {
		$wrapper_text = '{{WRAPPER}}';
		$wrapper_text_length = strlen( $wrapper_text );

		foreach ( Elementor\Plugin::instance()->widgets_manager->get_registered_widgets() as $widget ) {
			foreach ( $widget->get_style_controls() as $control ) {
				foreach ( $control['selectors'] as $selector => $css_property ) {
					foreach ( explode( ',', $selector ) as $item ) {
						$this->assertEquals( $wrapper_text, substr( trim( $item ), 0, $wrapper_text_length ) );
					}
				}
			}
		}
	}

	public function test_controlsDefaultData() {
		foreach ( Elementor\Plugin::instance()->widgets_manager->get_registered_widgets() as $widget ) {
			foreach ( $widget->get_controls() as $control ) {
				if ( \Elementor\Controls_Manager::SELECT !== $control['type'] )
					continue;
				
				$error_msg = sprintf( 'Widget: %s, Control: %s', $widget->get_id(), $control['name'] );
				
				if ( empty( $control['default'] ) )
					$this->assertTrue( isset( $control['options'][''] ), $error_msg );
				else
					$this->assertArrayHasKey( $control['default'], $control['options'], $error_msg );
			}
		}
	}
}
