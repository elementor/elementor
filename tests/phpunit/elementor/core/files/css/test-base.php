<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use Elementor\Plugin;
use Elementor\Tests\Phpunit\Responsive_Control_Testing_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * Test the CSS Base class
 */
class Test_Base extends Elementor_Test_Base {

	use Responsive_Control_Testing_Trait;

	/**
	 * @var \Elementor\Core\Files\CSS\Post
	 */
	private $css_generator_class;

	/**
	 * @var array
	 */
	private $mock_control;

	private $control_with_responsive_selector_desktop_value = [
		'name' => 'test_responsive_selector',
		'type' => 'slider',
		'selectors' => [
			'(mobile){{WRAPPER}}' => 'width: {{_element_custom_width.SIZE}}{{_element_custom_width.UNIT}};',
		],
	];

	private $control_with_responsive_selector_mobile_value = [
		'name' => 'test_responsive_selector_mobile',
		'type' => 'slider',
		'selectors' => [
			'(mobile){{WRAPPER}}' => 'width: {{_element_custom_width_mobile.SIZE}}{{_element_custom_width_mobile.UNIT}};',
		],
	];

	/**
	 * Element with a responsive condition
	 *
	 * @var array
	 */
	static $element_mock = [
		'id' => '5b2c8e4',
		'elType' => 'widget',
		'isInner' => false,
		'settings' => [
			'_element_width' => '',
			'_element_width_mobile' => 'initial',
			'_element_custom_width' => [
				'size' => 30,
				'unit' => 'px',
			],
			'_element_custom_width_mobile' => [
				'size' => 20,
				'unit' => 'px',
			],
			'test_responsive_selector' => [
				'size' => '',
				'unit' => 'px',
			],
			'test_responsive_selector_mobile' => [
				'size' => '',
				'unit' => 'px',
			],
		],
		'elements' => [],
		'widgetType' => 'button',
	];

	/**
	 * @var array[]
	 */
	private $mock_controls_array;

	/**
	 * @var array
	 */
	private $control_with_units_selectors_dictionary;

	/**
	 * @var array[]
	 */
	private $control_with_units_selectors_dictionary_array;

	public function setUp() {
		parent::setUp();

		// The CSS Base class is abstract, so it can't be instantiated. The inheriting Post class is used instead.
		$this->css_generator_class = new \Elementor\Core\Files\CSS\Post( 0 );

		$this->mock_control = [
			'name' => 'number',
			'type' => 'number',
			'default' => 20,
		];

		$this->mock_controls_array = [
			'number' => $this->mock_control,
		];

		$this->control_with_units_selectors_dictionary = [
			'label' => 'Columns',
			'type' => 'slider',
			'range' => [
				'fr' => [
					'min' => 1,
					'max' => 12,
					'step' => 1,
				],
			],
			'size_units' => [ 'fr', 'custom' ],
			'unit_selectors_dictionary' => [
				'custom' => '--e-con-grid-template-columns: {{SIZE}}',
			],
			'default' => [
				'unit' => 'fr',
				'size' => 3,
			],
			'selectors' => [
				'{{SELECTOR}}' => '--e-con-grid-template-columns: repeat({{SIZE}}, 1fr)',
			],
			'responsive' => true,
		];

		$this->control_with_units_selectors_dictionary_array = [
			'columns_grid' => $this->control_with_units_selectors_dictionary,
		];
	}

	public function test_parse_property_placeholder__value_0_integer() {
		// Arrange.
		$value = 0;

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	public function test_parse_property_placeholder__value_0_string() {
		// Arrange.
		$value = '0';

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	public function test_parse_property_placeholder__value_empty_string() {
		// Arrange.
		$value = '';

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( null, $control_value );
	}

	public function test_parse_property_placeholder__value_null() {
		// Arrange.
		$value = null;

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	public function test_parse_property_placeholder__custom_size_unit() {
		// Arrange.
		$value = [
			'unit' => 'custom',
			'size' => '1fr 2fr 1fr 100px',
			'sizes' => [],
		];

		// Act
		$control_value = $this->get_parsed_unit_value( $value );

		// Assert.
		$this->assertEquals( $value['size'], $control_value );
	}

	public function test_parse_property_placeholder__default_size_unit() {
		// Arrange.
		$value = [
			'unit' => 'fr',
			'size' => '2',
			'sizes' => [],
		];

		// Act
		$control_value = $this->get_parsed_unit_value( $value );

		// Assert.
		$this->assertEquals( $value['size'], $control_value );
	}

	/**
	 * Test parsing and adding rules to a stylesheet for a control with a responsive selector.
	 */
	public function test_add_controls_stack_style_rules_responsive_selector_desktop_control_value() {
		// Arrange
		$initial_duplication_mode = Plugin::$instance->breakpoints->get_responsive_control_duplication_mode();

		$this->setup_responsive_control_condition_test();

		$element_instance = Plugin::$instance->elements_manager->create_element_instance( self::$element_mock );

		$this->mock_controls_array['test_responsive_selector'] = $this->control_with_responsive_selector_desktop_value;

		$selector = $this->css_generator_class->get_element_unique_selector( $element_instance );

		// Act
		$rules = $this->add_and_return_rules( $element_instance, $selector );

		$this->assertEquals( '30px', $rules['max_mobile'][ $selector ]['width'] );

		// Cleanup
		unset( $this->mock_controls_array['test_responsive_selector'] );

		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( $initial_duplication_mode );
	}

	public function test_add_controls_stack_style_rules_responsive_selector_mobile_control_value() {
		// Arrange
		$initial_duplication_mode = Plugin::$instance->breakpoints->get_responsive_control_duplication_mode();

		$this->setup_responsive_control_condition_test();

		$element_instance = Plugin::$instance->elements_manager->create_element_instance( self::$element_mock );

		$this->mock_controls_array['test_responsive_selector_mobile'] = $this->control_with_responsive_selector_mobile_value;

		$selector = $this->css_generator_class->get_element_unique_selector( $element_instance );

			// Act
		$rules = $this->add_and_return_rules( $element_instance, $selector );

		// Assert
		$this->assertEquals( '20px', $rules['max_mobile'][ $selector ]['width'] );

		// Cleanup
		unset( $this->mock_controls_array['test_responsive_selector'] );

		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( $initial_duplication_mode );
	}

	private function add_and_return_rules( $element_instance, $selector ) {
		$this->css_generator_class->add_controls_stack_style_rules(
			$element_instance,
			$this->mock_controls_array,
			$element_instance->get_settings(),
			[ '{{WRAPPER}}' ],
			[ $selector ]
		);

		$stylesheet = $this->css_generator_class->get_stylesheet();

		return $stylesheet->get_rules();
	}

	private function get_parsed_value( $value ) {
		return $this->css_generator_class->parse_property_placeholder(
			$this->mock_control,
			$value,
			$this->mock_controls_array,
			function() {},
			''
		);
	}

	private function get_parsed_unit_value( $value ) {
		return $this->css_generator_class->parse_property_placeholder(
			$this->control_with_units_selectors_dictionary,
			$value,
			$this->control_with_units_selectors_dictionary_array,
			function() {},
			'SIZE'
		);
	}
}
