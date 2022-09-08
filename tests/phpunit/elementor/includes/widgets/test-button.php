<?php

namespace Elementor\Tests\Phpunit\Includes\Widgets;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Button extends Elementor_Test_Base {

	public function test_on_import_update_dynamic_content() {
		// Arrange.
		// In the actual on_import_update_dynamic_content() method, the page have already been imported,
		// but for the purposes of this test, we need to create it first.
		$page = $this->factory()->create_and_get_custom_post( [
			'post_type' => 'page',
			'post_name' => 'test-page',
		] );

		$page_relative_url = wp_make_link_relative( get_permalink( $page ) );

		$mock_element_config = [
			'id' => 'test-id',
			'elType' => 'widget',
			'settings' => [
				'anchor' => 'test-anchor',
				'link' => [
					'url' => 'https://example.com/test-page',
					'is_external' => '',
					'nofollow' => '',
				],
			],
			'widgetType' => 'button',
		];

		$data = [
			'base_site_url' => 'https://example.com',
		];

		$element = Plugin::$instance->elements_manager->create_element_instance( $mock_element_config );

		// Act.
		$element_settings = $element::on_import_update_dynamic_content( $mock_element_config, $data );

		// Assert.
		$this->assertContains( $page_relative_url, $element_settings['settings']['link']['url'] );
		$this->assertNotContains( $data['base_site_url'], $element_settings['settings']['link']['url'] );
	}

}
