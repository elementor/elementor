<?php

namespace Elementor\Testing\Modules\Components\Variants;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../mocks/mock-pro-license-api.php';

class Test_Component_Variants_Meta extends Elementor_Test_Base {

	private string $original_atomic_widgets_experiment_state;
	private string $original_variants_experiment_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_atomic_widgets_experiment_state = Plugin::$instance->experiments
			->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$existing_variants_feature = Plugin::$instance->experiments->get_features( Components_Module::EXPERIMENT_VARIANTS_NAME );
		$this->original_variants_experiment_state = $existing_variants_feature['default'] ?? Experiments_Manager::STATE_INACTIVE;

		new Components_Module();

		Plugin::$instance->experiments->set_feature_default_state(
			Components_Module::EXPERIMENT_VARIANTS_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		// Re-instantiate so the constructor picks up the now-active variants experiment
		// and registers the `after_save` handler.
		new Components_Module();

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label'    => Component_Document::get_title(),
			'labels'   => Component_Document::get_labels(),
			'public'   => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		\Mock_Pro_License_API::set_license_state( true );
	}

	public function tearDown(): void {
		$components = get_posts( [
			'post_type'      => Component_Document::TYPE,
			'post_status'    => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			$this->original_atomic_widgets_experiment_state
		);

		Plugin::$instance->experiments->set_feature_default_state(
			Components_Module::EXPERIMENT_VARIANTS_NAME,
			$this->original_variants_experiment_state
		);

		parent::tearDown();
	}

	public function test_get_variants__returns_empty_when_meta_absent() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();

		// Act.
		$variants = $document->get_variants();

		// Assert.
		$this->assertEquals( [], $variants->variants );
	}

	public function test_update_variants__persists_valid_shape_and_round_trips() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();
		$data = $this->build_valid_variants();

		// Act.
		$result = $document->update_variants( $data );

		// Assert.
		$this->assertTrue( $result->is_valid(), $result->errors()->to_string() );

		$variants = $document->get_variants();
		$this->assertCount( 1, $variants->variants );
		$this->assertEquals( 'v_g8k3nq00', $variants->variants[0]->id );
		$this->assertEquals( 'Green', $variants->variants[0]->label );
		$this->assertArrayHasKey( 'e-button-123', $variants->variants[0]->widgets );
	}

	public function test_update_variants__returns_invalid_parse_result_without_writing_meta() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();
		$invalid = [
			'variants' => [
				[
					'id'    => 'v_g8k3nq00',
					'label' => 'Bad',
					'widgets' => [
						'e-button-123' => [
							'settings' => [ 'variant' => 'v_should_fa' ],
						],
					],
				],
			],
		];

		// Act.
		$result = $document->update_variants( $invalid );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( '', get_post_meta( $document->get_main_id(), Component_Document::VARIANTS_META_KEY, true ) );
	}

	public function test_variant_id_stable_across_rename_and_reorder() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();

		$document->update_variants( [
			'variants' => [
				[ 'id' => 'v_first000', 'label' => 'First', 'widgets' => [] ],
				[ 'id' => 'v_secondx0', 'label' => 'Second', 'widgets' => [] ],
			],
		] );

		// Act - rename first, swap order.
		$document->update_variants( [
			'variants' => [
				[ 'id' => 'v_secondx0', 'label' => 'Second Renamed', 'widgets' => [] ],
				[ 'id' => 'v_first000', 'label' => 'First Renamed', 'widgets' => [] ],
			],
		] );

		// Assert - ids preserved verbatim, labels updated.
		$variants = $document->get_variants();
		$this->assertEquals( 'v_secondx0', $variants->variants[0]->id );
		$this->assertEquals( 'Second Renamed', $variants->variants[0]->label );
		$this->assertEquals( 'v_first000', $variants->variants[1]->id );
		$this->assertEquals( 'First Renamed', $variants->variants[1]->label );
	}

	public function test_save_hook__persists_variants_from_document_save() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();

		// Act - save with variants in settings; the module `after_save` hook should persist them.
		$document->save( [
			'settings' => [
				'variants' => $this->build_valid_variants(),
			],
		] );

		// Assert.
		$variants = $document->get_variants();
		$this->assertCount( 1, $variants->variants );
		$this->assertEquals( 'v_g8k3nq00', $variants->variants[0]->id );
	}

	public function test_extract_class_ids_filter__contributes_variant_class_ids_for_component_post() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();
		$document->update_variants( $this->build_valid_variants() );

		// Act.
		$ids = apply_filters(
			'elementor/global_classes/extract_class_ids_from_post',
			[ 'g-existing' ],
			$document->get_main_id()
		);

		// Assert.
		$this->assertContains( 'g-existing', $ids );
		$this->assertContains( 'g_abc123', $ids );
	}

	public function test_extract_class_ids_filter__leaves_non_component_posts_untouched() {
		// Arrange.
		$this->act_as_admin();
		$page_id = $this->factory()->post->create( [ 'post_type' => 'page' ] );

		// Act.
		$ids = apply_filters(
			'elementor/global_classes/extract_class_ids_from_post',
			[ 'g-existing' ],
			$page_id
		);

		// Assert.
		$this->assertSame( [ 'g-existing' ], $ids );
	}

	public function test_publish_promotion__includes_variants_in_custom_meta_keys() {
		// Regression guard: the whitelist is what carries variants from autosave to main on publish.
		$this->assertContains(
			Component_Document::VARIANTS_META_KEY,
			Component_Document::COMPONENT_CUSTOM_META_KEYS
		);
	}

	public function test_get_variants__returns_autosave_version_when_exists() {
		// Arrange - published main has one variant, autosave has a different one.
		$this->act_as_admin();
		$document = $this->create_component();
		$main_id = $document->get_main_id();

		$published = $this->build_valid_variants();
		$autosave_variants = [
			'variants' => [
				[
					'id'    => 'v_autosav0',
					'label' => 'Autosave Only',
					'widgets' => [],
				],
			],
		];

		update_post_meta( $main_id, Component_Document::VARIANTS_META_KEY, wp_json_encode( $published ) );

		$autosave = $document->get_autosave( get_current_user_id(), true );
		$autosave_id = $autosave->get_post()->ID;

		$this->set_autosave_as_newer_than_main( $autosave_id );

		update_metadata( 'post', $autosave_id, Component_Document::VARIANTS_META_KEY, wp_json_encode( $autosave_variants ) );

		// Act - editor read path resolves autosave when it exists.
		$resolved = Plugin::$instance->documents->get_doc_or_auto_save( $main_id, get_current_user_id() );

		// Assert.
		$this->assertEquals( $autosave_id, $resolved->get_post()->ID );
		$variants = $resolved->get_variants();
		$this->assertCount( 1, $variants->variants );
		$this->assertEquals( 'v_autosav0', $variants->variants[0]->id );
	}

	public function test_publish__promotes_variants_from_autosave_to_main() {
		// Arrange - main has empty variants meta, autosave has real variants.
		$this->act_as_admin();
		$document = $this->create_component();
		$main_id = $document->get_main_id();

		update_post_meta( $main_id, Component_Document::VARIANTS_META_KEY, wp_json_encode( [] ) );

		$this->set_main_doc_as_older_than_autosave( $main_id );

		$document = Plugin::$instance->documents->get( $main_id, false );
		$autosave = $document->get_autosave( get_current_user_id(), true );
		$autosave_id = $autosave->get_post()->ID;

		$this->set_autosave_as_newer_than_main( $autosave_id );

		$autosave_variants = $this->build_valid_variants();
		update_metadata( 'post', $autosave_id, Component_Document::VARIANTS_META_KEY, wp_json_encode( $autosave_variants ) );

		// Act - publish flow copies whitelisted meta keys from autosave -> main.
		$repository = new \Elementor\Modules\Components\Components_Repository();
		$main_component = Plugin::$instance->documents->get( $main_id, false );
		$published = $repository->publish_component( $main_component );

		// Assert - variants are now on the main post.
		$this->assertTrue( $published );
		$refreshed_main = Plugin::$instance->documents->get( $main_id, false );
		$saved = $refreshed_main->get_json_meta( Component_Document::VARIANTS_META_KEY );
		$this->assertEquals( 'v_g8k3nq00', $saved['variants'][0]['id'] );
	}

	private function set_autosave_as_newer_than_main( int $autosave_id ): void {
		global $wpdb;
		$future_time = gmdate( 'Y-m-d H:i:s', strtotime( '+1 day' ) );
		$wpdb->update( $wpdb->posts, [ 'post_modified_gmt' => $future_time ], [ 'ID' => $autosave_id ] );
		clean_post_cache( $autosave_id );
	}

	private function set_main_doc_as_older_than_autosave( int $main_doc_id ): void {
		global $wpdb;
		$past_time = gmdate( 'Y-m-d H:i:s', strtotime( '-1 day' ) );
		$wpdb->update( $wpdb->posts, [ 'post_modified_gmt' => $past_time ], [ 'ID' => $main_doc_id ] );
		clean_post_cache( $main_doc_id );
	}

	private function create_component(): Component_Document {
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title'  => 'Test Component',
				'post_status' => 'publish',
			]
		);

		return $document;
	}

	private function build_valid_variants(): array {
		return [
			'variants' => [
				[
					'id'    => 'v_g8k3nq00',
					'label' => 'Green',
					'widgets' => [
						'e-button-123' => [
							'settings' => [ 'classes' => [ 'add' => [ 'g_abc123' ] ] ],
							'variant'  => 'v_btnsucc0',
						],
					],
				],
			],
		];
	}
}
