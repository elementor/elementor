<?php
namespace Elementor\Testing\Modules\KitElementsDefaults\ImportExport\Runners;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\KitElementsDefaults\Module;
use Elementor\Modules\KitElementsDefaults\ImportExport\Runners\Import;

class Test_Import extends Elementor_Test_Base {
	public function setUp() {
		parent::setUp();

		require_once __DIR__ . '/mock/mock-widget.php';

		Plugin::$instance->widgets_manager->register( new Mock_Widget() );
	}

	public function tearDown() {
		parent::tearDown();

		Plugin::$instance->widgets_manager->unregister( Mock_Widget::NAME );
	}

	public function test_import() {
		// Arrange
		$runner = new Import();

		// Act
		$runner->import( [ 'extracted_directory_path' => __DIR__ . '/mock', ], [] );

		// Assert
		$this->assertEquals( [
			'mock-widget' => [
				'text' => 'value Test value',
				'__globals__' => [
					'color' => 'global-color',
				],
				'__dynamic__' => [],
			],
		], Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Module::META_KEY ) );
	}
}
