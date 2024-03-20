<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Home\Transformations\Remove_Sidebar_Upgrade_For_Pro_Users;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Remove_Sidebar_Upgrade_For_Pro_Users extends Elementor_Test_Base {

	private $wordpress_adapter;

	public function test_core_plugin() {
		// Arrange
		$original_data = $this->mock_home_screen_data();
		$transformation = new Remove_Sidebar_Upgrade_For_Pro_Users( $original_data, $this->wordpress_adapter );

		// Act
		$transformed_data = $transformation->transform();

		// Assert
		$this->assertTrue( $transformed_data === $original_data );
	}

	public function test_pro_plugin() {
		// Arrange
		$original_data = $this->mock_home_screen_data();
		$transformation = new Remove_Sidebar_Upgrade_For_Pro_Users( $original_data, $this->wordpress_adapter );

		// Act
		$transformed_data = $transformation->transform();
		$expected_data = $this->mock_home_screen_data_transformed();

		// Assert
		$this->assertTrue( $transformed_data === $expected_data );
	}

	public function build_args() {
		return [
			'home_screen_data' => $this->mock_home_screen_data(),
			'wordpress_adapter' =>$this->wordpress_adapter,
		];
	}

	private function mock_home_screen_data() {
		return [
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function mock_home_screen_data_transformed() {
		return [
			'sidebar_upgrade' => [
				'some' => [
					'key' => 'value',
				],
				'thing' => [
					'key' => 'value',
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	public function setUp(): void {
		parent::setUp();

		$this->wordpress_adapter = $this->getMockBuilder( Wordpress_Adapter_Interface::class )->getMock();

		$utilsHasProMock = $this->getMockBuilder( Remove_Sidebar_Upgrade_For_Pro_Users::class )
//			->setConstructorArgs( $this->build_args() )
			->getMock();
		$utilsHasProMock->method( 'isPro' )->willReturn( true );
	}
}
