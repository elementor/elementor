<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
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
						'src' => 'https://example.com/image.jpg',
					],
				],
				'widgetType' => Atomic_Image::get_element_type(),
			],
		],
			'Atomic Image linked' => [
				[
					'id' => 'e8e55a1',
					'elType' => 'widget',
					'settings' => [
						'image' => [
							'id' => 123,
							'src' => 'https://example.com/image.jpg',
						],
						'link' => [
							'href' => 'https://example.com',
							'target' => '_blank',
						],
					],
					'widgetType' => Atomic_Image::get_element_type(),
				],
			],
			'Atomic Paragraph default' => [
				[
					'id' => 'e8e55a1',
					'elType' => 'widget',
					'settings' => [],
					'widgetType' => Atomic_Paragraph::get_element_type(),
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
					'widgetType' => Atomic_Paragraph::get_element_type(),
				],
			],
			'Atomic SVG default' => [
				[
					'id' => 'abcd123',
					'elType' => 'widget',
					'settings' => [],
					'widgetType' => Atomic_Svg::get_element_type(),
				]
			],
		];
	}
}
