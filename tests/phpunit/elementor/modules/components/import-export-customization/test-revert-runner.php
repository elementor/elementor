<?php

namespace Elementor\Testing\Modules\Components\ImportExportCustomization;

use Elementor\App\Modules\ImportExportCustomization\Module as Import_Export_Module;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Revert as Revert_Runner;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Revert_Runner extends Elementor_Test_Base {
	const SESSION_ID = 'reverted-session';
	const OTHER_SESSION_ID = 'other-session';

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );
	}

	public function tearDown(): void {
		$components = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}

		parent::tearDown();
	}

	public function test_should_revert__requires_components_runner_in_session() {
		// Arrange
		$runner = new Revert_Runner();

		// Act
		$with_runner = $runner->should_revert( [ 'runners' => [ 'components' => [] ] ] );
		$without_runner = $runner->should_revert( [ 'runners' => [ 'elementor-content' => [] ] ] );

		// Assert
		$this->assertTrue( $with_runner );
		$this->assertFalse( $without_runner );
	}

	public function test_revert__deletes_only_components_from_the_session() {
		// Arrange
		$reverted_id = $this->create_component_with_session( self::SESSION_ID );
		$kept_id = $this->create_component_with_session( self::OTHER_SESSION_ID );

		// Act
		( new Revert_Runner() )->revert( [ 'session_id' => self::SESSION_ID ] );

		// Assert
		$this->assertNull( get_post( $reverted_id ) );
		$this->assertNotNull( get_post( $kept_id ) );
	}

	private function create_component_with_session( string $session_id ): int {
		$document = Plugin::$instance->documents->create(
			Component_Document::TYPE,
			[
				'post_title' => 'Component ' . $session_id,
				'post_status' => 'publish',
			]
		);

		update_post_meta( $document->get_main_id(), Import_Export_Module::META_KEY_ELEMENTOR_IMPORT_SESSION_ID, $session_id );

		return $document->get_main_id();
	}
}
