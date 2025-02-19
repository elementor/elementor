<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Filter_Top_Section_By_License;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Top_Section_By_License extends PHPUnit_TestCase {
	public function setUp(): void {
		parent::setUp();

		add_filter( 'elementor/admin/homescreen_promotion_tier', function() {
			return 'free';
		} );
	}
	public function tearDown(): void {
		add_filter( 'elementor/admin/homescreen_promotion_tier', function() {
			return 'free';
		} );

		parent::tearDown();
	}

	public function test__should_transform_data_for_free_license() {
		// Arrange
		$original_data = $this->mock_top_section_data();

		$transformation = new Filter_Top_Section_By_License();

		// Act
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_top_section_data_transformed_core();

		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
	}

	public function test__should_transform_data_for_pro_license() {
		// Arrange
		$original_data = $this->mock_top_section_data();

		$transformation = new Filter_Top_Section_By_License();
		$transformation->has_pro = true;

		// Act
		add_filter( 'elementor/admin/homescreen_promotion_tier', function() {
			return 'pro';
		} );
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_top_section_data_transformed_pro();

		// Assert
		$this->assertEquals( $transformed_data, $expected_data );
	}

	public function test__should_transform_data_for_essential_license() {
		// Arrange
		$original_data = $this->mock_top_section_data();

		$transformation = new Filter_Top_Section_By_License();
		$transformation->has_pro = true;

		// Act
		add_filter( 'elementor/admin/homescreen_promotion_tier', function() {
			return 'essential';
		} );
		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_top_section_data_transformed_essential();

		// Assert
		$this->assertEquals( $expected_data, $transformed_data );
	}

	private function mock_top_section_data() {
		return [
			'top_with_licences' => [
				$this->mock_top_section_data_transformed_core()['top_with_licences'],
				$this->mock_top_section_data_transformed_pro()['top_with_licences'],
				$this->mock_top_section_data_transformed_essential()['top_with_licences'],
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

	private function mock_top_section_data_transformed_essential() {
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
