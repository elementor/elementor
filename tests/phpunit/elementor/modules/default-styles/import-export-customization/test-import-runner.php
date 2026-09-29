<?php

namespace Elementor\Testing\Modules\DefaultStyles\ImportExportCustomization;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\DefaultStyles\Default_Style_Post_Type;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\DefaultStyles\ImportExportCustomization\Runners\Import as Import_Runner;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Import_Runner extends Elementor_Test_Base {
	private string $original_atomic_widgets_experiment_state;

	public function setUp(): void {
		parent::setUp();

		Default_Style_Post_Type::ensure_registered();

		$this->original_atomic_widgets_experiment_state = Plugin::$instance->experiments
			->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )['default'];

		$this->reset_default_styles_state();
	}

	public function tearDown(): void {
		$this->reset_default_styles_state();

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			$this->original_atomic_widgets_experiment_state
		);

		parent::tearDown();
	}

	public function test_should_import__requires_include_context_and_atomic_widgets() {
		$runner = new Import_Runner();
		$import_data = [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks',
		];

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		$this->assertFalse( $runner->should_import( $import_data ) );

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$this->assertTrue( $runner->should_import( $import_data ) );
		$this->assertFalse( $runner->should_import( [
			'include' => [ 'templates' ],
			'extracted_directory_path' => __DIR__ . '/mocks',
		] ) );
	}

	public function test_import() {
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks',
		], [] );

		$this->assertCount( 2, $result['created'] );
		$this->assertEmpty( $result['replaced'] );
		$this->assertEmpty( $result['skipped'] );
		$this->assertSame( [ [ 'tag' => 'script' ] ], $result['failed'] );

		$repository = Default_Styles_Repository::make();
		$h1 = $repository->get( 'h1' );
		$h2 = $repository->get( 'h2' );

		$this->assertNotNull( $h1 );
		$this->assertNotNull( $h2 );
		$this->assertSame( 'blue', $h1['variants'][0]['props']['color']['value'] );
		$this->assertSame( [], $h2['variants'] );
		$this->assertNull( $repository->get( 'script' ) );
	}

	public function test_import__replaces_existing_tag() {
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

		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks',
		], [] );

		$this->assertSame( [ [ 'tag' => 'h1' ] ], $result['replaced'] );

		$h1 = $repository->get( 'h1' );

		$this->assertSame( 'blue', $h1['variants'][0]['props']['color']['value'] );
	}

	public function test_import__skips_existing_tag_for_keep_conflict_resolution() {
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

		$result = ( new Import_Runner() )->import( [
			'include' => [ 'design-system' ],
			'extracted_directory_path' => __DIR__ . '/mocks',
			'customization' => [
				'design-system' => [
					'conflict_resolution' => 'skip',
				],
			],
		], [] );

		$this->assertSame( [ [ 'tag' => 'h1' ] ], $result['skipped'] );
		$this->assertCount( 1, $result['created'] );
		$this->assertSame( [ [ 'tag' => 'script' ] ], $result['failed'] );

		$h1 = $repository->get( 'h1' );
		$h2 = $repository->get( 'h2' );

		$this->assertSame( 'red', $h1['variants'][0]['props']['color']['value'] );
		$this->assertNotNull( $h2 );
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
