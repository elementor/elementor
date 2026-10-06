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

	public function test_get_entries__skips_malformed_entries_and_keeps_valid_ones() {
		// Arrange.
		$this->given_search_index( [
			'icons' => [
				'not-an-array',
				[ 'name' => 'no-library', 'value' => 'no-library' ],
				[ 'name' => 'star', 'library' => 'fa-solid', 'value' => 'fa-solid fa-star' ],
			],
		] );

		// Act.
		$entries = Icon_Catalog::get_entries();

		// Assert.
		$this->assertCount( 1, $entries );
		$this->assertSame( 'star', $entries[0]['name'] );
	}

	public function test_get_entries__falls_back_to_a_readable_label_and_free_license() {
		// Arrange.
		$this->given_search_index( [
			'icons' => [
				[ 'name' => 'cart-plus', 'library' => 'fa-solid', 'value' => 'fa-solid fa-cart-plus' ],
			],
		] );

		// Act.
		$entries = Icon_Catalog::get_entries();

		// Assert.
		$this->assertSame( 'cart plus', $entries[0]['label'] );
		$this->assertSame( Icon_Catalog::LICENSE_FREE, $entries[0]['license'] );
		$this->assertSame( [], $entries[0]['terms'] );
	}

	public function test_get_entries__keeps_the_pro_license_flag() {
		// Arrange.
		$this->given_search_index( [
			'icons' => [
				[ 'name' => 'crown', 'library' => 'fa-solid', 'value' => 'fa-solid fa-crown', 'license' => 'pro' ],
			],
		] );

		// Act.
		$entries = Icon_Catalog::get_entries();

		// Assert.
		$this->assertSame( Icon_Catalog::LICENSE_PRO, $entries[0]['license'] );
	}

	public function test_get_entries__returns_empty_when_the_index_is_missing() {
		// Arrange.
		add_filter(
			'elementor/atomic-widgets/icons/search-index-path',
			fn() => $this->fixture_dir . '/does-not-exist.json'
		);

		// Act & Assert.
		$this->assertSame( [], Icon_Catalog::get_entries() );
		$this->assertFalse( Icon_Catalog::is_available() );
	}

	public function test_get_entries__returns_empty_for_invalid_json() {
		// Arrange.
		$path = $this->fixture_dir . '/search-index.json';
		file_put_contents( $path, '{ not json' );
		add_filter( 'elementor/atomic-widgets/icons/search-index-path', fn() => $path );

		// Act & Assert.
		$this->assertSame( [], Icon_Catalog::get_entries() );
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

	public function test_get_version__returns_null_when_the_version_file_is_missing() {
		// Arrange.
		add_filter(
			'elementor/atomic-widgets/icons/version-path',
			fn() => $this->fixture_dir . '/missing.json'
		);

		// Act & Assert.
		$this->assertNull( Icon_Catalog::get_version() );
	}

	public function test_get_entries__is_read_once_per_request() {
		// Arrange.
		$path = $this->fixture_dir . '/search-index.json';
		$this->given_search_index( [
			'icons' => [ [ 'name' => 'star', 'library' => 'fa-solid', 'value' => 'fa-solid fa-star' ] ],
		] );
		Icon_Catalog::get_entries();

		// Act — removing the file must not change an already-loaded catalog.
		unlink( $path );

		// Assert.
		$this->assertCount( 1, Icon_Catalog::get_entries() );
	}

	private function given_search_index( array $index ): void {
		$path = $this->fixture_dir . '/search-index.json';
		file_put_contents( $path, wp_json_encode( $index ) );

		add_filter( 'elementor/atomic-widgets/icons/search-index-path', fn() => $path );
	}
}
