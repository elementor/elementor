<?php
namespace Elementor\Testing\Includes\TemplateLibrary;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Variables_Template_Bundle extends Elementor_Test_Base {

	private function get_local_source(): Source_Local {
		return Plugin::instance()->templates_manager->get_source( 'local' );
	}

	private function get_repository(): Variables_Repository {
		$kit = Plugin::instance()->kits_manager->get_active_kit();
		return new Variables_Repository( $kit );
	}

	private function seed_variables( array $data ): void {
		$collection = Variables_Collection::hydrate( [
			'data' => $data,
			'watermark' => 0,
			'version' => 1,
		] );

		$this->get_repository()->save( $collection );
	}

	public function test_export_embeds_only_used_global_variables() {
		$this->act_as_admin();

		$this->seed_variables( [
			'e-gv-123' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Used',
				'value' => '#ff0000',
				'order' => 1,
			],
			'e-gv-456' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Unused',
				'value' => '#00ff00',
				'order' => 2,
			],
		] );

		$template_id = $this->get_local_source()->save_item( [
			'title' => 'Template With Variables',
			'type' => 'page',
			'content' => [
				[
					'id' => 'test',
					'elType' => 'widget',
					'widgetType' => 'heading',
					'settings' => [
						'text_color' => [
							'$$type' => Color_Variable_Prop_Type::get_key(),
							'value' => 'e-gv-123',
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

		$file_data = $method->invoke( $source, $template_id );
		$decoded = json_decode( $file_data['content'], true );

		$this->assertArrayHasKey( 'global_variables', $decoded );
		$this->assertArrayHasKey( 'data', $decoded['global_variables'] );

		$this->assertArrayHasKey( 'e-gv-123', $decoded['global_variables']['data'] );
		$this->assertArrayNotHasKey( 'e-gv-456', $decoded['global_variables']['data'] );
	}

	public function test_import_match_site_remaps_variables_on_conflict() {
		$this->act_as_admin();

		$this->seed_variables( [
			'e-gv-123' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Existing',
				'value' => '#000000',
				'order' => 1,
			],
		] );

		$template_json = [
			'content' => [
				[
					'id' => 'test',
					'elType' => 'widget',
					'widgetType' => 'heading',
					'settings' => [
						'text_color' => [
							'$$type' => Color_Variable_Prop_Type::get_key(),
							'value' => 'e-gv-123',
						],
					],
					'elements' => [],
				],
			],
			'page_settings' => [],
			'title' => 'Imported Template',
			'type' => 'page',
			'global_variables' => [
				'data' => [
					'e-gv-123' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Existing',
						'value' => '#ffffff',
						'order' => 1,
					],
				],
				'watermark' => 0,
				'version' => 1,
			],
		];

		$tmp = wp_tempnam( 'elementor-template' );
		file_put_contents( $tmp, wp_json_encode( $template_json ) );

		$prepared = $this->get_local_source()->prepare_import_template_data( $tmp, 'match_site' );
		unlink( $tmp );

		$this->assertIsArray( $prepared );
		$this->assertIsArray( $prepared['content'] );

		$new_id = $prepared['content'][0]['settings']['text_color']['value'];
		$this->assertNotSame( 'e-gv-123', $new_id );
		$this->assertStringStartsWith( 'e-gv-', $new_id );

		$current = $this->get_repository()->load()->serialize();
		$current_ids = array_keys( $current['data'] ?? [] );

		$this->assertContains( 'e-gv-123', $current_ids );
		$this->assertContains( $new_id, $current_ids );
		$this->assertStringStartsWith( 'DUP_', $current['data'][ $new_id ]['label'] );
	}

	public function test_import_keep_flatten_resolves_variable_refs() {
		$this->act_as_admin();

		$template_json = [
			'content' => [
				[
					'id' => 'test',
					'elType' => 'widget',
					'widgetType' => 'heading',
					'settings' => [
						'text_color' => [
							'$$type' => Color_Variable_Prop_Type::get_key(),
							'value' => 'e-gv-123',
						],
					],
					'elements' => [],
				],
			],
			'page_settings' => [],
			'title' => 'Imported Template',
			'type' => 'page',
			'global_variables' => [
				'data' => [
					'e-gv-123' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Color',
						'value' => '#123456',
						'order' => 1,
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

		$this->assertSame( 'color', $prepared['content'][0]['settings']['text_color']['$$type'] );
		$this->assertSame( '#123456', $prepared['content'][0]['settings']['text_color']['value'] );
	}

	public function test_import_keep_create_creates_new_variables_and_remaps_content() {
		$this->act_as_admin();

		$template_json = [
			'content' => [
				[
					'id' => 'test',
					'elType' => 'widget',
					'widgetType' => 'heading',
					'settings' => [
						'text_color' => [
							'$$type' => Color_Variable_Prop_Type::get_key(),
							'value' => 'e-gv-123',
						],
					],
					'elements' => [],
				],
			],
			'page_settings' => [],
			'title' => 'Imported Template',
			'type' => 'page',
			'global_variables' => [
				'data' => [
					'e-gv-123' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Color',
						'value' => '#123456',
						'order' => 1,
					],
				],
				'watermark' => 0,
				'version' => 1,
			],
		];

		$tmp = wp_tempnam( 'elementor-template' );
		file_put_contents( $tmp, wp_json_encode( $template_json ) );

		$prepared = $this->get_local_source()->prepare_import_template_data( $tmp, 'keep_create' );
		unlink( $tmp );

		$new_id = $prepared['content'][0]['settings']['text_color']['value'];
		$this->assertNotSame( 'e-gv-123', $new_id );
		$this->assertStringStartsWith( 'e-gv-', $new_id );

		$current = $this->get_repository()->load()->serialize();
		$current_ids = array_keys( $current['data'] ?? [] );
		$this->assertContains( $new_id, $current_ids );
	}
}

