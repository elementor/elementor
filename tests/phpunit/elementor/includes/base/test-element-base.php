<?php

namespace Elementor\Tests\Phpunit\Includes\Base;

use Elementor\Plugin;
use Elementor\Frontend;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Element_Base extends Elementor_Test_Base {

	/**
	 * @var array
	 */
	static $element_mock = [
		'id' => '5a1e8e5',
		'elType' => 'widget',
		'isInner' => false,
		'settings' => [ 'text' => 'Click here', ],
		'elements' => [],
		'widgetType' => 'button',
	];

	static $urls = [
		'absolute_http' => [
			'test' => 'http://test.com',
			'results' => 'http://test.com',
		],
		'absolute_https' => [
			'test' => 'https://test.com',
			'results' => 'https://test.com',
		],
		'absolute_no_scheme' => [
			'test' => '//test.com',
			'results' => '//test.com',
		],
		'javascript' => [
			'test' => 'javascript:alert()',
			'results' => '',
		],
		'javascript_javascript' => [
			'test' => 'javascript:javascript:alert()',
			'results' => '',
		],
		'javajavascript_script' => [
			'test' => 'javajavascript:script:alert()',
			'results' => '',
		],
		'javascript_case_sensitive' => [
			'test' => 'JaVaScript:alert()',
			'results' => '',
		],
		'javascript_special_characters1' => [
			'test' => 'javas cript:alert()',
			'results' => '',
		],
		'javascript_special_characters2' => [
			'test' => 'javascript :alert()',
			'results' => '',
		],
		'javascript_special_characters3' => [
			'test' => 'jA&#x0A;Vas&#099;&#000000114;&#00105;&#X70;&#000000000000000000000116;:alert()',
			'results' => '',
		],
		'relative' => [
			'test' => '/test',
			'results' => '/test',
		],
		'hash' => [
			'test' => '#test',
			'results' => '#test',
		],
		'mailto' => [
			'test' => 'mailto:test@test.test',
			'results' => 'mailto:test@test.test',
		],
		'tel' => [
			'test' => 'tel:123456',
			'results' => 'tel:123456',
		],
		'elementor_action' => [
			'test' => '#elementor-action%3Aaction%3Dpopup%3Aopen%26settings%3DeyJpZCI6IjExODgiLCJ0b2dnbGUiOmZhbHNlfQ%3D%3D',
			'results' => '#elementor-action%3Aaction%3Dpopup%3Aopen%26settings%3DeyJpZCI6IjExODgiLCJ0b2dnbGUiOmZhbHNlfQ%3D%3D',
		],
	];

	// Valid/not valid custom attributes.
	static $custom_attributes = [
		'rel' => [
			'test' => 'rel|noreferrer',
			'results' => 'rel="noreferrer"',
		],
		'download' => [
			'test' => 'download|filename',
			'results' => 'download="filename"',
		],
		'title' => [
			'test' => 'title|Learn More',
			'results' => 'title="Learn More"',
		],
		'style' => [
			'test' => 'style|color:red',
			'results' => 'style="color:red"',
		],
		'data' => [
			'test' => 'data-id|8',
			'results' => 'data-id="8"',
		],
		'onclick' => [
			'test' => 'onclick|alert()',
			'results' => '',
		],
		'onclick_prefix' => [
			'test' => 'test onclick|alert()',
			'results' => 'test="alert()"',
		],
		'onclick_slash_prefix' => [
			'test' => 'test/onclick|alert()',
			'results' => 'test="alert()"',
		],
		'onclick_spaces' => [
			'test' => ' onclick|alert()',
			'results' => '',
		],
		'onclick_quotes_prefix' => [
			'test' => '""onclick|alert()',
			'results' => '',
		],
		'onclick_no_pipe' => [
			'test' => 'onclick="alert()"',
			'results' => '',
		],
		'onclick_no_pipe_with_prefix' => [
			'test' => '"test"="1"onclick="alert()"',
			'results' => 'test=""',
		],
		'onclick_as_a_value' => [
			'test' => 'test|"onclick=alert()',
			'results' => 'test="&quot;onclick=alert()"',
		],
	];

	public function test_add_link_attributes() {
		$element = Plugin::$instance->elements_manager->create_element_instance( self::$element_mock );

		foreach ( self::$urls as $type => $config ) {
			$element->add_link_attributes( $type, [
				'url' => $config['test'],
			] );

			$results = $element->get_render_attributes( $type );

			$this->assertEquals( $config['results'], $results['href'][0], 'Test ' . $type );
		}
	}

	public function test_add_link_custom_attributes() {
		$element = Plugin::$instance->elements_manager->create_element_instance( self::$element_mock );

		foreach ( self::$custom_attributes as $type => $config ) {
			$element->add_link_attributes( $type, [
				'custom_attributes' => $config['test'],
			] );

			$results = $element->get_render_attribute_string( $type );

			$this->assertEquals( $config['results'], $results, 'Test ' . $type );
		}
	}

	public function test_add_invisible_class_attribute_when_animation_on() {
		$element = Plugin::$instance->elements_manager->create_element_instance( self::$element_mock );

		$element->set_settings( 'animation', true );

		ob_start();
		$element->print_element();
		ob_end_clean();

		$this->assertTrue( in_array( 'elementor-invisible', $element->get_render_attributes( '_wrapper', 'class' ) ) );
	}
}
