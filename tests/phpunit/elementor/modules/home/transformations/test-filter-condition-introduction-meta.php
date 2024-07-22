<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Filter_Condition_Introduction_Meta;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Condition_Introduction_Meta extends PHPUnit_TestCase {

	public function test_transform_ai_inactive() {
		// Arrange
		$original_data = $this->mock_home_screen_data();

		$transformation = new Filter_Condition_Introduction_Meta( [] );

		$transformation->introduction_meta_data = [];

		// Act
		$transformed_data = $transformation->transform( $original_data );
		// Assert
		$this->assertTrue( $transformed_data === $original_data );
	}

	public function test_transform_ai_active() {
		// Arrange
		$original_data = $this->mock_home_screen_data();

		$transformation = new Filter_Condition_Introduction_Meta( [] );

		$transformation->introduction_meta_data = [
			'ai_get_started' => true
		];

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_transformed();

		// Assert
		$this->assertTrue( $transformed_data === $expected_data );
	}

	private function mock_home_screen_data() {
		return [
			'add_ons' => [
				'repeater' => [
					[
						'title' => 'Elementor',
						'version' => '3.0.0',
						'file_path' => 'elementor/elementor.php',
					],
					[
						'title' => 'Something Else',
						'version' => '3.0.0',
						'file_path' => 'some/thing.php',
					],
					[
						'title' => 'Elementor AI',
						'version' => '3.0.0',
						'url' => 'elementor/elementor.php',
						'condition' => [
							'key' => 'introduction_meta',
							'value' => 'ai_get_started',
						],
					],
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
			'add_ons' => [
				'repeater' => [
					[
						'title' => 'Elementor',
						'version' => '3.0.0',
						'file_path' => 'elementor/elementor.php',
					],
					[
						'title' => 'Something Else',
						'version' => '3.0.0',
						'file_path' => 'some/thing.php',
					],
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}
}
