<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Data\Routes;

use Elementor\App\Modules\ImportExportCustomization\Module as ImportExportCustomizationModule;
use Elementor\Plugin;
use Elementor\App\Modules\ImportExportCustomization\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Process_Media extends Elementor_Test_Base {

    private $original_component;
    private $rest_api_initialized = false;

    public function setUp(): void {
        parent::setUp();
        $this->original_component = Plugin::$instance->app->get_component( 'import-export-customization' );
        Plugin::$instance->app->add_component( 'import-export-customization', new ImportExportCustomizationModule() );
    }

    public function tearDown(): void {
        if ( $this->original_component ) {
            Plugin::$instance->app->add_component( 'import-export-customization', $this->original_component );
        }

        if ( $this->rest_api_initialized ) {
            remove_all_filters( 'rest_api_init' );
            $this->rest_api_initialized = false;
        }

        parent::tearDown();
    }

    private function init_rest_api() {
        if ( ! $this->rest_api_initialized ) {
            do_action( 'rest_api_init' );
            $this->rest_api_initialized = true;
        }
    }

    public function test_requires_admin_permission() {
        $this->init_rest_api();
        $this->act_as_subscriber();

        $response = $this->send_request( [] );

        $this->assertEquals( 403, $response->get_status() );
    }

    public function test_allows_admin_access() {
        $this->init_rest_api();
        $this->act_as_admin();

        $response = $this->send_request( [ 'https://example.com/image.jpg' ] );

        $this->assertNotEquals( 403, $response->get_status() );
    }

    public function test_processes_valid_request() {
        $this->init_rest_api();
        $this->act_as_admin();

        $response = $this->send_request( [
            'https://example.com/image1.jpg',
            'https://example.com/image2.png'
        ] );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertArrayHasKey( 'data', $data );
        $this->assertArrayHasKey( 'mapping', $data['data'] );
        $this->assertArrayHasKey( 'zip_path', $data['data'] );
    }

    public function test_handles_empty_array() {
        $this->init_rest_api();
        $this->act_as_admin();

        $response = $this->send_request( [] );

        $status = $response->get_status();
        $this->assertTrue( in_array( $status, [ 200, 500 ] ), "Expected 200 or 500, got {$status}" );

        if ( $status === 200 ) {
            $data = $response->get_data();
            $this->assertArrayHasKey( 'data', $data );
            $this->assertEmpty( $data['data']['mapping'] );
        }
    }

    public function test_handles_invalid_urls() {
        $this->init_rest_api();
        $this->act_as_admin();

        $response = $this->send_request( [
            'not-a-url',
            'data:image/jpeg;base64,...'
        ] );

        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertArrayHasKey( 'data', $data );
        $this->assertIsArray( $data['data']['mapping'] );
    }

    private function send_request( $media_urls ) {
        $request = new \WP_REST_Request(
            'POST',
            '/' . Controller::API_NAMESPACE . '/' . Controller::API_BASE . '/process-media'
        );

        $request->set_param( 'media_urls', $media_urls );

        return rest_do_request( $request );
    }
}
