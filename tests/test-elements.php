<?php

class Elementor_Test_Elements extends WP_UnitTestCase {

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Elements_Manager', Elementor\Plugin::instance()->elements_manager );
	}

	public function test_getElements() {
		$this->assertNotEmpty( Elementor\Plugin::instance()->elements_manager->get_element_types() );
	}

	public function test_elementMethods() {
		foreach ( \Elementor\Plugin::instance()->elements_manager->get_element_types() as $element ) {
			$this->assertNotEmpty( $element->get_title() );
			$this->assertNotEmpty( $element->get_type() );
			$this->assertNotEmpty( $element->get_name() );
		}
	}

	public function test_registerNUnregisterElement() {
		$element_class = '\Elementor\Element_Column';
		$element_id = 'column';

		$this->assertTrue( Elementor\Plugin::instance()->elements_manager->register_element_type( new $element_class( [ 'id' => $element_id ] ) ) );

		$element = Elementor\Plugin::instance()->elements_manager->get_element_types( $element_id );
		$this->assertInstanceOf( $element_class, $element );

		$this->assertTrue( Elementor\Plugin::instance()->elements_manager->unregister_element_type( $element_id ) );
		$this->assertFalse( Elementor\Plugin::instance()->elements_manager->unregister_element_type( $element_id ) );

		$this->assertNull( Elementor\Plugin::instance()->elements_manager->get_element_types( $element_id ) );

		$this->assertTrue( Elementor\Plugin::instance()->elements_manager->register_element_type( new $element_class( [ 'id' => $element_id ] ) ) );
	}

	/**
	 * @expectedIncorrectUsage  Elementor\Controls_Manager::add_control_to_stack
	 */
	public function test_redeclareControl() {
		$element_obj = Elementor\Plugin::instance()->elements_manager->get_element_types( 'section' );

		$control_id = 'test_redeclare_control';
		$element_obj->add_control( $control_id, [ 'section' => 'section_layout' ] );
		$element_obj->add_control( $control_id, [ 'section' => 'section_layout' ] );
		$element_obj->remove_control( $control_id );
	}

	public function test_controlsSelectorsData() {
		$wrapper_text = '{{WRAPPER}}';

		foreach ( Elementor\Plugin::instance()->elements_manager->get_element_types() as $element ) {
			foreach ( $element->get_style_controls() as $control ) {
				foreach ( $control['selectors'] as $selector => $css_property ) {
					foreach ( explode( ',', $selector ) as $item ) {
						$this->assertTrue( false !== strpos( $item, $wrapper_text ) );
					}
				}
			}
		}
	}

	public function test_controlsDefaultData() {
		foreach ( Elementor\Plugin::instance()->elements_manager->get_element_types() as $element ) {
			foreach ( $element->get_controls() as $control ) {
				if ( \Elementor\Controls_Manager::SELECT !== $control['type'] )
					continue;

				$error_msg = sprintf( 'Element: %s, Control: %s', $element->get_name(), $control['name'] );

				if ( empty( $control['default'] ) )
					$this->assertTrue( isset( $control['options'][''] ), $error_msg );
				else
					$this->assertArrayHasKey( $control['default'], $control['options'], $error_msg );
			}
		}
	}
}
