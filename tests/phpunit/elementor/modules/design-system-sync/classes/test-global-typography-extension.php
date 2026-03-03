<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group design-system-sync
 */
class Test_Global_Typography_Extension extends Elementor_Test_Base {
	private $extension;

	public function setUp(): void {
		parent::setUp();

		$this->extension = new Global_Typography_Extension();
		Classes_Provider::clear_cache();
		$this->clear_kit_classes();
	}

	public function tearDown(): void {
		Classes_Provider::clear_cache();
		$this->clear_kit_classes();

		parent::tearDown();
	}

	private function clear_kit_classes() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( '_elementor_global_classes' );
		}
	}

	public function test_add_v4_classes_to_typography_selector__returns_items_unchanged_when_no_classes() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [],
		] );

		$items = [
			'existing-1' => [
				'id' => 'existing-1',
				'title' => 'Existing',
				'value' => [],
			],
		];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$this->assertSame( $items, $result );
	}

	public function test_add_v4_classes_to_typography_selector__skips_classes_without_sync_to_v3() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [
				'class-1' => [
					'label' => 'Heading',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [
								'font-family' => 'Roboto',
								'font-size' => '24px',
							],
						],
					],
					'sync_to_v3' => false,
				],
			],
		] );

		$items = [];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_add_v4_classes_to_typography_selector__skips_classes_without_typography_props() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [
				'class-1' => [
					'label' => 'Color Only',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [
								'color' => '#ff0000',
								'background-color' => '#000000',
							],
						],
					],
					'sync_to_v3' => true,
				],
			],
		] );

		$items = [];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_add_v4_classes_to_typography_selector__injects_v4_classes_with_correct_format() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [
				'class-1' => [
					'label' => 'Heading',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [
								'font-family' => 'Roboto',
								'font-size' => '24px',
								'font-weight' => 'bold',
								'line-height' => '1.5',
							],
						],
					],
					'sync_to_v3' => true,
				],
			],
		] );

		$items = [];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$this->assertArrayHasKey( 'v4-Heading', $result );
		$this->assertEquals( 'v4-Heading', $result['v4-Heading']['id'] );
		$this->assertEquals( 'Heading', $result['v4-Heading']['title'] );
		$this->assertEquals( 'v4', $result['v4-Heading']['group'] );
		$this->assertIsArray( $result['v4-Heading']['value'] );
	}

	public function test_add_v4_classes_to_typography_selector__converts_props_to_v3_format() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [
				'class-1' => [
					'label' => 'Body',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [
								'font-family' => 'Arial',
								'font-size' => '16px',
								'font-weight' => '400',
								'font-style' => 'italic',
							],
						],
					],
					'sync_to_v3' => true,
				],
			],
		] );

		$items = [];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$value = $result['v4-Body']['value'];
		$this->assertEquals( 'Arial', $value['typography_font_family'] );
		$this->assertEquals( '16px', $value['typography_font_size'] );
		$this->assertEquals( '400', $value['typography_font_weight'] );
		$this->assertEquals( 'italic', $value['typography_font_style'] );
		$this->assertEquals( 'custom', $value['typography_typography'] );
	}

	public function test_add_v4_classes_to_typography_selector__prepends_v4_items() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [
				'class-1' => [
					'label' => 'V4Class',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [
								'font-family' => 'Roboto',
							],
						],
					],
					'sync_to_v3' => true,
				],
			],
		] );

		$items = [
			'v3-item' => [
				'id' => 'v3-item',
				'title' => 'V3 Item',
				'value' => [],
			],
		];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$keys = array_keys( $result );
		$this->assertEquals( 'v4-V4Class', $keys[0] );
		$this->assertEquals( 'v3-item', $keys[1] );
	}

	public function test_add_v4_classes_to_typography_selector__skips_empty_props() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [
				'class-1' => [
					'label' => 'EmptyProps',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [],
						],
					],
					'sync_to_v3' => true,
				],
			],
		] );

		$items = [];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_add_v4_classes_to_typography_selector__skips_empty_label() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [
				'class-1' => [
					'label' => '',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [
								'font-family' => 'Roboto',
							],
						],
					],
					'sync_to_v3' => true,
				],
			],
		] );

		$items = [];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_add_v4_classes_to_typography_selector__handles_multiple_classes() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit->update_json_meta( '_elementor_global_classes', [
			'items' => [
				'class-1' => [
					'label' => 'Heading',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [
								'font-family' => 'Roboto',
							],
						],
					],
					'sync_to_v3' => true,
				],
				'class-2' => [
					'label' => 'Body',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'normal',
							],
							'props' => [
								'font-family' => 'Arial',
							],
						],
					],
					'sync_to_v3' => true,
				],
			],
		] );

		$items = [];

		// Act
		$result = $this->extension->add_v4_classes_to_typography_selector( $items );

		// Assert
		$this->assertCount( 2, $result );
		$this->assertArrayHasKey( 'v4-Heading', $result );
		$this->assertArrayHasKey( 'v4-Body', $result );
	}
}
