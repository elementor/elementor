<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Legacy_Submenu_Interceptor;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
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

	public function test_find_mapping_key__returns_direct_match() {
		// Arrange
		$item_slug = 'elementor-license';
		$mapping = [
			'elementor-license' => [ 'group' => 'system' ],
			'other-item' => [ 'group' => 'other' ],
		];

		// Act
		$result = $this->interceptor->find_mapping_key( $item_slug, $mapping );

		// Assert
		$this->assertEquals( 'elementor-license', $result );
	}

	public function test_find_mapping_key__returns_decoded_match() {
		// Arrange
		$item_slug = 'edit.php?post_type=elementor_font&amp;test=1';
		$mapping = [
			'edit.php?post_type=elementor_font&test=1' => [ 'group' => 'custom-elements' ],
		];

		// Act
		$result = $this->interceptor->find_mapping_key( $item_slug, $mapping );

		// Assert
		$this->assertEquals( 'edit.php?post_type=elementor_font&test=1', $result );
	}

	public function test_find_mapping_key__returns_normalized_match() {
		// Arrange
		$item_slug = 'http://example.com/wp-admin/edit.php?post_type=elementor_font';
		$mapping = [
			'edit.php?post_type=elementor_font' => [ 'group' => 'custom-elements' ],
		];

		// Act
		$result = $this->interceptor->find_mapping_key( $item_slug, $mapping );

		// Assert
		$this->assertEquals( 'edit.php?post_type=elementor_font', $result );
	}

	public function test_find_mapping_key__returns_null_for_no_match() {
		// Arrange
		$item_slug = 'unknown-slug';
		$mapping = [
			'elementor-license' => [ 'group' => 'system' ],
		];

		// Act
		$result = $this->interceptor->find_mapping_key( $item_slug, $mapping );

		// Assert
		$this->assertNull( $result );
	}

	public function test_intercept_elementor_menu_items__registers_mapped_items_as_level4() {
		// Arrange
		$submenu_items = [
			0 => [ 'License', 'manage_options', 'elementor-license', 'License' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( false );

		$this->menu_data_provider_mock
			->expects( $this->once() )
			->method( 'register_menu' );

		// Act
		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_intercept_elementor_menu_items__registers_unmapped_items_as_level3() {
		// Arrange
		$submenu_items = [
			0 => [ 'Custom Plugin', 'manage_options', 'custom-plugin-slug', 'Custom Plugin' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( false );

		$this->menu_data_provider_mock
			->expects( $this->once() )
			->method( 'register_menu' );

		// Act
		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_intercept_elementor_menu_items__skips_already_registered_items() {
		// Arrange
		$submenu_items = [
			0 => [ 'Already Registered', 'manage_options', 'existing-item', 'Already Registered' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( true );

		$this->menu_data_provider_mock
			->expects( $this->never() )
			->method( 'register_menu' );

		// Act
		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		// Assert
		$this->assertCount( 1, $result );
	}

	public function test_intercept_elementor_menu_items__handles_empty_array() {
		// Arrange
		$submenu_items = [];

		// Act
		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_intercept_templates_menu_items__registers_items_with_templates_group() {
		// Arrange
		$submenu_items = [
			0 => [ 'Popups', 'manage_options', 'e-popups', 'Popups' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( false );

		$this->menu_data_provider_mock
			->expects( $this->once() )
			->method( 'register_menu' );

		// Act
		$result = $this->interceptor->intercept_templates_menu_items( $submenu_items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_intercept_templates_menu_items__removes_already_registered_items() {
		// Arrange
		$submenu_items = [
			0 => [ 'Already Registered', 'manage_options', 'existing-template', 'Already Registered' ],
		];

		$this->menu_data_provider_mock
			->method( 'is_item_already_registered' )
			->willReturn( true );

		$this->menu_data_provider_mock
			->expects( $this->never() )
			->method( 'register_menu' );

		// Act
		$result = $this->interceptor->intercept_templates_menu_items( $submenu_items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_intercept_templates_menu_items__handles_empty_array() {
		// Arrange
		$submenu_items = [];

		// Act
		$result = $this->interceptor->intercept_templates_menu_items( $submenu_items );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_intercept_elementor_menu_items__skips_items_with_empty_slug() {
		// Arrange
		$submenu_items = [
			0 => [ 'No Slug', 'manage_options', '', 'No Slug' ],
		];

		$this->menu_data_provider_mock
			->expects( $this->never() )
			->method( 'register_menu' );

		// Act
		$result = $this->interceptor->intercept_elementor_menu_items( $submenu_items );

		// Assert
		$this->assertCount( 1, $result );
	}
}

