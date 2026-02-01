<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Template_Bundle extends Elementor_Test_Base {

	private function get_local_source(): Source_Local {
		return Plugin::instance()->templates_manager->get_source( 'local' );
	}

	public function test_export_embeds_only_used_global_classes() {
		// Arrange.
		$this->act_as_admin();

		$items = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'Used',
				'variants' => [],
			],
			'g-456' => [
				'id' => 'g-456',
				'type' => 'class',
				'label' => 'Unused',
				'variants' => [],
			],
		];

		Global_Classes_Repository::make()->put( $items, [ 'g-123', 'g-456' ] );

		$template_id = $this->get_local_source()->save_item( [
			'title' => 'Template With Classes',
			'type' => 'page',
			'content' => [
				[
					'id' => 'test',
					'elType' => 'widget',
					'widgetType' => 'heading',
					'settings' => [
						'classes' => [
							'$$type' => 'classes',
							'value' => [ 'g-123' ],
						],
					],
					'elements' => [],
				],
			],
			'page_settings' => [],
		] );

		$source = $this->get_local_source();
		$ref = new \ReflectionClass( $source );
		$method = $ref->getMethod( 'prepare_template_export' );
		$method->setAccessible( true );

		// Act.
		$file_data = $method->invoke( $source, $template_id );
		$decoded = json_decode( $file_data['content'], true );

		// Assert.
		$this->assertArrayHasKey( 'global_classes', $decoded );
		$this->assertArrayHasKey( 'items', $decoded['global_classes'] );
		$this->assertArrayHasKey( 'order', $decoded['global_classes'] );

		$this->assertArrayHasKey( 'g-123', $decoded['global_classes']['items'] );
		$this->assertArrayNotHasKey( 'g-456', $decoded['global_classes']['items'] );
		$this->assertSame( [ 'g-123' ], $decoded['global_classes']['order'] );
	}

	public function test_import_merges_global_classes_and_remaps_on_conflict() {
		// Arrange.
		$this->act_as_admin();

		// Existing class in site (same id and label).
		Global_Classes_Repository::make()->put( [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'Existing',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'display' => [
								'$$type' => 'string',
								'value' => 'block',
							],
						],
					],
				],
			],
		], [ 'g-123' ] );

		$template_json = [
			'content' => [
				[
					'id' => 'test',
					'elType' => 'widget',
					'widgetType' => 'heading',
					'settings' => [
						'classes' => [
							'$$type' => 'classes',
							'value' => [ 'g-123' ],
						],
					],
					'elements' => [],
				],
			],
			'page_settings' => [],
			'title' => 'Imported Template',
			'type' => 'page',
			'global_classes' => [
				'items' => [
					// Same id, different definition -> should duplicate with new id and remap.
					'g-123' => [
						'id' => 'g-123',
						'type' => 'class',
						'label' => 'Existing',
						'variants' => [],
					],
				],
				'order' => [ 'g-123' ],
			],
		];

		$tmp = wp_tempnam( 'elementor-template' );
		file_put_contents( $tmp, wp_json_encode( $template_json ) );

		// Act.
		$prepared = $this->get_local_source()->prepare_import_template_data( $tmp );
		unlink( $tmp );

		// Assert: content remapped away from g-123.
		$this->assertIsArray( $prepared );
		$this->assertIsArray( $prepared['content'] );
		$this->assertSame( 'g-123', $template_json['content'][0]['settings']['classes']['value'][0] );

		$current = Global_Classes_Repository::make()->all()->get();
		$current_ids = array_keys( $current['items'] ?? [] );

		$this->assertContains( 'g-123', $current_ids );
		$this->assertGreaterThanOrEqual( 2, count( $current_ids ) );

		$new_ids = array_values( array_diff( $current_ids, [ 'g-123' ] ) );
		$new_id = $new_ids[0];

		$this->assertSame( $new_id, $prepared['content'][0]['settings']['classes']['value'][0] );
		$this->assertStringStartsWith( 'g-', $new_id );
		$this->assertNotSame( 'g-123', $new_id );

		// The duplicated label should be auto-renamed.
		$this->assertSame( 'Existing', $current['items']['g-123']['label'] );
		$this->assertStringStartsWith( 'DUP_', $current['items'][ $new_id ]['label'] );
	}

	public function test_import_keep_flatten_does_not_add_global_classes_to_repository() {
		$this->act_as_admin();

		// Clear any existing global classes
		Global_Classes_Repository::make()->put( [], [] );

		$initial_classes = Global_Classes_Repository::make()->all()->get();
		$initial_count = count( $initial_classes['items'] ?? [] );

		$template_json = [
			'content' => [
				[
					'id' => '1a02b300',
					'elType' => 'container',
					'settings' => [],
					'elements' => [
						[
							'id' => '2819ab7c',
							'elType' => 'container',
							'isInner' => true,
							'settings' => [],
							'elements' => [
								[
									'id' => '66257faa',
									'elType' => 'widget',
									'widgetType' => 'e-heading',
									'isInner' => false,
									'settings' => [
										'classes' => [
											'$$type' => 'classes',
											'value' => [
												'g-7561cbe',
												'e-66257faa-0a6ca5b',
												'g-0c98828',
											],
										],
									],
									'elements' => [],
									'styles' => [
										'e-66257faa-0a6ca5b' => [
											'id' => 'e-66257faa-0a6ca5b',
											'label' => 'local',
											'type' => 'class',
											'variants' => [
												[
													'meta' => [
														'breakpoint' => 'desktop',
														'state' => null,
													],
													'props' => [
														'font-family' => [
															'$$type' => 'global-font-variable',
															'value' => 'e-gv-3c8270e',
														],
													],
													'custom_css' => null,
												],
											],
										],
									],
								],
								[
									'id' => '507ee1cf',
									'elType' => 'widget',
									'widgetType' => 'e-heading',
									'isInner' => false,
									'settings' => [
										'classes' => [
											'$$type' => 'classes',
											'value' => [
												'g-7561cbe',
												'g-0c98828',
											],
										],
									],
									'elements' => [],
									'styles' => [],
								],
							],
						],
					],
				],
			],
			'page_settings' => [],
			'title' => 'export testing',
			'type' => 'page',
			'global_classes' => [
				'items' => [
					'g-0c98828' => [
						'id' => 'g-0c98828',
						'type' => 'class',
						'label' => 'heading',
						'variants' => [
							[
								'meta' => [
									'breakpoint' => 'desktop',
									'state' => null,
								],
								'props' => [
									'font-family' => [
										'$$type' => 'global-font-variable',
										'value' => 'e-gv-3c8270e',
									],
									'font-weight' => [
										'$$type' => 'string',
										'value' => '700',
									],
									'text-align' => [
										'$$type' => 'string',
										'value' => 'center',
									],
									'background' => [
										'$$type' => 'background',
										'value' => [
											'color' => [
												'$$type' => 'global-color-variable',
												'value' => 'e-gv-29a8784',
											],
										],
									],
								],
								'custom_css' => null,
							],
						],
					],
				],
				'order' => [ 'g-0c98828' ],
			],
			'global_variables' => [
				'data' => [
					'e-gv-3c8270e' => [
						'type' => 'global-font-variable',
						'label' => 'heading-font',
						'value' => 'Verdana',
						'order' => 1,
					],
					'e-gv-29a8784' => [
						'type' => 'global-color-variable',
						'label' => 'red',
						'value' => '#f60707',
						'order' => 2,
					],
				],
				'watermark' => 0,
				'version' => 1,
			],
		];

		$tmp = wp_tempnam( 'elementor-template' );
		file_put_contents( $tmp, wp_json_encode( $template_json ) );

		$prepared = $this->get_local_source()->prepare_import_template_data( $tmp, 'keep_flatten' );
		unlink( $tmp );

		// Assert: NO global classes were added to the repository
		$final_classes = Global_Classes_Repository::make()->all()->get();
		$final_count = count( $final_classes['items'] ?? [] );
		$this->assertSame( $initial_count, $final_count, 'Global classes should NOT be added to repository in keep_flatten mode' );
		$this->assertArrayNotHasKey( 'g-0c98828', $final_classes['items'] ?? [], 'g-0c98828 should NOT be in the repository' );

		// Assert: All global class references are converted to local styles or removed
		$widgets = $prepared['content'][0]['elements'][0]['elements'];
		$first = $widgets[0];
		$second = $widgets[1];

		// First widget: g-7561cbe (not in snapshot) should be removed, g-0c98828 (in snapshot) should be flattened, local e-66257faa-0a6ca5b preserved
		$this->assertNotContains( 'g-0c98828', $first['settings']['classes']['value'], 'g-0c98828 should be flattened to local' );
		$this->assertNotContains( 'g-7561cbe', $first['settings']['classes']['value'], 'g-7561cbe (not in snapshot) should be removed' );
		$this->assertContains( 'e-66257faa-0a6ca5b', $first['settings']['classes']['value'], 'Existing local class should be preserved' );

		// All remaining class IDs should now start with 'e-' (local)
		foreach ( $first['settings']['classes']['value'] as $class_id ) {
			$this->assertStringStartsWith( 'e-', $class_id, "Class $class_id should be local (start with e-)" );
		}

		// Second widget: g-7561cbe (not in snapshot) should be removed, g-0c98828 should be flattened
		$this->assertNotContains( 'g-0c98828', $second['settings']['classes']['value'], 'g-0c98828 should be flattened' );
		$this->assertNotContains( 'g-7561cbe', $second['settings']['classes']['value'], 'g-7561cbe should be removed' );

		// All remaining class IDs should now start with 'e-' (local)
		foreach ( $second['settings']['classes']['value'] as $class_id ) {
			$this->assertStringStartsWith( 'e-', $class_id, "Class $class_id should be local (start with e-)" );
		}

		// Assert: Flattened global class has all the properties from the snapshot
		$flattened_ids = array_filter( $second['settings']['classes']['value'], fn( $id ) => str_contains( $id, '507ee1cf' ) );
		$this->assertNotEmpty( $flattened_ids, 'Should have a flattened local class for this element' );

		$flattened_id = array_values( $flattened_ids )[0];
		$this->assertArrayHasKey( $flattened_id, $second['styles'], 'Flattened class should be in styles' );

		$flattened_style = $second['styles'][ $flattened_id ];
		$this->assertSame( 'heading', $flattened_style['label'], 'Label should be preserved from global class' );
		$this->assertNotEmpty( $flattened_style['variants'], 'Variants should be preserved' );

		$props = $flattened_style['variants'][0]['props'];
		$this->assertArrayHasKey( 'font-weight', $props, 'font-weight prop should be preserved' );
		$this->assertArrayHasKey( 'text-align', $props, 'text-align prop should be preserved' );
		$this->assertArrayHasKey( 'background', $props, 'background prop should be preserved' );
	}

	public function test_import_keep_flatten_replaces_global_class_with_local_style_and_preserves_variants_props() {
		$this->act_as_admin();

		$template_json = [
			'content' => [
				[
					'id' => '1a02b300',
					'elType' => 'container',
					'settings' => [],
					'elements' => [
						[
							'id' => '2819ab7c',
							'elType' => 'container',
							'isInner' => true,
							'settings' => [],
							'elements' => [
								[
									'id' => '66257faa',
									'elType' => 'widget',
									'widgetType' => 'e-heading',
									'isInner' => false,
									'settings' => [
										'classes' => [
											'$$type' => 'classes',
											'value' => [
												'g-0c98828',
												'e-66257faa-0a6ca5b',
											],
										],
									],
									'elements' => [],
									'styles' => [
										'e-66257faa-0a6ca5b' => [
											'id' => 'e-66257faa-0a6ca5b',
											'label' => 'local',
											'type' => 'class',
											'variants' => [
												[
													'meta' => [
														'breakpoint' => 'desktop',
														'state' => null,
													],
													'props' => [
														'font-family' => [
															'$$type' => 'global-font-variable',
															'value' => 'e-gv-3c8270e',
														],
													],
													'custom_css' => null,
												],
											],
										],
									],
								],
								[
									'id' => '507ee1cf',
									'elType' => 'widget',
									'widgetType' => 'e-heading',
									'isInner' => false,
									'settings' => [
										'classes' => [
											'$$type' => 'classes',
											'value' => [
												'g-0c98828',
											],
										],
									],
									'elements' => [],
									'styles' => [],
								],
							],
						],
					],
				],
			],
			'page_settings' => [],
			'title' => 'export testing',
			'type' => 'page',
			'global_classes' => [
				'items' => [
					'g-0c98828' => [
						'id' => 'g-0c98828',
						'type' => 'class',
						'label' => 'heading',
						'variants' => [
							[
								'meta' => [
									'breakpoint' => 'desktop',
									'state' => null,
								],
								'props' => [
									'font-family' => [
										'$$type' => 'global-font-variable',
										'value' => 'e-gv-3c8270e',
									],
									'background' => [
										'$$type' => 'background',
										'value' => [
											'color' => [
												'$$type' => 'global-color-variable',
												'value' => 'e-gv-29a8784',
											],
										],
									],
								],
								'custom_css' => null,
							],
						],
					],
				],
				'order' => [ 'g-0c98828' ],
			],
		];

		$tmp = wp_tempnam( 'elementor-template' );
		file_put_contents( $tmp, wp_json_encode( $template_json ) );

		$prepared = $this->get_local_source()->prepare_import_template_data( $tmp, 'keep_flatten' );
		unlink( $tmp );

		$widgets = $prepared['content'][0]['elements'][0]['elements'];
		$first = $widgets[0];
		$second = $widgets[1];

		$this->assertNotContains( 'g-0c98828', $first['settings']['classes']['value'] );
		$this->assertContains( 'e-66257faa-0a6ca5b', $first['settings']['classes']['value'] );

		$new_first_ids = array_values( array_diff( $first['settings']['classes']['value'], [ 'e-66257faa-0a6ca5b' ] ) );
		$this->assertCount( 1, $new_first_ids );
		$new_first_id = $new_first_ids[0];

		$this->assertStringStartsWith( 'e-', $new_first_id );
		$this->assertArrayHasKey( $new_first_id, $first['styles'] );

		$flattened_first = $first['styles'][ $new_first_id ];
		$this->assertSame( 'class', $flattened_first['type'] );
		$this->assertSame( 'heading', $flattened_first['label'] );
		$this->assertNotEmpty( $flattened_first['variants'] );

		$props = $flattened_first['variants'][0]['props'];
		$this->assertArrayHasKey( 'font-family', $props );
		$this->assertArrayHasKey( 'background', $props );

		$this->assertNotContains( 'g-0c98828', $second['settings']['classes']['value'] );
		$this->assertCount( 1, $second['settings']['classes']['value'] );

		$new_second_id = $second['settings']['classes']['value'][0];
		$this->assertStringStartsWith( 'e-', $new_second_id );
		$this->assertArrayHasKey( $new_second_id, $second['styles'] );
	}
}

