<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group design-system-sync
 */
class Test_Global_Colors_Extension extends Elementor_Test_Base {
	private $extension;

	public function setUp(): void {
		parent::setUp();

		$this->extension = new Global_Colors_Extension();
		Variables_Provider::clear_cache();
		$this->clear_kit_variables();
	}

	public function tearDown(): void {
		Variables_Provider::clear_cache();
		$this->clear_kit_variables();

		parent::tearDown();
	}

	private function clear_kit_variables() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( '_elementor_global_variables' );
		}
	}

	public function test_get_v4_color_variables__returns_empty_when_no_variables() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$db_record = [
			'data' => [],
			'watermark' => 0,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'get_v4_color_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_get_v4_color_variables__formats_variables_correctly() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$db_record = [
			'data' => [
				'var-1' => [
					'type' => 'global-color-variable',
					'label' => 'Primary',
					'value' => [
						'$$type' => 'color',
						'value' => '#ff0000',
					],
					'sync_to_v3' => true,
					'order' => 0,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'get_v4_color_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertEquals( 'var-1', $result[0]['id'] );
		$this->assertEquals( 'Primary', $result[0]['label'] );
		$this->assertEquals( '#ff0000', $result[0]['value'] );
		$this->assertEquals( 0, $result[0]['order'] );
	}

	public function test_get_v4_color_variables__extracts_nested_color_value() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$db_record = [
			'data' => [
				'var-1' => [
					'type' => 'global-color-variable',
					'label' => 'Primary',
					'value' => [
						'$$type' => 'color',
						'value' => '#ff0000',
					],
					'sync_to_v3' => true,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'get_v4_color_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension );

		// Assert
		$this->assertEquals( '#ff0000', $result[0]['value'] );
	}

	public function test_get_v4_color_variables__sorts_by_order() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$db_record = [
			'data' => [
				'var-1' => [
					'type' => 'global-color-variable',
					'label' => 'Third',
					'value' => [
						'$$type' => 'color',
						'value' => '#ff0000',
					],
					'sync_to_v3' => true,
					'order' => 2,
				],
				'var-2' => [
					'type' => 'global-color-variable',
					'label' => 'First',
					'value' => [
						'$$type' => 'color',
						'value' => '#00ff00',
					],
					'sync_to_v3' => true,
					'order' => 0,
				],
				'var-3' => [
					'type' => 'global-color-variable',
					'label' => 'Second',
					'value' => [
						'$$type' => 'color',
						'value' => '#0000ff',
					],
					'sync_to_v3' => true,
					'order' => 1,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'get_v4_color_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension );

		// Assert
		$this->assertEquals( 'First', $result[0]['label'] );
		$this->assertEquals( 'Second', $result[1]['label'] );
		$this->assertEquals( 'Third', $result[2]['label'] );
	}

	public function test_add_v4_variables_section_to_color_selector__returns_items_unchanged_when_no_variables() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_variables', [
			'data' => [],
			'watermark' => 0,
		] );

		$items = [
			'existing-1' => [
				'id' => 'existing-1',
				'title' => 'Existing',
				'value' => '#000000',
				'group' => 'default',
			],
		];

		// Act
		$result = $this->extension->add_v4_variables_section_to_color_selector( $items );

		// Assert
		$this->assertSame( $items, $result );
	}

	public function test_add_v4_variables_section_to_color_selector__injects_v4_colors_with_correct_format() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_variables', [
			'data' => [
				'var-1' => [
					'type' => 'global-color-variable',
					'label' => 'Primary',
					'value' => [
						'$$type' => 'color',
						'value' => '#ff0000',
					],
					'sync_to_v3' => true,
					'order' => 0,
				],
			],
			'watermark' => 1,
		] );

		$items = [];

		// Act
		$result = $this->extension->add_v4_variables_section_to_color_selector( $items );

		// Assert
		$this->assertArrayHasKey( 'v4-Primary', $result );
		$this->assertEquals( 'v4-Primary', $result['v4-Primary']['id'] );
		$this->assertEquals( 'Primary', $result['v4-Primary']['title'] );
		$this->assertEquals( '#FF0000', $result['v4-Primary']['value'] );
		$this->assertEquals( 'v4', $result['v4-Primary']['group'] );
	}
}
