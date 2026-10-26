<?php

namespace Elementor\Testing\Modules\Components;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Module as Components_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Export_Metadata extends Elementor_Test_Base {

	private string $original_atomic_widgets_experiment_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_atomic_widgets_experiment_state = Plugin::$instance->experiments
			->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

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

		parent::tearDown();
	}

	public function test_get_export_data__includes_whitelisted_private_meta() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();
		$overridable_props = [
			'props' => [],
			'groups' => [
				'items' => [],
				'order' => [],
			],
		];

		$document->update_meta( Component_Document::COMPONENT_UID_META_KEY, 'test-uid-123' );
		$document->update_json_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY, $overridable_props );

		// Act.
		$metadata = $document->get_export_data()['metadata'];

		// Assert.
		$this->assertSame( 'test-uid-123', $metadata[ Component_Document::COMPONENT_UID_META_KEY ] );
		$this->assertSame( $overridable_props, $metadata[ Component_Document::OVERRIDABLE_PROPS_META_KEY ] );
	}

	public function test_get_export_data__excludes_non_whitelisted_private_meta() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();

		$document->update_json_meta( Component_Document::VARIANTS_META_KEY, [ 'variants' => [] ] );
		$document->update_json_meta( Component_Document::ARCHIVED_META_KEY, [ 'is_archived' => true ] );

		// Act.
		$metadata = $document->get_export_data()['metadata'];

		// Assert.
		$this->assertArrayNotHasKey( Component_Document::VARIANTS_META_KEY, $metadata );
		$this->assertArrayNotHasKey( Component_Document::ARCHIVED_META_KEY, $metadata );
		$this->assertArrayNotHasKey( '_elementor_data', $metadata );
	}

	public function test_get_export_data__omits_whitelisted_meta_when_absent() {
		// Arrange.
		$this->act_as_admin();
		$document = $this->create_component();

		// Act.
		$metadata = $document->get_export_data()['metadata'];

		// Assert.
		$this->assertArrayNotHasKey( Component_Document::COMPONENT_UID_META_KEY, $metadata );
		$this->assertArrayNotHasKey( Component_Document::OVERRIDABLE_PROPS_META_KEY, $metadata );
	}

	private function create_component(): Component_Document {
		return Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title'  => 'Test Component',
				'post_status' => 'publish',
			]
		);
	}
}
