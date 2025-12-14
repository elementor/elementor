<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home\Transformations;

use Elementor\Modules\Home\Transformations\Filter_Add_Ons_By_License;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Filter_Add_Ons_By_License extends PHPUnit_TestCase {

	public function tearDown(): void {
		remove_all_filters( 'elementor/admin/homescreen_promotion_tier' );
		parent::tearDown();
	}

	public function test_transform__removes_add_ons_when_free_tier_in_hide_section() {
		add_filter( 'elementor/admin/homescreen_promotion_tier', function() {
			return 'free';
		} );

		$original_data = $this->mock_home_screen_data_with_hide_section_free();
		$transformation = new Filter_Add_Ons_By_License( [] );

		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_without_add_ons();

		$this->assertEquals( $expected_data, $transformed_data );
		$this->assertArrayNotHasKey( 'add_ons', $transformed_data );
	}

	public function test_transform__keeps_add_ons_when_pro_tier_not_in_hide_section() {
		add_filter( 'elementor/admin/homescreen_promotion_tier', function() {
			return 'pro';
		} );

		$original_data = $this->mock_home_screen_data_with_hide_section_free();
		$transformation = new Filter_Add_Ons_By_License( [] );

		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_with_hide_section_free();

		$this->assertEquals( $expected_data, $transformed_data );
		$this->assertArrayHasKey( 'add_ons', $transformed_data );
	}

	public function test_transform__removes_add_ons_when_one_tier_in_hide_section() {
		add_filter( 'elementor/admin/homescreen_promotion_tier', function() {
			return 'one';
		} );

		$original_data = $this->mock_home_screen_data_with_hide_section_one();
		$transformation = new Filter_Add_Ons_By_License( [] );

		$transformed_data = $transformation->transform( $original_data );
		$expected_data = $this->mock_home_screen_data_without_add_ons();

		$this->assertEquals( $expected_data, $transformed_data );
		$this->assertArrayNotHasKey( 'add_ons', $transformed_data );
	}

	private function mock_home_screen_data_with_hide_section_free() {
		return [
			'add_ons' => [
				'hide_section' => [ 'free' ],
				'header' => [
					'title' => 'Test Add-ons Title',
					'description' => 'Test description',
				],
				'repeater' => [
					[
						'title' => 'Test Plugin',
						'url' => 'https://example.com',
					],
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function mock_home_screen_data_with_hide_section_one() {
		return [
			'add_ons' => [
				'hide_section' => [ 'one' ],
				'header' => [
					'title' => 'Test Add-ons Title',
					'description' => 'Test description',
				],
				'repeater' => [
					[
						'title' => 'Test Plugin',
						'url' => 'https://example.com',
					],
				],
			],
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}

	private function mock_home_screen_data_without_add_ons() {
		return [
			'misc' => [
				'Name' => 'Microsoft',
				'Version' => 'Windows',
			],
		];
	}
}


