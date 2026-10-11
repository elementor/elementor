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

	public function tearDown(): void {
		remove_all_filters( self::CONFIG_FILTER );
		remove_all_filters( self::FILTER_ITEMS_FILTER );

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
}
