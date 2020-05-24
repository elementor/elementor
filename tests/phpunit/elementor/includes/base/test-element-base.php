<?php
namespace Elementor\Tests\Phpunit\Includes\Base;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Element_Base extends Elementor_Test_Base {

	/**
	 * @var array
	 */
	static $element_mock = [
		'id' => '5a1e8e5',
		'elType' => 'widget',
		'isInner' => false,
		'settings' => ['text' => 'Click here', ],
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
			'results' => 'alert()',
		],
		'javascript_javascript' => [
			'test' => 'javascript:javascript:alert()',
			'results' => 'alert()',
		],
		'relative' => [
			'test' => '/test',
			'results' => '/test',
		],
		'hash' => [
			'test' => '#test',
			'results' => '#test',
		],
	];

	public function test_add_link_attributes() {
		$element = Plugin::$instance->elements_manager->create_element_instance( self::$element_mock );

		foreach ( self::$urls as $type => $config ) {
			$element->add_link_attributes( $type, [
				'url' => $config['test']
			] );

			$results = $element->get_render_attributes( $type );

			$this->assertEquals( $config['results'], $results[ 'href' ][0], 'Test ' . $type );
		}
	}
}
