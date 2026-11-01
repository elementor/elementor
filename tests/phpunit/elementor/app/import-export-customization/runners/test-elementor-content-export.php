<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Elementor_Content;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Elementor_Content_Export extends Elementor_Test_Base {
	private bool $registered_component_post_type = false;

	private bool $added_component_elementor_support = false;

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		$this->ensure_component_post_type_supports_elementor();
	}

	public function tearDown(): void {
		if ( $this->registered_component_post_type ) {
			unregister_post_type( Component_Document::TYPE );
		} elseif ( $this->added_component_elementor_support ) {
			remove_post_type_support( Component_Document::TYPE, 'elementor' );
		}

		parent::tearDown();
	}

	public function test_export__always_excludes_components_from_elementor_content_runner() {
		// Arrange
		$runner = new Elementor_Content();
		$component_id = $this->factory()->post->create( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'publish',
		] );

		update_post_meta( $component_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $component_id, '_elementor_data', '[{"id":"component-root","elType":"container","elements":[],"settings":[]}]' );

		// Act
		$result = $runner->export( [ 'include' => [ 'content' ] ] );
		$exported_post_types = $this->get_exported_post_types( $result );
		$exported_paths = $this->get_exported_paths( $result );

		// Assert
		$this->assertNotContains( Component_Document::TYPE, $exported_post_types );
		$this->assertNotContains( 'content/' . Component_Document::TYPE . '/' . $component_id, $exported_paths );
		$this->assertNotContains( 'content/' . Component_Document::TYPE . '/dependencies', $exported_paths );
		$this->assertContains( 'page', $exported_post_types );
	}

	public function test_export__excludes_post_when_not_in_selected_custom_post_types() {
		// Arrange
		$runner = new Elementor_Content();

		// Act
		$exported_post_types = $this->get_exported_post_types( $runner->export( [
			'include' => [ 'content' ],
			'selected_custom_post_types' => [ 'page' ],
		] ) );

		// Assert
		$this->assertNotContains( 'post', $exported_post_types );
		$this->assertContains( 'page', $exported_post_types );
	}

	public function test_export__includes_post_when_in_selected_custom_post_types() {
		// Arrange
		$runner = new Elementor_Content();

		// Act
		$exported_post_types = $this->get_exported_post_types( $runner->export( [
			'include' => [ 'content' ],
			'selected_custom_post_types' => [ 'post' ],
		] ) );

		// Assert
		$this->assertContains( 'post', $exported_post_types );
	}

	private function get_exported_post_types( array $result ): array {
		return array_keys( $result['manifest'][0]['content'] );
	}

	private function get_exported_paths( array $result ): array {
		return array_column( $result['files'], 'path' );
	}

	private function ensure_component_post_type_supports_elementor(): void {
		if ( ! post_type_exists( Component_Document::TYPE ) ) {
			register_post_type( Component_Document::TYPE, [
				'public' => false,
				'supports' => [ 'elementor' ],
			] );

			$this->registered_component_post_type = true;

			return;
		}

		if ( ! post_type_supports( Component_Document::TYPE, 'elementor' ) ) {
			add_post_type_support( Component_Document::TYPE, 'elementor' );

			$this->added_component_elementor_support = true;
		}
	}
}
