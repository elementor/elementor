<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\CloudKitLibrary\Data\CloudKits;

use Elementor\Plugin;
use Elementor\Core\Common\Modules\Connect\Module;
use Elementor\Modules\CloudKitLibrary\Connect\Cloud_Kits;
use Elementor\Modules\CloudKitLibrary\Data\CloudKits\Controller;
use ElementorEditorTesting\Elementor_Test_Base;
use ElementorEditorTesting\Traits\Rest_Trait;

class Test_Controller extends Elementor_Test_Base {
//	use Rest_Trait {
//		Rest_Trait::setUp as traitSetUP;
//	}
//
//	/**
//	 * @var Cloud_Kits|\PHPUnit\Framework\MockObject\MockObject
//	 */
//	private $cloud_kits_mock;
//
//	public function setUp(): void {
//		$this->traitSetUP();
//
//		$this->cloud_kits_mock = $this->getMockBuilder( Cloud_Kits::class )
//			->disableOriginalConstructor()
//			->setMethods( [ 'get_all' ] )
//			->getMock();
//
//		$connect_module_mock = $this->getMockBuilder( Module::class )
//			->setMethods( [ 'get_app' ] )
//			->getMock();
//
//		$connect_module_mock->method( 'get_app' )
//			->with( 'cloud-kits' )
//			->willReturn( $this->cloud_kits_mock );
//
//		Plugin::$instance->common->add_component( 'connect', $connect_module_mock );
//
//		$this->data_manager->register_controller( new Controller() );
//	}
//
//	public function test_get_items() {
//		// Arrange
//		$this->act_as_admin();
//		$this->cloud_kits_mock->method( 'get_all' )->willReturn( [
//			[
//				'id' => 'id_1',
//				'title' => 'kit_1',
//				'thumbnailUrl' => 'https://localhost/image.png',
//				'createdAt' => '2021-05-26T22:30:39.397Z',
//				'updatedAt' => '2021-05-26T22:30:39.397Z',
//			],
//			[
//				'id' => 'id_2',
//				'title' => 'kit_2',
//				'thumbnailUrl' => 'https://localhost/image2.png',
//				'createdAt' => '2021-05-26T22:30:39.397Z',
//				'updatedAt' => '2021-05-26T22:30:39.397Z',
//			],
//		] );
//
//		// Act
//		$result = $this->http_get( 'cloud-kits' );
//
//		// Assert
//		$this->assertArrayHasKey( 'data', $result );
//		$this->assertCount( 2, $result['data'] );
//		$this->assertEquals( 'id_1', $result['data'][0]['id'] );
//		$this->assertEquals( 'kit_1', $result['data'][0]['title'] );
//		$this->assertEquals( 'https://localhost/image.png', $result['data'][0]['thumbnail_url'] );
//	}
}
