<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Elementor_Content;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Module as Components_Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Elementor_Content_Export extends Elementor_Test_Base {
	private bool $registered_component_post_type = false;

	private bool $added_component_elementor_support = false;

	public function setUp(): void {
		parent::setUp();

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

	public function test_export__excludes_components_when_import_export_not_supported() {
		if ( Components_Module::is_import_export_supported() ) {
			$this->markTestSkipped( 'Components are exported when import/export support is enabled.' );
		}

		// Arrange
		$runner = new Elementor_Content();

		// Act
		$exported_post_types = $this->get_exported_post_types( $runner->export( [ 'include' => [ 'content' ] ] ) );

		// Assert
		$this->assertNotContains( Component_Document::TYPE, $exported_post_types );
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
