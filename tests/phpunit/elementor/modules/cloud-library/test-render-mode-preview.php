<?php
namespace Elementor\Testing\Modules\CloudLibrary;

use Elementor\Modules\CloudLibrary\Render_Mode_Template_Preview;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Render_Mode_Preview extends Elementor_Test_Base {
    /**
     * @var \PHPUnit\Framework\MockObject\MockObject
     */
    private $document_mock;

    private $source_cloud_mock;

    private $templates_manager_mock;

    private $templates_manager;

    private $documents_mock;

    private $documents;

    public function setUp(): void {
        parent::setUp();

        $this->templates_manager = Plugin::$instance->templates_manager;
        $this->documents = Plugin::$instance->documents;

        $this->document_mock = $this->getMockBuilder( '\Elementor\Core\Base\Document' )
            ->disableOriginalConstructor()
            ->getMock();

        $this->document_mock->method( 'get_main_id' )
            ->willReturn( 123 );

        $this->templates_manager_mock = $this->getMockBuilder( '\Elementor\TemplateLibrary\Manager' )
            ->disableOriginalConstructor()
            ->getMock();

        $this->source_cloud_mock = $this->getMockBuilder( '\Elementor\TemplateLibrary\Source_Cloud' )
            ->disableOriginalConstructor()
            ->setMethods( [ 'create_document_for_preview', 'get_resource', 'save_document_for_preview' ] )
            ->getMock();

        $this->source_cloud_mock->method( 'create_document_for_preview' )
            ->with( 123 )
            ->willReturn( $this->document_mock );

        $this->templates_manager_mock->method( 'get_source' )
            ->with( 'cloud' )
            ->willReturn( $this->source_cloud_mock );

        $this->documents_mock = $this->getMockBuilder( '\Elementor\Core\Documents_Manager' )
            ->disableOriginalConstructor()
            ->getMock();

        $this->documents_mock->method( 'switch_to_document' )
            ->willReturn( true );

        Plugin::$instance->templates_manager = $this->templates_manager_mock;
        Plugin::$instance->documents = $this->documents_mock;
    }

    public function tearDown(): void {
        Plugin::$instance->templates_manager = $this->templates_manager;
        Plugin::$instance->documents = $this->documents;
        parent::tearDown();
    }

    public function test_prepare_render() {
        // Arrange
        add_filter( 'show_admin_bar', function( $show ) {
            $this->assertFalse( $show );
            return $show;
        });

        $render_mode = new Render_Mode_Template_Preview( 123 );

        // Act
        $render_mode->prepare_render();

        // Assert
        $this->assertEquals( 10, has_filter('template_include', [ $render_mode, 'filter_template' ] ) );
    }

    public function test_constructor() {
        // Arrange & Act
        $render_mode = new Render_Mode_Template_Preview( 123 );

        // Assert
        $this->assertEquals( 123, $render_mode->get_document()->get_main_id() );
    }

    public function test_create_document() {
        // Arrange
        $template_data = [
            'content' => [ 'test_content' ],
            'page_settings' => [ 'test_settings' ]
        ];

        $this->source_cloud_mock->method( 'get_resource' )
            ->with( [ 'id' => 123 ] )
            ->willReturn( [
                'content' => json_encode( $template_data )
            ] );

        $render_mode = new Render_Mode_Template_Preview( 123 );

        $reflection = new \ReflectionClass( $render_mode );
        $method = $reflection->getMethod( 'create_document' );
        $method->setAccessible( true );

        // Act
        $method->invoke( $render_mode );

        // Assert
        $this->assertInstanceOf( get_class( $this->document_mock ), $render_mode->get_document() );
    }
}
