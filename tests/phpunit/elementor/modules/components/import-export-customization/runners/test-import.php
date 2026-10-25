<?php

namespace Elementor\Testing\Modules\Components\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Elementor_Content;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Import;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group components-import-export
 */
class Test_Import extends Elementor_Test_Base {
	const TEST_POST_TYPE = 'test_el_content';

	public function test_prepare_posts_settings__sorts_components_by_dependencies() {
		// Arrange
		$runner = new Import();
		$posts_settings = [
			3 => [ 'title' => 'Component C' ],
			1 => [ 'title' => 'Component A' ],
			2 => [ 'title' => 'Component B' ],
		];
		$directory = trailingslashit( sys_get_temp_dir() ) . uniqid( 'elementor-components-', true );
		wp_mkdir_p( $directory );
		file_put_contents(
			$directory . '/dependencies.json',
			wp_json_encode( [
				'dependencies' => [
					1 => [ 'depends_on' => [ 2, 3 ] ],
					3 => [ 'depends_on' => [ 2 ] ],
					2 => [ 'depends_on' => [] ],
				],
			] )
		);

		// Act
		$result = $this->invoke_method( $runner, 'prepare_posts_settings', [ $posts_settings, trailingslashit( $directory ) ] );

		// Assert
		$this->assertSame( [ 2, 3, 1 ], array_keys( $result ) );
		unlink( $directory . '/dependencies.json' );
		rmdir( $directory );
	}

	public function test_get_import_post_types__generic_runner_excludes_components() {
		// Arrange
		$should_register_component_type = ! post_type_exists( Component_Document::TYPE );

		if ( $should_register_component_type ) {
			register_post_type( Component_Document::TYPE, [ 'supports' => [ 'elementor' ] ] );
		}

		register_post_type( self::TEST_POST_TYPE, [ 'supports' => [ 'elementor' ] ] );
		$runner = new Exposed_Elementor_Content_Runner();

		// Act
		$result = $runner->expose_get_import_post_types( [
			'customization' => [],
			'selected_custom_post_types' => [],
		] );

		// Assert
		$this->assertContains( self::TEST_POST_TYPE, $result );
		$this->assertNotContains( Component_Document::TYPE, $result );

		unregister_post_type( self::TEST_POST_TYPE );

		if ( $should_register_component_type ) {
			unregister_post_type( Component_Document::TYPE );
		}
	}

	public function test_get_import_post_types__components_runner_only_imports_components() {
		// Arrange
		$runner = new Import();

		// Act
		$result = $this->invoke_method( $runner, 'get_import_post_types', [ [] ] );

		// Assert
		$this->assertSame( [ Component_Document::TYPE ], $result );
	}

	private function invoke_method( object $object, string $method_name, array $arguments = [] ) {
		$method = new \ReflectionMethod( $object, $method_name );

		if ( PHP_VERSION_ID < 80100 ) {
			$method->setAccessible( true );
		}

		return $method->invokeArgs( $object, $arguments );
	}
}

class Exposed_Elementor_Content_Runner extends Elementor_Content {
	public function expose_get_import_post_types( array $data ): array {
		return $this->get_import_post_types( $data );
	}
}
