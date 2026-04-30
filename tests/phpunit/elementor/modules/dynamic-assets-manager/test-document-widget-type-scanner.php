<?php

namespace Elementor\Testing\Modules\DynamicAssetsManager;

use Elementor\Modules\DynamicAssetsManager\Document_Widget_Type_Scanner;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_DynamicAssetsManager_Document_Widget_Type_Scanner extends Elementor_Test_Base {

	public function test_collects_widget_types_nested() {
		$scanner = new Document_Widget_Type_Scanner();
		$elements = [
			[
				'id' => '1',
				'elType' => 'section',
				'elements' => [
					[
						'id' => '2',
						'elType' => 'column',
						'elements' => [
							[
								'id' => '3',
								'elType' => 'widget',
								'widgetType' => 'image-carousel',
								'settings' => [],
							],
						],
					],
				],
			],
			[
				'id' => '4',
				'elType' => 'widget',
				'widgetType' => 'heading',
				'settings' => [],
			],
		];

		$types = $scanner->collect_widget_types_from_elements( $elements );

		$this->assertCount( 2, $types );
		$this->assertContains( 'image-carousel', $types );
		$this->assertContains( 'heading', $types );
	}

	public function test_empty_elements() {
		$scanner = new Document_Widget_Type_Scanner();

		$this->assertSame( [], $scanner->collect_widget_types_from_elements( [] ) );
	}
}
