<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group design-system-sync
 */
class Test_Variables_Provider extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();

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

	public function test_get_all_variables__returns_empty_when_no_variables() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$db_record = [
			'data' => [],
			'watermark' => 0,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$result = Variables_Provider::get_all_variables();

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_get_all_variables__returns_all_variables() {
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
				'var-2' => [
					'type' => 'global-font-variable',
					'label' => 'Heading',
					'value' => [
						'$$type' => 'font',
						'value' => 'Roboto',
					],
					'sync_to_v3' => false,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$result = Variables_Provider::get_all_variables();

		// Assert
		$this->assertCount( 2, $result );
		$this->assertArrayHasKey( 'var-1', $result );
		$this->assertArrayHasKey( 'var-2', $result );
	}

	public function test_get_all_variables__caches_result() {
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
		$result1 = Variables_Provider::get_all_variables();

		$db_record['data']['var-2'] = [
			'type' => 'global-color-variable',
			'label' => 'Secondary',
			'value' => [
				'$$type' => 'color',
				'value' => '#00ff00',
			],
			'sync_to_v3' => true,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		$result2 = Variables_Provider::get_all_variables();

		// Assert
		$this->assertCount( 1, $result1 );
		$this->assertCount( 1, $result2 );
		$this->assertSame( $result1, $result2 );
	}

	public function test_get_synced_color_variables__filters_by_color_type() {
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
				'var-2' => [
					'type' => 'global-font-variable',
					'label' => 'Heading',
					'value' => [
						'$$type' => 'font',
						'value' => 'Roboto',
					],
					'sync_to_v3' => true,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$result = Variables_Provider::get_synced_color_variables();

		// Assert
		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( 'var-1', $result );
		$this->assertEquals( 'global-color-variable', $result['var-1']['type'] );
	}

	public function test_get_synced_color_variables__filters_by_sync_to_v3_flag() {
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
				'var-2' => [
					'type' => 'global-color-variable',
					'label' => 'Secondary',
					'value' => [
						'$$type' => 'color',
						'value' => '#00ff00',
					],
					'sync_to_v3' => false,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$result = Variables_Provider::get_synced_color_variables();

		// Assert
		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( 'var-1', $result );
	}

	public function test_get_synced_color_variables__excludes_deleted_variables() {
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
				'var-2' => [
					'type' => 'global-color-variable',
					'label' => 'Deleted',
					'value' => [
						'$$type' => 'color',
						'value' => '#00ff00',
					],
					'sync_to_v3' => true,
					'deleted' => true,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		// Act
		$result = Variables_Provider::get_synced_color_variables();

		// Assert
		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( 'var-1', $result );
	}

	public function test_clear_cache__clears_cached_variables() {
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
		$result1 = Variables_Provider::get_all_variables();

		Variables_Provider::clear_cache();

		$db_record['data']['var-2'] = [
			'type' => 'global-color-variable',
			'label' => 'Secondary',
			'value' => [
				'$$type' => 'color',
				'value' => '#00ff00',
			],
			'sync_to_v3' => true,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		$result2 = Variables_Provider::get_all_variables();

		// Assert
		$this->assertCount( 1, $result1 );
		$this->assertCount( 2, $result2 );
	}
}

