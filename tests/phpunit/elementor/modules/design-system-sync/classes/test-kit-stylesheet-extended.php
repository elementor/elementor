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
		Classes_Provider::clear_cache();
		$this->clear_kit_variables();
		$this->clear_kit_classes();
	}

	public function tearDown(): void {
		Variables_Provider::clear_cache();
		Classes_Provider::clear_cache();
		$this->clear_kit_variables();
		$this->clear_kit_classes();

		parent::tearDown();
	}

	private function clear_kit_variables() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( '_elementor_global_variables' );
		}
	}

	private function clear_kit_classes() {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( '_elementor_global_classes' );
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

	public function test_add_v3_mapping_css__does_not_add_css_when_no_synced_classes() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$classes_data = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'Heading',
					'sync_to_v3' => false,
					'variants' => [],
				],
			],
			'order' => [ 'g-1' ],
		];
		$kit->update_json_meta( '_elementor_global_classes', $classes_data );
		Classes_Provider::clear_cache();

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->expects( $this->never() )->method( 'get_stylesheet' );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__generates_v3_mapping_for_synced_class() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$classes_data = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'Heading',
					'sync_to_v3' => true,
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'font-size' => [
									'$$type' => 'size',
									'value' => [
										'size' => 24,
										'unit' => 'px',
									],
								],
								'font-weight' => [
									'$$type' => 'string',
									'value' => '700',
								],
							],
						],
					],
				],
			],
			'order' => [ 'g-1' ],
		];
		$kit->update_json_meta( '_elementor_global_classes', $classes_data );
		Classes_Provider::clear_cache();

		$stylesheet = $this->createMock( \Elementor\Stylesheet::class );
		$stylesheet->expects( $this->once() )
			->method( 'add_raw_css' )
			->with( $this->logicalAnd(
				$this->stringContains( '--e-global-typography-v4-Heading-font-size:' ),
				$this->stringContains( '--e-global-typography-v4-Heading-font-weight:' )
			) );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->method( 'get_stylesheet' )->willReturn( $stylesheet );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__skips_non_synced_classes() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$classes_data = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'NotSynced',
					'sync_to_v3' => false,
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'font-size' => [
									'$$type' => 'size',
									'value' => [
										'size' => 24,
										'unit' => 'px',
									],
								],
							],
						],
					],
				],
				'g-2' => [
					'id' => 'g-2',
					'type' => 'class',
					'label' => 'Synced',
					'sync_to_v3' => true,
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'font-size' => [
									'$$type' => 'size',
									'value' => [
										'size' => 16,
										'unit' => 'px',
									],
								],
							],
						],
					],
				],
		],
		'order' => [ 'g-1', 'g-2' ],
	];

	$kit->update_json_meta( '_elementor_global_classes', $classes_data );
	Classes_Provider::clear_cache();

	$stylesheet = $this->createMock( \Elementor\Stylesheet::class );
	$stylesheet->expects( $this->once() )
		->method( 'add_raw_css' )
		->with( $this->logicalAnd(
			$this->stringContains( '--e-global-typography-v4-Synced-font-size:' ),
			$this->logicalNot( $this->stringContains( 'NotSynced' ) )
			) );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->method( 'get_stylesheet' )->willReturn( $stylesheet );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__only_processes_desktop_normal_variant() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$classes_data = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'Heading',
					'sync_to_v3' => true,
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'font-size' => [
									'$$type' => 'size',
									'value' => [
										'size' => 24,
										'unit' => 'px',
									],
								],
							],
						],
						[
							'meta' => [
								'breakpoint' => 'mobile',
								'state' => null,
							],
							'props' => [
								'font-size' => [
									'$$type' => 'size',
									'value' => [
										'size' => 16,
										'unit' => 'px',
									],
								],
							],
						],
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => 'hover',
							],
							'props' => [
								'font-size' => [
									'$$type' => 'size',
									'value' => [
										'size' => 32,
										'unit' => 'px',
									],
								],
							],
						],
					],
				],
		],
		'order' => [ 'g-1' ],
	];

	$kit->update_json_meta( '_elementor_global_classes', $classes_data );
	Classes_Provider::clear_cache();

	$stylesheet = $this->createMock( \Elementor\Stylesheet::class );
	$stylesheet->expects( $this->once() )
		->method( 'add_raw_css' )
		->with( $this->stringContains( '--e-global-typography-v4-Heading-font-size:' ) );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->method( 'get_stylesheet' )->willReturn( $stylesheet );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__handles_all_typography_properties() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$classes_data = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'RichText',
					'sync_to_v3' => true,
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'font-family' => [
									'$$type' => 'string',
									'value' => 'Roboto',
								],
								'font-size' => [
									'$$type' => 'size',
									'value' => [
										'size' => 18,
										'unit' => 'px',
									],
								],
								'font-weight' => [
									'$$type' => 'string',
									'value' => '600',
								],
								'font-style' => [
									'$$type' => 'string',
									'value' => 'italic',
								],
								'text-decoration' => [
									'$$type' => 'string',
									'value' => 'underline',
								],
								'line-height' => [
									'$$type' => 'size',
									'value' => [
										'size' => 1.5,
										'unit' => '',
									],
								],
								'letter-spacing' => [
									'$$type' => 'size',
									'value' => [
										'size' => 0.5,
										'unit' => 'px',
									],
								],
								'word-spacing' => [
									'$$type' => 'size',
									'value' => [
										'size' => 2,
										'unit' => 'px',
									],
								],
								'text-transform' => [
									'$$type' => 'string',
									'value' => 'uppercase',
								],
							],
						],
					],
				],
		],
		'order' => [ 'g-1' ],
	];

	$kit->update_json_meta( '_elementor_global_classes', $classes_data );
	Classes_Provider::clear_cache();

	$stylesheet = $this->createMock( \Elementor\Stylesheet::class );
	$stylesheet->expects( $this->once() )
		->method( 'add_raw_css' )
		->with( $this->logicalAnd(
			$this->stringContains( '--e-global-typography-v4-RichText-font-family:' ),
			$this->stringContains( '--e-global-typography-v4-RichText-font-size:' ),
				$this->stringContains( '--e-global-typography-v4-RichText-font-weight:' ),
				$this->stringContains( '--e-global-typography-v4-RichText-font-style:' ),
				$this->stringContains( '--e-global-typography-v4-RichText-text-decoration:' ),
				$this->stringContains( '--e-global-typography-v4-RichText-line-height:' ),
				$this->stringContains( '--e-global-typography-v4-RichText-letter-spacing:' ),
				$this->stringContains( '--e-global-typography-v4-RichText-word-spacing:' ),
				$this->stringContains( '--e-global-typography-v4-RichText-text-transform:' )
			) );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->method( 'get_stylesheet' )->willReturn( $stylesheet );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}

	public function test_add_v3_mapping_css__combines_variables_and_classes() {
		// Arrange
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$variables_data = [
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
		$kit->update_json_meta( '_elementor_global_variables', $variables_data );

		$classes_data = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'type' => 'class',
					'label' => 'Heading',
					'sync_to_v3' => true,
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'font-size' => [
									'$$type' => 'size',
									'value' => [
										'size' => 24,
										'unit' => 'px',
									],
								],
							],
						],
					],
				],
			],
			'order' => [ 'g-1' ],
		];
		$kit->update_json_meta( '_elementor_global_classes', $classes_data );
		Classes_Provider::clear_cache();

		$stylesheet = $this->createMock( \Elementor\Stylesheet::class );
		$stylesheet->expects( $this->once() )
			->method( 'add_raw_css' )
			->with( $this->logicalAnd(
				$this->stringContains( '--e-global-color-v4-Primary:var(--Primary);' ),
				$this->stringContains( '--e-global-typography-v4-Heading-font-size:' )
			) );

		$post_css = $this->createMock( \Elementor\Core\Files\CSS\Post::class );
		$post_css->method( 'get_post_id' )->willReturn( $kit_id );
		$post_css->method( 'get_stylesheet' )->willReturn( $stylesheet );

		// Act
		$this->handler->add_v3_mapping_css( $post_css );

		// Assert - expectations verified by mock
	}
}

