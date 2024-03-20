<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Remove_Sidebar_Upgrade_For_Pro_Users;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Remove_Sidebar_Upgrade_For_Pro_Users extends PHPUnit_TestCase {

	public function test_transform__core_plugin() {
		// Arrange
		$original_data = $this->mock_home_screen_data();

		$transformation = new Remove_Sidebar_Upgrade_For_Pro_Users( [
			'home_screen_data' => $original_data
		] );

		// Act
		$transformed_data = $transformation->transform();

		// Assert
		$this->assertTrue( $transformed_data === $original_data );
	}

	public function test_transform__pro_plugin() {
		// Arrange
		$transformation = new Remove_Sidebar_Upgrade_For_Pro_Users( [
			'home_screen_data' => $this->mock_home_screen_data()
		] );

		$transformation->has_pro = true;

		// Act
		$transformed_data = $transformation->transform();
		$expected_data = $this->mock_home_screen_data_transformed();

		// Assert
		$this->assertTrue( $transformed_data === $expected_data );
	}

	private function mock_home_screen_data() {
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

	private function mock_home_screen_data_transformed() {
		return [
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}
}
