<?php
namespace elementor\tests\phpunit\elementor\modules\home\transformations;

use Elementor\Modules\Home\Transformations\Filter_Top_Section_By_License;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Top_Section_By_License extends PHPUnit_TestCase {

	public function test_transform__core_plugin() {
		// Arrange
		$original_data = $this->mock_top_section_data();

		$transformation = new Filter_Top_Section_By_License( [] );

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_top_section_data_transformed_core();

		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
	}

	public function test_transform__pro_plugin() {
		// Arrange
		$original_data = $this->mock_top_section_data();

		$transformation = new Filter_Top_Section_By_License( [] );
		$transformation->has_pro = true;

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_top_section_data_transformed_pro();

		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
	}

	private function mock_top_section_data() {
		return [
			'top_with_licences' => [
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

	private function mock_top_section_data_transformed_core() {
		return [
			'top_with_licences' => [
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

	private function mock_top_section_data_transformed_pro() {
		return [
			'top_with_licences' => [
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
