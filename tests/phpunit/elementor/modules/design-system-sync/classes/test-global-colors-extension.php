<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Modules\Variables\Storage\Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Global_Colors_Extension extends Elementor_Test_Base {
	private $extension;
	private $kit_id;

	public function setUp(): void {
		parent::setUp();

		$this->extension = new Global_Colors_Extension();
		$this->kit_id = Plugin::$instance->kits_manager->get_active_id();
	}

	public function test_get_v4_color_variables__returns_empty_when_no_variables() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();
		$repository = new Repository( $kit );
		
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

	public function test_get_v4_color_variables__filters_by_color_type() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();
		
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
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'get_v4_color_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertEquals( 'Primary', $result[0]['label'] );
		$this->assertEquals( '#ff0000', $result[0]['value'] );
	}

	public function test_get_v4_color_variables__filters_by_sync_to_v3_flag() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();
		
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
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'get_v4_color_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertEquals( 'Primary', $result[0]['label'] );
		$this->assertEquals( '#ff0000', $result[0]['value'] );
	}

	public function test_get_v4_color_variables__excludes_deleted_variables() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();
		
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
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'get_v4_color_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertEquals( 'Primary', $result[0]['label'] );
		$this->assertEquals( '#ff0000', $result[0]['value'] );
	}

	public function test_render_v4_variables__generates_html() {
		// Arrange
		$variables = [
			[
				'id' => 'var-1',
				'label' => 'Primary',
				'value' => '#ff0000',
				'order' => 0,
			],
		];

		// Act
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'render_v4_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension, $variables );

		// Assert
		$this->assertStringContainsString( 'elementor-repeater-fields-readonly', $result );
		$this->assertStringContainsString( 'Primary', $result );
		$this->assertStringContainsString( '#ff0000', $result );
	}

	public function test_render_v4_variables__escapes_html() {
		// Arrange
		$variables = [
			[
				'id' => 'var-1',
				'label' => '<script>alert("xss")</script>',
				'value' => '#ff0000',
				'order' => 0,
			],
		];

		// Act
		$reflection = new \ReflectionClass( $this->extension );
		$method = $reflection->getMethod( 'render_v4_variables' );
		$method->setAccessible( true );
		$result = $method->invoke( $this->extension, $variables );

		// Assert
		$this->assertStringNotContainsString( '<script>', $result );
		$this->assertStringContainsString( '&lt;script&gt;', $result );
	}
}

