<?php
namespace Elementor\Tests\Phpunit\Elementor\TemplateLibrary;

use Elementor\TemplateLibrary\Classes\Media_Collector;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Media_Collector extends Elementor_Test_Base {

    private $media_collector;

    public function setUp(): void {
        parent::setUp();
        $this->media_collector = new Media_Collector();
    }

    public function tearDown(): void {
        if ( $this->media_collector ) {
            $this->media_collector->cleanup();
        }
        parent::tearDown();
    }

    public function test_collects_valid_urls() {
        $this->media_collector->start_collection();
        $urls = [
            'https://example.com/image.jpg',
            'https://example.com/video.mp4'
        ];

        foreach ( $urls as $url ) {
            $this->media_collector->collect_media_url( $url );
        }

        $this->assertEquals( $urls, $this->media_collector->get_collected_urls() );
    }

    public function test_prevents_duplicates() {
        $this->media_collector->start_collection();
        $url = 'https://example.com/image.jpg';

        $this->media_collector->collect_media_url( $url );
        $this->media_collector->collect_media_url( $url );

        $this->assertEquals( [ $url ], $this->media_collector->get_collected_urls() );
    }

    public function test_rejects_invalid_urls() {
        $this->media_collector->start_collection();

        $this->media_collector->collect_media_url( 'not-a-url' );
        $this->media_collector->collect_media_url( 'data:image/jpeg;base64,...' );
        $this->media_collector->collect_media_url( '' );

        $this->assertEmpty( $this->media_collector->get_collected_urls() );
    }

    public function test_detects_local_urls() {
        $reflection = new \ReflectionClass( $this->media_collector );
        $method = $reflection->getMethod( 'is_local_url' );
        $method->setAccessible( true );

        $local_url = get_site_url() . '/wp-content/uploads/image.jpg';
        $external_url = 'https://external.com/image.jpg';

        $this->assertTrue( $method->invokeArgs( $this->media_collector, [ $local_url ] ) );
        $this->assertFalse( $method->invokeArgs( $this->media_collector, [ $external_url ] ) );
    }

    public function test_returns_null_for_empty_zip() {
        $this->media_collector->start_processing();

        $result = $this->media_collector->create_media_zip();

        $this->assertIsArray( $result['mapping'] );
        $this->assertEmpty( $result['mapping'] );
        $this->assertNull( $result['zip_path'] );
    }

    public function test_cleanup_works() {
        $this->media_collector->start_processing();

        // Should not throw errors
        $this->media_collector->cleanup();
        $this->assertTrue( true );
    }
}
