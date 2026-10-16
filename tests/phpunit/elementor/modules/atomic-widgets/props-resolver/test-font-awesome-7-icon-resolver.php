<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Font_Awesome_7_Icon_Resolver;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Font_Awesome_7_Icon_Resolver extends Elementor_Test_Base {
	const CONFIG_FILTER = 'elementor/atomic-widgets/font-awesome-7/editor-config';

	const FILTER_ITEMS_FILTER = 'elementor/atomic-widgets/font-awesome-7/filter-items';

	public function setUp(): void {
		parent::setUp();

		add_filter(
			'elementor/atomic-widgets/font-awesome-7/json-base-path',
			fn() => ELEMENTOR_PATH . 'tests/fixtures/font-awesome-7/json/'
		);

		Font_Awesome_7_Icon_Resolver::reset();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/icons_manager/additional_tabs' );
		remove_all_filters( 'elementor/atomic-widgets/font-awesome-7/json-base-path' );
		remove_all_filters( self::CONFIG_FILTER );
		remove_all_filters( self::FILTER_ITEMS_FILTER );

		Font_Awesome_7_Icon_Resolver::reset();

		parent::tearDown();
	}

	public function test_get_editor_config__returns_only_core_keys_by_default() {
		// Act.
		$config = Font_Awesome_7_Icon_Resolver::get_editor_config();

		// Assert.
		$this->assertSame( [ 'jsonFiles', 'jsonBaseUrl', 'filter' ], array_keys( $config ) );
	}

	public function test_get_editor_config__allows_extending_config_via_filter() {
		// Arrange.
		add_filter( self::CONFIG_FILTER, static function ( $config ) {
			$config['extra'] = true;

			return $config;
		} );

		// Act.
		$config = Font_Awesome_7_Icon_Resolver::get_editor_config();

		// Assert.
		$this->assertTrue( $config['extra'] );
	}

	public function test_get_editor_config__allows_extending_filter_items_via_filter() {
		// Arrange.
		add_filter( self::FILTER_ITEMS_FILTER, static function ( $items ) {
			$items[] = [
				'type' => Font_Awesome_7_Icon_Resolver::FILTER_TYPE_ITEM,
				'value' => 'extra-library',
				'label' => 'Extra',
			];

			return $items;
		} );

		// Act.
		$config = Font_Awesome_7_Icon_Resolver::get_editor_config();

		// Assert.
		$this->assertContains( 'extra-library', array_column( $config['filter'], 'value' ) );
	}

	public function test_get_editor_config__ignores_non_array_filter_results() {
		// Arrange.
		add_filter( self::CONFIG_FILTER, '__return_null' );
		add_filter( self::FILTER_ITEMS_FILTER, '__return_null' );

		// Act.
		$config = Font_Awesome_7_Icon_Resolver::get_editor_config();

		// Assert.
		$this->assertContains( 'fa-solid', array_column( $config['filter'], 'value' ) );
	}

	/**
	 * @dataProvider data_digit_icon_names
	 */
	public function test_resolve__handles_digit_icon_names( string $input_name, string $expected_name ) {
		// Arrange.
		Font_Awesome_7_Icon_Resolver::reset();
		$icon_value = 'fa-solid ' . $input_name;

		// Act.
		$result = Font_Awesome_7_Icon_Resolver::resolve( $icon_value, 'fa-solid' );

		// Assert.
		$this->assertIsArray( $result, "Failed to resolve $icon_value" );
		$this->assertArrayHasKey( 'paths', $result );
		$this->assertNotEmpty( $result['paths'], "Icon $expected_name should resolve to paths" );
	}

	public function data_digit_icon_names(): array {
		return [
			'fa-0' => [ 'fa-0', '0' ],
			'fa-1' => [ 'fa-1', '1' ],
			'fa-2' => [ 'fa-2', '2' ],
			'fa-3' => [ 'fa-3', '3' ],
			'fa-4' => [ 'fa-4', '4' ],
			'fa-5' => [ 'fa-5', '5' ],
			'fa-6' => [ 'fa-6', '6' ],
			'fa-7' => [ 'fa-7', '7' ],
			'fa-8' => [ 'fa-8', '8' ],
			'fa-9' => [ 'fa-9', '9' ],
		];
	}
}
