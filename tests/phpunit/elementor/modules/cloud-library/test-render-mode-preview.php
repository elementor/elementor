<?php
namespace Elementor\Testing\Modules\CloudLibrary;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\CloudLibrary\Render_Mode_Preview;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Render_Mode_Preview extends Elementor_Test_Base {
	/**
	 * @var Render_Mode_Preview
	 */
	private $render_mode;

	/**
	 * @var \PHPUnit\Framework\MockObject\MockObject
	 */
	private $document;

	private $source_cloud;
	private $templates_manager_mock;

	public function setUp(): void {
		parent::setUp();

		$this->document = $this->getMockBuilder( '\Elementor\Core\Base\Document' )
			->disableOriginalConstructor()
			->getMock();

		$this->document->method( 'get_main_id' )
			->willReturn( 123 );

		$this->templates_manager_mock = $this->getMockBuilder( '\Elementor\TemplateLibrary\Manager' )
			->disableOriginalConstructor()
			->getMock();

		$this->source_cloud = $this->getMockBuilder( '\Elementor\TemplateLibrary\Source_Cloud' )
			->disableOriginalConstructor()
			->setMethods( [ 'create_document_for_preview', 'get_resource', 'save_document_for_preview' ] )
			->getMock();

		$this->source_cloud->method( 'create_document_for_preview' )
			->with( 123 )
			->willReturn( $this->document );

		$this->templates_manager_mock->method( 'get_source' )
			->with( 'cloud' )
			->willReturn( $this->source_cloud );

		Plugin::$instance->templates_manager = $this->templates_manager_mock;

		Plugin::$instance->documents = $this->getMockBuilder( '\Elementor\Core\Documents_Manager' )
			->disableOriginalConstructor()
			->getMock();

		Plugin::$instance->documents->method( 'switch_to_document' )
			->willReturn( true );

		$this->render_mode = new Render_Mode_Preview( 123 );
	}

	public function test_prepare_render() {
		add_filter( 'show_admin_bar', function( $show ) {
			$this->assertFalse( $show );
			return $show;
		});

		$this->render_mode->prepare_render();

		$this->assertEquals( 10, has_filter('template_include', [ $this->render_mode, 'filter_template' ] ) );
	}

	public function test_constructor() {
		// Arrange
		$document = $this->getMockBuilder( '\Elementor\Core\Base\Document' )
			->disableOriginalConstructor()
			->getMock();

		$document->method( 'get_main_id' )
			->willReturn( 123 );

		$source_cloud = $this->getMockBuilder( '\Elementor\TemplateLibrary\Source_Cloud' )
			->disableOriginalConstructor()
			->setMethods( [ 'create_document_for_preview' ] )
			->getMock();

		$source_cloud->expects( $this->once() )
			->method( 'create_document_for_preview' )
			->with( 123 )
			->willReturn( $document );

		$templates_manager = $this->getMockBuilder( '\Elementor\TemplateLibrary\Manager' )
			->disableOriginalConstructor()
			->getMock();

		$templates_manager->method( 'get_source' )
			->with( 'cloud' )
			->willReturn( $source_cloud );

		Plugin::$instance->templates_manager = $templates_manager;

		// Act
		$render_mode = new Render_Mode_Preview( 123 );

		// Assert
		$this->assertEquals( 123, $render_mode->get_document()->get_main_id() );
	}

	public function test_create_document() {
		// Arrange
		$template_data = [
			'content' => [ 'test_content' ],
			'page_settings' => [ 'test_settings' ]
		];

		$document = $this->getMockBuilder( '\Elementor\Core\Base\Document' )
			->disableOriginalConstructor()
			->getMock();

		$document->method( 'get_main_id' )
			->willReturn( 123 );

		$source_cloud = $this->getMockBuilder( '\Elementor\TemplateLibrary\Source_Cloud' )
			->disableOriginalConstructor()
			->setMethods( [ 'create_document_for_preview', 'get_resource', 'save_document_for_preview' ] )
			->getMock();

		$source_cloud->method( 'get_resource' )
			->with( [ 'id' => 123 ] )
			->willReturn( [
				'content' => json_encode( $template_data )
			] );

		$source_cloud->method( 'save_document_for_preview' )
			->with( $template_data )
			->willReturn( $document );

		$source_cloud->method( 'create_document_for_preview' )
			->with( 123 )
			->willReturn( $document );

		$templates_manager = $this->getMockBuilder( '\Elementor\TemplateLibrary\Manager' )
			->disableOriginalConstructor()
			->getMock();

		$templates_manager->method( 'get_source' )
			->with( 'cloud' )
			->willReturn( $source_cloud );

		Plugin::$instance->templates_manager = $templates_manager;

		$render_mode = new Render_Mode_Preview( 123 );

		$reflection = new \ReflectionClass( $render_mode );
		$method = $reflection->getMethod( 'create_document' );
		$method->setAccessible( true );

		Plugin::$instance->common = true;

		// Act
		$method->invoke( $render_mode );

		// Assert
		$this->assertInstanceOf( get_class( $document ), $this->render_mode->get_document() );
	}
}
