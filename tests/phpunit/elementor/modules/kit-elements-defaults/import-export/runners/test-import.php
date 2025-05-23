<?php
namespace Elementor\Testing\Modules\KitElementsDefaults\ImportExport\Runners;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\KitElementsDefaults\Module;
use Elementor\Modules\KitElementsDefaults\ImportExport\Runners\Import;

class Test_Import extends Elementor_Test_Base {
	public function setUp() {
		require_once __DIR__ . '/mock/mock-widget-kits-defaults.php';
		require_once __DIR__ . '/mock/mock-control-kits-defaults.php';

		// Get controls will initialize the controls manager, so we can't register the control before.
		Plugin::$instance->controls_manager->get_controls();
		Plugin::$instance->controls_manager->register( new Mock_Control_Kits_Defaults() );
		Plugin::$instance->widgets_manager->register( new Mock_Widget_Kits_Defaults() );

		parent::setUp();
	}

	public function tearDown() {
		parent::tearDown();

		Plugin::$instance->controls_manager->unregister( Mock_Control_Kits_Defaults::NAME );
		Plugin::$instance->widgets_manager->unregister( Mock_Widget_Kits_Defaults::NAME );
	}

	public function test_import() {
		// Arrange
		$runner = new Import();

		// Act
		$runner->import( [ 'extracted_directory_path' => __DIR__ . '/mock', ], [] );

		// Assert
		$this->assertSame( [
			Mock_Widget_Kits_Defaults::NAME => [
				'text' => 'value Test value',
				'slider' => [
					'size' => 10,
					'unit' => 'px',
				],
				'mock-control-1' => 'value changed on import',
				'__globals__' => [
					'color' => 'global-color',
				],
				'__dynamic__' => [],
			],
		], Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Module::META_KEY ) );
	}
}
