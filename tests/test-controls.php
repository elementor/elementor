<?php

class Elementor_Test_Controls extends WP_UnitTestCase {

	public function test_getInstance() {
		$this->assertInstanceOf( '\Elementor\Controls_Manager', Elementor\Plugin::instance()->controls_manager );
	}

	public function test_getControls() {
		$this->assertNotEmpty( Elementor\Plugin::instance()->controls_manager->get_controls() );
	}

	public function test_renderControls() {
		ob_start();
		Elementor\Plugin::instance()->controls_manager->render_controls();
		$this->assertNotEmpty( ob_get_clean() );
	}

	public function test_enqueueControlScripts() {
		ob_start();
		Elementor\Plugin::instance()->controls_manager->enqueue_control_scripts();
		$this->assertEmpty( ob_get_clean() );
	}

	public function test_getTypes() {
		foreach ( Elementor\Plugin::instance()->controls_manager->get_controls() as $control ) {
			$this->assertNotEmpty( $control->get_type() );
		}
	}

	public function test_registerNUnregisterControl() {
		$return = Elementor\Plugin::instance()->controls_manager->register_control( 'test_control', 'Control_Text_Not_Found' );
		$this->assertInstanceOf( '\WP_Error', $return );
		$this->assertEquals( 'element_class_name_not_exists', $return->get_error_code() );

		$return = Elementor\Plugin::instance()->controls_manager->register_control( 'test_control', '\Elementor\DB' );
		$this->assertInstanceOf( '\WP_Error', $return );
		$this->assertEquals( 'wrong_instance_control', $return->get_error_code() );

		$control_class = '\Elementor\Control_Text';
		$control_id = 'text';

		$this->assertTrue( Elementor\Plugin::instance()->controls_manager->register_control( $control_id, $control_class ) );

		$control = Elementor\Plugin::instance()->controls_manager->get_control( $control_id );
		$this->assertInstanceOf( $control_class, $control );

		$this->assertTrue( Elementor\Plugin::instance()->controls_manager->unregister_control( $control_id ) );
		$this->assertFalse( Elementor\Plugin::instance()->controls_manager->unregister_control( $control_id ) );

		// Return the control for next tests..
		$this->assertTrue( Elementor\Plugin::instance()->controls_manager->register_control( $control_id, $control_class ) );
	}

	public function test_groupControlsGetTypes() {
		foreach ( Elementor\Plugin::instance()->controls_manager->get_group_controls() as $group_control ) {
			$this->assertNotEmpty( $group_control->get_type() );
		}
	}

	public function test_replaceStyleValues() {
		$stylesheet = new \Elementor\Stylesheet();

		$controls_stack = [
			'margin' => [
				'name' => 'margin',
				'type' => \Elementor\Controls_Manager::DIMENSIONS,
				'selectors' => [
					'{{WRAPPER}} .elementor-element' => 'margin: {{TOP}}px {{RIGHT}}px {{BOTTOM}}px {{LEFT}}px;',
				]
			],
			'color' => [
				'name' => 'color',
				'type' => \Elementor\Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-element' => 'color: {{VALUE}};',
				]
			]
		];

		$values = [
			'color' => '#fff',
			'margin' => [
				'top' => '1',
				'right' => '2',
				'bottom' => '3',
				'left' => '4',
			]
		];

		$value_callback = function ( $control ) use ( $values ) {
			return $values[ $control['name'] ];
		};

		$placeholders = [ '{{WRAPPER}}' ];

		$replacements = [ '.elementor-test-element' ];

		\Elementor\Post_CSS_File::add_control_rules( $stylesheet, $controls_stack['color'], $controls_stack, $value_callback, $placeholders, $replacements );

		$this->assertEquals(
			'#fff',
			$stylesheet->get_rules( 'desktop', '.elementor-test-element .elementor-element', 'color' )
		);

		\Elementor\Post_CSS_File::add_control_rules( $stylesheet, $controls_stack['margin'], $controls_stack, $value_callback, $placeholders, $replacements );

		$this->assertEquals(
			'1px 2px 3px 4px',
			$stylesheet->get_rules( 'desktop', '.elementor-test-element .elementor-element', 'margin' )
		);
	}

	public function test_checkCondition() {
		Elementor\Plugin::instance()->widgets_manager->get_widget_types(); // Ensure the widgets initialized

		$element_obj = \Elementor\Plugin::instance()->elements_manager->create_element_instance( [
			'elType' => 'widget',
			'widgetType' => 'text-editor',
			'id' => 'test_id',
			'settings' => [
				'control_1' => 'value',
			]
		] );

		$this->assertTrue( $element_obj->is_control_visible( [] ) );

		$control_option = [
			'name' => 'control_2',
			'condition' => [
				'control_1' => 'value1',
			],
		];

		$this->assertFalse( $element_obj->is_control_visible( $control_option) );

		$control_option = [
			'name' => 'control_2',
			'condition' => [
				'control_1' => 'value',
			],
		];

		$this->assertTrue( $element_obj->is_control_visible( $control_option) );

		$control_option = [
			'name' => 'control_2',
			'condition' => [
				'control_1!' => 'value',
			],
		];
		$this->assertFalse( $element_obj->is_control_visible( $control_option) );
	}

	public function test_getDefaultValue() {
		// Text Control
		$text_control = Elementor\Plugin::instance()->controls_manager->get_control( \Elementor\Controls_Manager::TEXT );
		
		$control_option = [
			'name' => 'key',
			'default' => 'value',
		];
		$this->assertEquals( 'value', $text_control->get_value( $control_option, [] ) );
		
		// URL Control
		$url_control = Elementor\Plugin::instance()->controls_manager->get_control( \Elementor\Controls_Manager::URL );
		$control_option = [
			'name' => 'key',
			'default' => [
				'url' => 'THE_LINK',
			],
		];
		$this->assertEquals( [ 'url' => 'THE_LINK', 'is_external' => '' ], $url_control->get_value( $control_option, [ 'key' => [ 'is_external' => '' ] ] ) );
		
		// Repeater Control
		$repeater_control = \Elementor\Plugin::instance()->controls_manager->get_control( \Elementor\Controls_Manager::REPEATER );
		$control_option = [
			'name' => 'key',
			'default' => [ [] ],
			'fields' => [
				[
					'name' => 'one',
					'type' => \Elementor\Controls_Manager::TEXT,
					'default' => 'value',
				],
			],
		];

		$expected = [
			[
				'one' => 'value',
			]
		];
		$this->assertEquals( $expected, $repeater_control->get_value( $control_option, [ [] ] ) );
	}
}
