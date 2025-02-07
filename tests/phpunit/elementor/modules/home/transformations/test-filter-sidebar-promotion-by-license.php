<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Filter_Sidebar_Promotion_By_License;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Sidebar_Promotion_By_License extends PHPUnit_TestCase {

	public function test_transform__core_plugin() {
		// Arrange
		$original_data = $this->mock_home_screen_data();

		$transformation = new Filter_Sidebar_Promotion_By_License( [] );

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_transformed_core();

		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
	}

	public function test_transform__pro_plugin() {
		// Arrange
		$original_data = $this->mock_home_screen_data();
		$transformation = new Filter_Sidebar_Promotion_By_License( [] );

		add_filter( 'elementor/admin/homescreen_promotion_tier', function() {
			return 'pro';
		} );

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_transformed_pro();

		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
	}

	public function test_transform__core_is_enabled_is_false() {
		// Arrange
		$original_data = $this->mock_home_screen_data_is_enabled_is_false();

		$transformation = new Filter_Sidebar_Promotion_By_License( [] );

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_transformed();

		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
	}

	private function mock_home_screen_data() {
		return [
			'sidebar_promotion_variants' => [
				[
					'data' => [
						'key' => 'value',
					],
					'license' => [
						'free'
					],
					'is_enabled' => 'true',
				],
				[
					'data' => [
						'key' => 'value',
					],
					'license' => [
						'pro'
					],
					'is_enabled' => 'true',
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function mock_home_screen_data_is_enabled_is_false() {
		return [
			'sidebar_promotion_variants' => [
				[
					'data' => [
						'key' => 'value',
					],
					'license' => [
						'free'
					],
					'is_enabled' => 'false',
				],
				[
					'data' => [
						'key' => 'value',
					],
					'license' => [
						'pro'
					],
					'is_enabled' => 'false',
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
			'sidebar_promotion_variants' => [
				'data' => [
					'key' => 'value',
				],
				'license' => [
					'free'
				],
				'is_enabled' => 'true',
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function mock_home_screen_data_transformed_pro() {
		return [
			'sidebar_promotion_variants' => [
				'data' => [
					'key' => 'value',
				],
				'license' => [
					'pro'
				],
				'is_enabled' => 'true',
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

