<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Filter_Get_Started_By_License;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Get_Started_By_License extends PHPUnit_TestCase {

	public function test_transform__core_plugin() {
		// Arrange
		$original_data = $this->mock_home_screen_data();

		$transformation = new Filter_Get_Started_By_License( [] );

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_transformed_core();

		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
	}

	public function test_transform__pro_plugin() {
		// Arrange
		$original_data = $this->mock_home_screen_data();

		$transformation = new Filter_Get_Started_By_License( [] );
		$transformation->has_pro = true;

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_transformed_pro();
		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
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
					],
				],
				[
					'thing' => [
						'key' => 'value',
					],
					'license' => [
						'pro'
					],
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function mock_home_screen_data_transformed_core() {
		return [
			'get_started' => [
				'thing' => [
					'key' => 'value',
				],
				'license' => [
					'free'
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function mock_home_screen_data_transformed_pro() {
		return [
			'get_started' => [
				'thing' => [
					'key' => 'value',
				],
				'license' => [
					'pro'
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}
}
