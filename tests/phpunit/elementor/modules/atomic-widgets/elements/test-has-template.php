<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Has_Template extends Elementor_Test_Base {
	use MatchesSnapshots;

	/**
	 * @dataProvider element_data_provider
	 */
	public function test_render( array $element_data ): void {
		// Arrange.
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( $element_data );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function element_data_provider() {
		return [ 'Atomic Image default' => [
			[
				'id' => 'e8e55a1',
				'elType' => 'widget',
				'settings' => [
					'image' => [
						'id' => 123,
						'url' => 'https://example.com/image.jpg',
					],
				],
				'widgetType' => 'a-image',
			],
		],
			'Atomic Image linked' => [
				[
					'id' => 'e8e55a1',
					'elType' => 'widget',
					'settings' => [
						'image' => [
							'id' => 123,
							'url' => 'https://example.com/image.jpg',
						],
						'link' => [
							'href' => 'https://example.com',
							'target' => '_blank',
						],
					],
					'widgetType' => 'a-image',
				],
			],
			'Atomic Paragraph default' => [
				[
					'id' => 'e8e55a1',
					'elType' => 'widget',
					'settings' => [],
					'widgetType' => 'a-paragraph',
				],
			],
			'Atomic Paragraph linked' => [
				[
					'id' => 'e8e55a1',
					'elType' => 'widget',
					'settings' => [
						'link' => [
							'href' => 'https://example.com',
							'target' => '_blank',
						],
					],
					'widgetType' => 'a-paragraph',
				],
			],
			'Atomic SVG default' => [
				[
					'id' => 'abcd123',
					'elType' => 'widget',
					'settings' => [],
					'widgetType' => 'a-svg',
				]
			],
		];
	}
}
