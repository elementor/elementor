<?php
namespace Elementor\Tests\Phpunit\Elementor\App\KitLibrary\Data\KitsCloud;

use Elementor\Plugin;
use Elementor\Core\Common\Modules\Connect\Module;
use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
use Elementor\App\Modules\KitLibrary\Data\KitsCloud\Controller;
use ElementorEditorTesting\Elementor_Test_Base;
use ElementorEditorTesting\Traits\Rest_Trait;

class Test_Controller extends Elementor_Test_Base {
	use Rest_Trait {
		setUp as traitSetUP;
	}

	/**
	 * @var Cloud_Library
	 */
	private $app_mock;

	/**
	 * @var Controller
	 */
	private $controller;

	public function setUp(): void {
		$this->traitSetUP();

		$this->app_mock = $this->getMockBuilder( Cloud_Library::class )
			->disableOriginalConstructor()
			->setMethods( [ 'get_kits' ] )
			->getMock();

		$module_mock = $this->getMockBuilder( Module::class )
			->setMethods( [ 'get_app' ] )
			->getMock();

		$module_mock->method( 'get_app' )->willReturn( $this->app_mock );

		Plugin::$instance->common->add_component( 'connect', $module_mock );

		$this->controller = new Controller();
		$this->data_manager->register_controller( $this->controller );
	}

	public function test_get_items() {
		// Arrange
		$user = $this->act_as_admin();
		$this->app_mock->method( 'get_kits' )->willReturn( $this->get_kits_api_mock() );

		// Act
		$result = $this->http_get( 'kits-cloud' );

		// Assert
		$this->assertArrayHasKey( 'data', $result );
		$this->assertEqualSets( [
			[
				'id' => 'id_1',
				'title' => 'kit_1',
				'thumbnail_url' => 'https://localhost/image.png',
				'created_at' => '2021-05-26T22:30:39.397Z',
				'updated_at' => '2021-05-26T22:30:39.397Z',
			],
			[
				'id' => 'id_2',
				'title' => 'kit_2',
				'thumbnail_url' => 'https://localhost/image2.png',
				'created_at' => '2021-05-26T22:30:39.397Z',
				'updated_at' => '2021-05-26T22:30:39.397Z',
			]
		], $result['data'] );
	}

	private function get_kits_api_mock() {
		return [
			[
				'id' => 'id_1',
				'title' => 'kit_1',
				'thumbnailUrl' => 'https://localhost/image.png',
				'created_at' => '2021-05-26T22:30:39.397Z',
				'updated_at' => '2021-05-26T22:30:39.397Z',
			],
			[
				'id' => 'id_2',
				'title' => 'kit_2',
				'thumbnailUrl' => 'https://localhost/image2.png',
				'created_at' => '2021-05-26T22:30:39.397Z',
				'updated_at' => '2021-05-26T22:30:39.397Z',
			],
		];
	}
}
