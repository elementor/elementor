<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Legacy_Submenu_Interceptor;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Slug_Normalizer;
use PHPUnit\Framework\TestCase as PHPUnit_TestCase;

class Test_Legacy_Submenu_Interceptor extends PHPUnit_TestCase {

	private Legacy_Submenu_Interceptor $interceptor;
	private $menu_data_provider_mock;
	private Slug_Normalizer $slug_normalizer;

	public function setUp(): void {
		parent::setUp();

		$this->menu_data_provider_mock = $this->createMock( Menu_Data_Provider::class );
		$this->slug_normalizer = new Slug_Normalizer();
		$this->interceptor = new Legacy_Submenu_Interceptor(
			$this->menu_data_provider_mock,
			$this->slug_normalizer
		);
	}

	/**
	 * @dataProvider data_find_mapping_key
	 */
	public function test_find_mapping_key( $item_slug, $mapping, $expected ) {
		$result = $this->interceptor->find_mapping_key( $item_slug, $mapping );
		$this->assertEquals( $expected, $result );
	}

	public function data_find_mapping_key() {
		return [
			'direct_match' => [
				'elementor-license',
				[ 'elementor-license' => [ 'group' => 'system' ], 'other-item' => [ 'group' => 'other' ] ],
				'elementor-license',
			],
			'decoded_match' => [
				'edit.php?post_type=elementor_font&amp;test=1',
				[ 'edit.php?post_type=elementor_font&test=1' => [ 'group' => 'custom-elements' ] ],
				'edit.php?post_type=elementor_font&test=1',
			],
			'normalized_match' => [
				'http://example.com/wp-admin/edit.php?post_type=elementor_font',
				[ 'edit.php?post_type=elementor_font' => [ 'group' => 'custom-elements' ] ],
				'edit.php?post_type=elementor_font',
			],
			'no_match' => [
				'unknown-slug',
				[ 'elementor-license' => [ 'group' => 'system' ] ],
				null,
			],
		];
	}

	public function test_intercept_elementor_menu_items__registers_mapped_items_as_level4() {
		$submenu_items = [
			0 => [ 'License', 'manage_options', 'elementor-license', 'License' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( false );

		$this->menu_data_provider_mock
			->expects( $this->once() )
			->method( 'register_menu' );

		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		$this->assertEmpty( $result );
	}

	public function test_intercept_elementor_menu_items__registers_unmapped_items_under_third_party_parent() {
		$submenu_items = [
			0 => [ 'Custom Plugin', 'manage_options', 'custom-plugin-slug', 'Custom Plugin' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( false );

		$this->menu_data_provider_mock
			->expects( $this->exactly( 2 ) )
			->method( 'register_menu' );

		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		$this->assertEmpty( $result );
	}

	public function test_intercept_elementor_menu_items__skips_already_registered_items() {
		$submenu_items = [
			0 => [ 'Already Registered', 'manage_options', 'existing-item', 'Already Registered' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( true );

		$this->menu_data_provider_mock
			->expects( $this->never() )
			->method( 'register_menu' );

		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		$this->assertCount( 1, $result );
	}

	public function test_intercept_elementor_menu_items__handles_empty_array() {
		$submenu_items = [];

		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		$this->assertEmpty( $result );
	}

	public function test_intercept_templates_menu_items__registers_items_with_templates_group() {
		$submenu_items = [
			0 => [ 'Popups', 'manage_options', 'e-popups', 'Popups' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( false );

		$this->menu_data_provider_mock
			->expects( $this->once() )
			->method( 'register_menu' );

		$result = $this->interceptor->intercept_templates_menu_items( $submenu_items );

		$this->assertEmpty( $result );
	}

	public function test_intercept_templates_menu_items__removes_already_registered_items() {
		$submenu_items = [
			0 => [ 'Already Registered', 'manage_options', 'existing-template', 'Already Registered' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( true );

		$this->menu_data_provider_mock
			->expects( $this->never() )
			->method( 'register_menu' );

		$result = $this->interceptor->intercept_templates_menu_items( $submenu_items );

		$this->assertEmpty( $result );
	}

	public function test_intercept_templates_menu_items__handles_empty_array() {
		$submenu_items = [];

		$result = $this->interceptor->intercept_templates_menu_items( $submenu_items );

		$this->assertEmpty( $result );
	}

	public function test_intercept_elementor_menu_items__skips_items_with_empty_slug() {
		$submenu_items = [
			0 => [ 'No Slug', 'manage_options', '', 'No Slug' ],
		];

		$this->menu_data_provider_mock
			->expects( $this->never() )
			->method( 'register_menu' );

		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		$this->assertCount( 1, $result );
	}
}
