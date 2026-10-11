<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Catalog extends Elementor_Test_Base {

	private string $fixture_dir;

	public function setUp(): void {
		parent::setUp();

		$this->fixture_dir = get_temp_dir() . 'icon-catalog-' . wp_generate_password( 8, false );
		wp_mkdir_p( $this->fixture_dir );

		Icon_Catalog::reset();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/atomic-widgets/icons/search-index-path' );
		remove_all_filters( 'elementor/atomic-widgets/icons/version-path' );
		remove_all_filters( 'elementor/atomic-widgets/font-awesome-7/json-base-path' );

		foreach ( glob( $this->fixture_dir . '/*' ) as $file ) {
			unlink( $file );
		}

		rmdir( $this->fixture_dir );

		Icon_Catalog::reset();

		parent::tearDown();
	}

	public function test_get_entries__reads_and_normalizes_the_index() {
		// Arrange.
		$this->given_search_index( [
			'icons' => [
				[
					'name' => 'cart-shopping',
					'library' => 'fa-solid',
					'value' => 'fa-solid fa-cart-shopping',
					'label' => 'Cart Shopping',
					'aliases' => [ 'shopping-cart' ],
					'terms' => [ 'buy', 'checkout' ],
					'categories' => [ 'Shopping' ],
					'license' => 'free',
				],
			],
		] );

		// Act.
		$entries = Icon_Catalog::get_entries();

		// Assert.
		$this->assertCount( 1, $entries );
		$this->assertSame( 'cart-shopping', $entries[0]['name'] );
		$this->assertSame( 'fa-solid fa-cart-shopping', $entries[0]['value'] );
		$this->assertSame( [ 'shopping-cart' ], $entries[0]['aliases'] );
		$this->assertSame( Icon_Catalog::LICENSE_FREE, $entries[0]['license'] );
	}

	public function test_get_entries__rejects_entries_whose_value_is_not_canonical() {
		// Arrange — a tampered or stale index must never feed a non-renderable value to an agent.
		$this->given_search_index( [
			'icons' => [
				[
					'name' => 'cart-shopping',
					'library' => 'fa-solid',
					'value' => 'fas fa-cart-shopping',
				],
			],
		] );

		// Act.
		$entries = Icon_Catalog::get_entries();

		// Assert.
		$this->assertSame( [], $entries );
	}

	public function test_is_available__rejects_a_malformed_index() {
		// Arrange.
		$path = $this->fixture_dir . '/search-index.json';
		file_put_contents( $path, '{ not json' );
		add_filter( 'elementor/atomic-widgets/icons/search-index-path', fn() => $path );

		// Act & Assert.
		$this->assertFalse( Icon_Catalog::is_available() );
	}

	public function test_get_libraries_and_categories__are_unique_and_sorted() {
		// Arrange.
		$this->given_search_index( [
			'icons' => [
				[ 'name' => 'star', 'library' => 'fa-solid', 'value' => 'fa-solid fa-star', 'categories' => [ 'Shapes', 'Marketing' ] ],
				[ 'name' => 'star', 'library' => 'fa-regular', 'value' => 'fa-regular fa-star', 'categories' => [ 'Shapes' ] ],
			],
		] );

		// Act.
		$libraries = Icon_Catalog::get_libraries();
		$categories = Icon_Catalog::get_categories();

		// Assert.
		$this->assertSame( [ 'fa-regular', 'fa-solid' ], $libraries );
		$this->assertSame( [ 'Marketing', 'Shapes' ], $categories );
	}

	public function test_get_version__reads_the_generated_version_file() {
		// Arrange.
		$path = $this->fixture_dir . '/version.json';
		file_put_contents( $path, wp_json_encode( [ 'version' => '7.3.1' ] ) );
		add_filter( 'elementor/atomic-widgets/icons/version-path', fn() => $path );

		// Act & Assert.
		$this->assertSame( '7.3.1', Icon_Catalog::get_version() );
	}

	private function given_search_index( array $index ): void {
		$path = $this->fixture_dir . '/search-index.json';
		file_put_contents( $path, wp_json_encode( $index ) );

		add_filter( 'elementor/atomic-widgets/icons/search-index-path', fn() => $path );
	}
}
