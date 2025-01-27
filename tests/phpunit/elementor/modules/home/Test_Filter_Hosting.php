<?php

namespace elementor\tests\phpunit\elementor\modules\home;

use Elementor\Modules\Home\API;
use Elementor\Includes\EditorAssetsAPI;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;
use PHPUnit\Framework\MockObject\MockCallback;
use PHPUnit\Framework\MockObject\MockClass;


class Test_Filter_Hosting extends PHPUnit_TestCase {
	public function test_homescreen_filter_called_once() {
		// Arrange
		$mock_editor_assets_api = $this->getMockBuilder( EditorAssetsAPI::class )
			->disableOriginalConstructor()
			->getMock();

		$mock_editor_assets_api->method( 'get_assets_data' )
			->willReturn( $this->mock_home_screen_data() );

		$api = $this->getMockBuilder( API::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'transform_home_screen_data' ] )
			->getMock();

		$api->editor_assets_api = $mock_editor_assets_api;

		$api->method( 'transform_home_screen_data' )
			->will( $this->returnArgument( 0 ) );

		$mock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'callback' ] )
			->getMock();

		$mock->expects( $this->once() )
			->method( 'callback' )
			->with( $this->mock_home_screen_data() )
			->willReturn( $this->mock_home_screen_data() );

		// Act
		add_filter( 'elementor/core/admin/homescreen', [ $mock, 'callback' ] );

		// Assert filter to be triggered once
		$api->get_home_screen_items();
	}

	private function mock_home_screen_data() {
		return [
			'get_started' => [
				[
					'thing' => [
						'key' => 'value',
					],
					'license' => [
						'free'
					]
				],
			],
		];
	}
}
