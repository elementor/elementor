<?php
namespace Elementor\Testing\Modules\KitElementsDefaults\ImportExport\Runners;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\KitElementsDefaults\Module;
use Elementor\Modules\KitElementsDefaults\ImportExport\Runners\Export;

class Test_Export extends Elementor_Test_Base {
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

		Plugin::$instance->widgets_manager->unregister( Mock_Widget_Kits_Defaults::NAME );
		Plugin::$instance->controls_manager->unregister( Mock_Control_Kits_Defaults::NAME );
	}

	public function test_export() {
		// Arrange
		$runner = new Export();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Module::META_KEY, [
			Mock_Widget_Kits_Defaults::NAME => [
				'text' => 'value <script>Test</script> value',
				'remove_because_has_export_false' => 'some value',
				'invalid_control' => 'some value',
				'removed_on_import_and_on_export_method' => 'some value',
				'mock-control-1' => 'value',
				'__globals__' => [
					'color' => 'global-color',
					'invalid_control2' => 'some value',
				],
				'__dynamic__' => [
					'invalid_control3' => 'some value',
					'link' => '[text="some value"]<script>alert("hack!")</script>',
				]
			],
		] );

		// Act
		$result = $runner->export( [] );

		// Assert
		$this->assertEquals( [
			'files' => [
				'path' => 'kit-elements-defaults',
				'data' => [
					Mock_Widget_Kits_Defaults::NAME => [
						'text' => 'value Test value',
						'mock-control-1' => 'value changed on export',
						'__globals__' => [
							'color' => 'global-color',
						],
						'__dynamic__' => [
							'link' => '[text="some value"]alert("hack!")',
						],
					],
				],
			],
		], $result );
	}

	public function test_export__when_there_is_no_default_values() {
		// Arrange
		$runner = new Export();

		Plugin::$instance->kits_manager->get_active_kit()->update_json_meta( Module::META_KEY, [] );

		// Act
		$result = $runner->export( [] );

		// Assert
		$this->assertEquals( [
			'manifest' => [],
			'files' => [],
		], $result );
	}
}
