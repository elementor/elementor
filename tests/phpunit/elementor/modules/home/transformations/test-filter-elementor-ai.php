<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Filter_Elementor_AI;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Elementor_AI extends PHPUnit_TestCase {

	private $wordpress_adapter;

	public function test_transform_ai_inactive() {
		// Arrange
		$original_data = $this->mock_home_screen_data();

		$transformation = new Filter_Elementor_AI( [] );

		$transformation->is_ai_active = false;

		// Act
		$transformed_data = $transformation->transform( $original_data );
		// Assert
		$this->assertTrue( $transformed_data === $original_data );
	}

	public function test_transform_ai_active() {
		// Arrange
		$original_data = $this->mock_home_screen_data();

		$transformation = new Filter_Elementor_AI( [] );

		$transformation->is_ai_active = true;

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
