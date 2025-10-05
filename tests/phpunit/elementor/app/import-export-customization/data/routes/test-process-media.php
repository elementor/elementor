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

        $test_image_data = $this->create_test_image();
        $test_image_url = $test_image_data['url'];
        $test_image_path = $test_image_data['path'];

        $response = $this->send_request( [ $test_image_url ] );

        $this->assertEquals( 200, $response->get_status() );

        $data = $response->get_data();
        $this->assertArrayHasKey( 'data', $data );
        $this->assertArrayHasKey( 'success', $data['data'] );
        $this->assertArrayHasKey( 'message', $data['data'] );
        $this->assertTrue( $data['data']['success'] );
    }

    private function create_test_image() {
        $upload_dir = wp_upload_dir();
        $test_image_path = $upload_dir['path'] . '/test-image-' . uniqid() . '.jpg';

        // Create a simple 1x1 pixel JPEG
        $image_data = base64_decode('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==');

        if ( ! file_put_contents( $test_image_path, $image_data ) ) {
            $this->fail( 'Could not create test image file' );
        }

        return [
            'path' => $test_image_path,
            'url' => $upload_dir['url'] . '/' . basename( $test_image_path )
        ];
    }

    public function test_empty_array() {
        $this->init_rest_api();
        $this->act_as_admin();

        $response = $this->send_request( [] );

        $status = $response->get_status();
        $this->assertEquals( 500, $status );
    }

    public function test_invalid_urls() {
        $this->init_rest_api();
        $this->act_as_admin();

        $response = $this->send_request( [
            'not-a-url',
            'data:image/jpeg;base64,...'
        ] );

        $status = $response->get_status();

        $this->assertEquals( 500, $status );
    }

    private function send_request( $media_urls ) {
        $request = new \WP_REST_Request(
            'POST',
            '/' . Controller::API_NAMESPACE . '/' . Controller::API_BASE . '/process-media'
        );

        $request->set_param( 'media_urls', $media_urls );
        $request->set_param( 'kit', [
            'mediaUploadUrl' => 'https://example.com/upload',
            'id' => 'test-kit-123'
        ] );

        return rest_do_request( $request );
    }
}
