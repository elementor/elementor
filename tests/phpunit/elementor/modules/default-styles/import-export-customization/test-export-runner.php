<?php

namespace Elementor\Testing\Modules\DefaultStyles\ImportExportCustomization;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\DefaultStyles\Default_Style_Post_Type;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\DefaultStyles\ImportExportCustomization\Runners\Export as Export_Runner;
use Elementor\Modules\DefaultStyles\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Export_Runner extends Elementor_Test_Base {
	private string $original_atomic_widgets_experiment_state;
	private string $original_default_styles_experiment_state;

	public function setUp(): void {
		parent::setUp();

		Default_Style_Post_Type::ensure_registered();

		$this->original_atomic_widgets_experiment_state = Plugin::$instance->experiments
			->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )['default'];
		$this->original_default_styles_experiment_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		$this->reset_default_styles_state();
	}

	public function tearDown(): void {
		$this->reset_default_styles_state();

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			$this->original_atomic_widgets_experiment_state
		);
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_default_styles_experiment_state
		);

		parent::tearDown();
	}

	public function test_should_export__requires_settings_include_and_experiments() {
		$runner = new Export_Runner();
		$export_data = [ 'include' => [ 'settings' ] ];

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		$this->assertFalse( $runner->should_export( $export_data ) );

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$this->assertTrue( $runner->should_export( $export_data ) );
		$this->assertFalse( $runner->should_export( [ 'include' => [ 'templates' ] ] ) );
	}

	public function test_export() {
		$repository = Default_Styles_Repository::make();

		$repository->put( 'h1', [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => [
						'color' => [
							'$$type' => 'color',
							'value' => 'red',
						],
					],
				],
			],
		] );

		$repository->put( 'h2', [
			'type' => 'class',
			'variants' => [],
		] );

		$result = ( new Export_Runner() )->export( [] );

		$this->assertSame( [], $result['manifest'] );
		$this->assertCount( 2, $result['files'] );

		$files_by_path = $this->index_files_by_path( $result['files'] );

		$this->assertEqualsCanonicalizing(
			[
				'default-styles/h1.json',
				'default-styles/h2.json',
			],
			array_keys( $files_by_path )
		);

		$h1_data = json_decode( $files_by_path['default-styles/h1.json'], true );
		$this->assertSame( 'h1', $h1_data['id'] );
		$this->assertSame( 'e-default-h1', $h1_data['cssName'] );
		$this->assertCount( 1, $h1_data['variants'] );

		$h2_data = json_decode( $files_by_path['default-styles/h2.json'], true );
		$this->assertSame( 'h2', $h2_data['id'] );
		$this->assertSame( [], $h2_data['variants'] );
	}

	public function test_export__no_styles() {
		$result = ( new Export_Runner() )->export( [] );

		$this->assertSame( [
			'manifest' => [],
			'files' => [],
		], $result );
	}

	private function index_files_by_path( array $files ): array {
		$indexed = [];

		foreach ( $files as $file ) {
			$indexed[ $file['path'] ] = $file['data'];
		}

		return $indexed;
	}

	private function reset_default_styles_state(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( \Elementor\Modules\DefaultStyles\Default_Styles_Tag_Post_IDs::META_KEY );
		}

		$post_ids = get_posts( [
			'post_type' => Default_Style_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );

		foreach ( $post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}
	}
}
