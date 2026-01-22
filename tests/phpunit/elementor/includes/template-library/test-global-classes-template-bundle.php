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
		return Plugin::$instance->templates_manager->get_source( 'local' );
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
}

