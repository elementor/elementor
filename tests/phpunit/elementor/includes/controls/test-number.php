<?php
namespace Elementor\Tests\Phpunit\Includes\Controls;

use Elementor\Controls_Manager;
use Elementor\Plugin;
use Elementor\Base_Data_Control;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Number extends Elementor_Test_Base {

	/**
	 * @var Base_Data_Control
	 */
	private $control_obj;

	public function setUp(): void {
		parent::setUp();

		$this->control_obj = Plugin::$instance->controls_manager->get_control( Controls_Manager::NUMBER );
	}

	/**
	 * @dataProvider get_value_data_provider
	 */
	public function test_get_value( $value, $control_default, $expected ) {
		// Arrange
		$control = [
			'name' => '_flex_grow',
			'default' => $control_default,
		];
		$settings = $value !== null ? [ '_flex_grow' => $value ] : [];

		// Act
		$result = $this->control_obj->get_value( $control, $settings );

		// Assert
		$this->assertEquals( $expected, $result );
	}

	public function get_value_data_provider() {
		return [
			'valid_integer' => [ 1, 0, 1 ],
			'valid_float' => [ 1.5, 0, 1.5 ],
			'valid_string_number' => [ '2', 0, '2' ],
			'valid_zero' => [ 0, 1, 0 ],
			'valid_negative' => [ -1, 0, -1 ],
			'default_when_not_set' => [ null, 1, 1 ],
			'default_when_empty_string' => [ '', 1, '' ],
			'default_when_null' => [ null, 0, 0 ],
			'xss_script_tag' => [ '<script>test</script>', 1, 1 ],
			'xss_script_with_alert' => [ '<script>alert("XSS")</script>', 0, '' ],
			'xss_css_injection' => [ '1; color: red', 1, 1 ],
			'xss_css_variable_injection' => [ '1; --evil: url("javascript:alert(1)")', 1, 1 ],
			'xss_html_tags' => [ '<div>test</div>', 1, 1 ],
			'xss_javascript_protocol' => [ 'javascript:alert(1)', 1, 1 ],
		];
	}

	/**
	 * @dataProvider get_style_value_data_provider
	 */
	public function test_get_style_value( $control_value, $control_default, $expected ) {
		// Arrange
		$css_property = 'VALUE';
		$control_data = [
			'default' => $control_default,
		];

		// Act
		$result = $this->control_obj->get_style_value( $css_property, $control_value, $control_data );

		// Assert
		$this->assertEquals( $expected, $result );
	}

	public function get_style_value_data_provider() {
		return [
			'valid_integer' => [ 1, 0, 1 ],
			'valid_float' => [ 1.5, 0, 1.5 ],
			'valid_string_number' => [ '2', 0, '2' ],
			'valid_zero' => [ 0, 1, 0 ],
			'valid_negative' => [ -1, 0, -1 ],
			'default_empty_string' => [ '', 1, '' ],
			'default_null' => [ null, 1, null ],
			'default_non_numeric' => [ 'not-a-number', 1, 1 ],
			'xss_script_tag' => [ '<script>test</script>', 1, 1 ],
			'xss_script_with_alert' => [ '<script>alert("XSS")</script>', 0, '' ],
			'xss_css_injection' => [ '1; color: red', 1, 1 ],
			'xss_css_variable_injection' => [ '1; --evil: url("javascript:alert(1)")', 1, 1 ],
			'xss_html_tags' => [ '<div>test</div>', 1, 1 ],
			'xss_javascript_protocol' => [ 'javascript:alert(1)', 1, 1 ],
		];
	}

	public function test_get_style_value__default_placeholder() {
		// Arrange
		$css_property = 'DEFAULT';
		$control_value = 'should_not_be_used';
		$control_data = [
			'default' => 99,
		];

		// Act
		$result = $this->control_obj->get_style_value( $css_property, $control_value, $control_data );

		// Assert
		$this->assertEquals( 99, $result );
	}
}
