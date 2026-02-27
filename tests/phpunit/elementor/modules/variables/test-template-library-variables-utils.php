<?php

namespace Elementor\Testing\Modules\Variables;

use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Modules\Variables\Utils\Template_Library_Variables_Element_Transformer;
use Elementor\Modules\Variables\Utils\Template_Library_Variables_Snapshot_Builder;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Template_Library_Variables_Utils extends Elementor_Test_Base {

	private function repository(): Variables_Repository {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		return new Variables_Repository( $kit );
	}

	private function seed_variables( array $data ): void {
		$collection = Variables_Collection::hydrate( [
			'data' => $data,
			'watermark' => 0,
			'version' => Variables_Collection::FORMAT_VERSION_V1,
		] );

		$this->repository()->save( $collection );
	}

	public function test_extract_used_variable_ids_from_elements_collects_from_settings_and_styles() {
		$elements = [
			[
				'id' => 'el-1',
				'elType' => 'widget',
				'settings' => [
					'text_color' => [
						'$$type' => Color_Variable_Prop_Type::get_key(),
						'value' => 'e-gv-1',
					],
					'typography' => [
						'font' => [
							'$$type' => Font_Variable_Prop_Type::get_key(),
							'value' => 'e-gv-2',
						],
					],
				],
				'styles' => [
					's-1' => [
						'props' => [
							'size' => [
								'$$type' => Size_Variable_Prop_Type::get_key(),
								'value' => 'e-gv-3',
							],
						],
					],
				],
				'elements' => [],
			],
		];

		$result = Template_Library_Variables_Snapshot_Builder::extract_used_variable_ids_from_elements( $elements );
		$expected = [ 'e-gv-1', 'e-gv-2', 'e-gv-3' ];
		sort( $result );
		sort( $expected );

		$this->assertSame( $expected, $result );
	}

	public function test_build_snapshot_for_ids_filters_data() {
		$this->act_as_admin();

		$this->seed_variables( [
			'e-gv-1' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'One',
				'value' => '#000000',
				'order' => 1,
			],
			'e-gv-2' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Two',
				'value' => '#111111',
				'order' => 2,
			],
		] );

		$snapshot = Template_Library_Variables_Snapshot_Builder::build_snapshot_for_ids( [ 'e-gv-2', 'missing', '' ] );

		$this->assertIsArray( $snapshot );
		$this->assertArrayHasKey( 'data', $snapshot );
		$this->assertArrayHasKey( 'e-gv-2', $snapshot['data'] );
		$this->assertArrayNotHasKey( 'e-gv-1', $snapshot['data'] );
		$this->assertSame( Variables_Collection::FORMAT_VERSION_V1, $snapshot['version'] );
	}

	public function test_merge_snapshot_and_get_id_map_remaps_conflict_and_updates_labels() {
		$this->act_as_admin();

		$this->seed_variables( [
			'e-gv-1' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Same',
				'value' => '#000000',
				'order' => 1,
			],
		] );

		$incoming = [
			'data' => [
				'e-gv-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Same',
					'value' => '#ffffff',
					'order' => 1,
				],
			],
		];

		$result = Template_Library_Variables_Snapshot_Builder::merge_snapshot_and_get_id_map( $incoming );

		$this->assertArrayHasKey( 'e-gv-1', $result['id_map'] );
		$new_id = $result['id_map']['e-gv-1'];
		$this->assertStringStartsWith( 'e-gv-', $new_id );
		$this->assertNotSame( 'e-gv-1', $new_id );

		$current = $this->repository()->load()->serialize();
		$this->assertArrayHasKey( $new_id, $current['data'] );
		$this->assertStringStartsWith( Template_Library_Import_Export_Utils::LABEL_PREFIX, $current['data'][ $new_id ]['label'] );
	}

	public function test_merge_snapshot_matches_by_name_and_maps_id_when_content_equal() {
		$this->act_as_admin();

		$this->seed_variables( [
			'e-gv-existing' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Brand',
				'value' => '#ff0000',
				'order' => 1,
			],
		] );

		$incoming = [
			'data' => [
				'e-gv-remote' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Brand',
					'value' => '#ff0000',
					'order' => 1,
				],
			],
		];

		$result = Template_Library_Variables_Snapshot_Builder::merge_snapshot_and_get_id_map( $incoming );

		$this->assertArrayHasKey( 'e-gv-remote', $result['id_map'] );
		$this->assertSame( 'e-gv-existing', $result['id_map']['e-gv-remote'] );

		$current = $this->repository()->load()->serialize();
		$active_count = 0;
		foreach ( $current['data'] as $item ) {
			if ( empty( $item['deleted'] ) ) {
				++$active_count;
			}
		}
		$this->assertSame( 1, $active_count );
	}

	public function test_merge_snapshot_creates_new_when_no_name_match() {
		$this->act_as_admin();

		$this->seed_variables( [
			'e-gv-1' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Existing',
				'value' => '#000000',
				'order' => 1,
			],
		] );

		$incoming = [
			'data' => [
				'e-gv-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'BrandNew',
					'value' => '#ffffff',
					'order' => 1,
				],
			],
		];

		$result = Template_Library_Variables_Snapshot_Builder::merge_snapshot_and_get_id_map( $incoming );

		$this->assertEmpty( $result['id_map'] );

		$current = $this->repository()->load()->serialize();
		$this->assertArrayHasKey( 'e-gv-2', $current['data'] );
	}

	public function test_rewrite_elements_variable_ids_updates_nested_values() {
		$elements = [
			[
				'id' => 'el-1',
				'elType' => 'widget',
				'settings' => [
					'text_color' => [
						'$$type' => Color_Variable_Prop_Type::get_key(),
						'value' => 'e-gv-1',
					],
					'typography' => [
						'font' => [
							'$$type' => Font_Variable_Prop_Type::get_key(),
							'value' => 'e-gv-2',
						],
					],
				],
				'styles' => [
					's-1' => [
						'props' => [
							'size' => [
								'$$type' => Size_Variable_Prop_Type::get_key(),
								'value' => 'e-gv-1',
							],
						],
					],
				],
				'elements' => [],
			],
		];

		$result = Template_Library_Variables_Element_Transformer::rewrite_elements_variable_ids( $elements, [ 'e-gv-1' => 'e-gv-9' ] );

		$this->assertSame( 'e-gv-9', $result[0]['settings']['text_color']['value'] );
		$this->assertSame( 'e-gv-2', $result[0]['settings']['typography']['font']['value'] );
		$this->assertSame( 'e-gv-9', $result[0]['styles']['s-1']['props']['size']['value'] );
	}

	public function test_flatten_elements_variables_resolves_matching_ids() {
		$elements = [
			[
				'id' => 'el-1',
				'elType' => 'widget',
				'settings' => [
					'text_color' => [
						'$$type' => Color_Variable_Prop_Type::get_key(),
						'value' => 'e-gv-1',
					],
					'padding' => [
						'$$type' => Size_Variable_Prop_Type::get_key(),
						'value' => 'e-gv-2',
					],
				],
				'styles' => [],
				'elements' => [],
			],
		];

		$global_variables = [
			'data' => [
				'e-gv-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#123456',
					'order' => 1,
				],
				'e-gv-2' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size',
					'value' => '16px',
					'order' => 2,
				],
			],
		];

		$result = Template_Library_Variables_Element_Transformer::flatten_elements_variables( $elements, $global_variables, [ 'e-gv-1' ] );

		$this->assertSame( 'color', $result[0]['settings']['text_color']['$$type'] );
		$this->assertSame( '#123456', $result[0]['settings']['text_color']['value'] );
		$this->assertSame( Size_Variable_Prop_Type::get_key(), $result[0]['settings']['padding']['$$type'] );
		$this->assertSame( 'e-gv-2', $result[0]['settings']['padding']['value'] );
	}
}
