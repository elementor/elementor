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
class Test_Kit_Stylesheet_Extended extends Elementor_Test_Base {
	private $handler;

	public function setUp(): void {
		parent::setUp();

		$this->handler = new Kit_Stylesheet_Extended();
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

	public function test_add_v3_mapping_css__does_not_add_css_when_not_kit() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$post_id = $this->factory()->post->create();

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

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $post_id );
		$post_css->expects( $this->never() )->method( 'get_stylesheet' );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__does_not_add_css_when_no_variables() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$db_record = [
			'data' => [],
			'watermark' => 0,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->expects( $this->never() )->method( 'get_stylesheet' );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__generates_v3_mapping_for_color_variable() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

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

		$stylesheet = $this->createMock( \Elementor\Stylesheet::class );
		$stylesheet->expects( $this->once() )
			->method( 'add_raw_css' )
			->with( ':root { --e-global-color-v4-Primary:var(--Primary); }' );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->method( 'get_stylesheet' )->willReturn( $stylesheet );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__generates_v3_mapping_for_multiple_variables() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

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
					'sync_to_v3' => true,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		$stylesheet = $this->createMock( \Elementor\Stylesheet::class );
		$stylesheet->expects( $this->once() )
			->method( 'add_raw_css' )
			->with( ':root { --e-global-color-v4-Primary:var(--Primary); --e-global-color-v4-Secondary:var(--Secondary); }' );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->method( 'get_stylesheet' )->willReturn( $stylesheet );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__skips_variables_with_empty_label() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$db_record = [
			'data' => [
				'var-1' => [
					'type' => 'global-color-variable',
					'label' => '',
					'value' => [
						'$$type' => 'color',
						'value' => '#ff0000',
					],
					'sync_to_v3' => true,
				],
				'var-2' => [
					'type' => 'global-color-variable',
					'label' => 'Valid',
					'value' => [
						'$$type' => 'color',
						'value' => '#00ff00',
					],
					'sync_to_v3' => true,
				],
			],
			'watermark' => 1,
		];
		$kit->update_json_meta( '_elementor_global_variables', $db_record );

		$stylesheet = $this->createMock( \Elementor\Stylesheet::class );
		$stylesheet->expects( $this->once() )
			->method( 'add_raw_css' )
			->with( ':root { --e-global-color-v4-Valid:var(--Valid); }' );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->method( 'get_stylesheet' )->willReturn( $stylesheet );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__sanitizes_malicious_labels() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$db_record = [
			'data' => [
				'var-1' => [
					'type' => 'global-color-variable',
					'label' => '<script>alert("xss")</script>',
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

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->expects( $this->never() )->method( 'get_stylesheet' );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}
}
