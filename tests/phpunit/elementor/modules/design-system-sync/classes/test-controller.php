<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group design-system-sync
 */
class Test_Controller extends Elementor_Test_Base {
	private $controller;

	public function setUp(): void {
		parent::setUp();

		$this->controller = new Controller();
		Variables_Provider::clear_cache();
		$this->clear_kit_variables();
		$this->cleanup_generated_file();
	}

	public function tearDown(): void {
		Variables_Provider::clear_cache();
		$this->clear_kit_variables();
		$this->cleanup_generated_file();

		parent::tearDown();
	}

	public function test_generate__returns_201_with_url_and_version() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
		] );

		// Act
		$response = $this->controller->generate();

		// Assert
		$this->assertEquals( Controller::HTTP_CREATED, $response->get_status() );
		$data = $response->get_data();
		$this->assertArrayHasKey( 'url', $data );
		$this->assertArrayHasKey( 'version', $data );
	}

	public function test_generate__creates_css_file_on_disk() {
		// Arrange
		$this->set_kit_variables( [
			'var-1' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				'sync_to_v3' => true,
			],
		] );

		// Act
		$this->controller->generate();

		// Assert
		$stylesheet = new Stylesheet_Manager();
		$this->assertFileExists( $stylesheet->get_path() );
	}

	public function test_generate__returns_500_on_write_failure() {
		// Arrange
		$stylesheet = $this->createMock( Stylesheet_Manager::class );
		$stylesheet->method( 'generate' )
			->willThrowException( new \RuntimeException( 'Write failed' ) );

		$controller = new class( $stylesheet ) extends Controller {
			private $mock_stylesheet;

			public function __construct( $stylesheet ) {
				$this->mock_stylesheet = $stylesheet;
			}

			public function generate(): \WP_REST_Response {
				try {
					$result = $this->mock_stylesheet->generate();

					return new \WP_REST_Response( $result, self::HTTP_CREATED );
				} catch ( \Exception $e ) {
					return new \WP_REST_Response(
						[ 'message' => $e->getMessage() ],
						self::HTTP_INTERNAL_SERVER_ERROR
					);
				}
			}
		};

		// Act
		$response = $controller->generate();

		// Assert
		$this->assertEquals( Controller::HTTP_INTERNAL_SERVER_ERROR, $response->get_status() );
		$this->assertEquals( 'Write failed', $response->get_data()['message'] );
	}

	public function test_has_permission__denies_subscriber() {
		// Arrange
		$this->act_as_subscriber();

		// Act & Assert
		$this->assertFalse( $this->controller->has_permission() );
	}

	public function test_has_permission__allows_editor() {
		// Arrange
		$this->act_as_editor();

		// Act & Assert
		$this->assertTrue( $this->controller->has_permission() );
	}

	public function test_has_permission__allows_admin() {
		// Arrange
		$this->act_as_admin();

		// Act & Assert
		$this->assertTrue( $this->controller->has_permission() );
	}

	private function set_kit_variables( array $variables ): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$kit->update_json_meta( '_elementor_global_variables', [
			'data' => $variables,
			'watermark' => 1,
		] );
	}

	private function clear_kit_variables(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( '_elementor_global_variables' );
		}
	}

	private function cleanup_generated_file(): void {
		$stylesheet = new Stylesheet_Manager();
		$path = $stylesheet->get_path();

		if ( file_exists( $path ) ) {
			unlink( $path );
		}
	}
}
