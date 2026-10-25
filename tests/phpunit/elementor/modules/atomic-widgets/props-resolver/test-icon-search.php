<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Search extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();

		add_filter(
			'elementor/atomic-widgets/font-awesome-7/json-base-path',
			fn() => ELEMENTOR_PATH . 'tests/fixtures/font-awesome-7/json/'
		);

		Icon_Catalog::reset();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/atomic-widgets/font-awesome-7/json-base-path' );
		remove_all_filters( 'elementor/atomic-widgets/icon/custom-libraries' );
		remove_all_filters( 'elementor/atomic-widgets/icon/library-values' );
		remove_all_filters( 'elementor/atomic-widgets/icon/is-renderable' );

		Icon_Catalog::reset();

		parent::tearDown();
	}

	/**
	 * @dataProvider data_queries
	 */
	public function test_search__returns_the_expected_icon_first( string $query, string $expected_value, string $expected_matched_on ) {
		// Act.
		$match = $this->search( [ 'queries' => [ $query ] ] )[0]['matches'][0];

		// Assert.
		$this->assertSame( $expected_value, $match['value'] );
		$this->assertSame( $expected_matched_on, $match['matched_on'] );
	}

	public function data_queries(): array {
		return [
			'exact name' => [ 'cart-shopping', 'fa-solid fa-cart-shopping', Icon_Search::MATCHED_ON_NAME ],
			'exact name, non-alphabetical words' => [ 'right-left', 'fa-solid fa-right-left', Icon_Search::MATCHED_ON_NAME ],
			'alias from an older FA version' => [ 'shopping-cart', 'fa-solid fa-cart-shopping', Icon_Search::MATCHED_ON_ALIAS ],
			'search term' => [ 'email', 'fa-regular fa-envelope', Icon_Search::MATCHED_ON_TERM ],
			'single word with a filler word' => [ 'star icon', 'fa-regular fa-star', Icon_Search::MATCHED_ON_NAME ],
			'numeric query' => [ '0', 'fa-solid fa-0', Icon_Search::MATCHED_ON_NAME ],
			'plain-language phrase' => [ 'add to cart icon', 'fa-solid fa-cart-plus', Icon_Search::MATCHED_ON_TERM ],
		];
	}

	public function test_search__answers_every_query_in_one_call() {
		// Act.
		$results = $this->search( [ 'queries' => [ 'cart', 'star', 'cart' ] ] );

		// Assert.
		$this->assertSame( [ 'cart', 'star' ], array_column( $results, 'query' ) );
	}

	public function test_search__filters_by_library() {
		// Act.
		$matches = $this->search( [ 'queries' => [ 'star' ], 'library' => 'fa-regular' ] )[0]['matches'];

		// Assert.
		$this->assertSame( [ 'fa-regular fa-star' ], array_column( $matches, 'value' ) );
	}

	public function test_search__browses_a_category_without_a_query() {
		// Act.
		$result = $this->search( [ 'category' => 'shopping', 'per_page' => 2 ] )[0];

		// Assert.
		$this->assertSame( 6, $result['total'] );
		$this->assertCount( 2, $result['matches'] );
		$this->assertTrue( $result['truncated'] );
	}

	public function test_search__requires_a_query_or_a_filter() {
		// Act.
		$response = Icon_Search::search( [ 'queries' => [ '  ' ] ] );

		// Assert.
		$this->assertArrayHasKey( 'error', $response );
	}

	public function test_search__includes_renderable_custom_library_icons() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/icon/custom-libraries', static fn() => [ 'test-pack' => 'Test Pack' ] );
		add_filter( 'elementor/atomic-widgets/icon/library-values', static fn( $result, $library ) => 'test-pack' === $library
			? [
				'values' => [ 'shopping-bag' => 'test test-shopping-bag' ],
				'truncated' => false,
				'total' => 1,
			]
			: $result, 10, 2 );
		add_filter( 'elementor/atomic-widgets/icon/is-renderable', '__return_true' );

		// Act.
		$response = Icon_Search::search( [ 'library' => 'test-pack' ] );
		$shopping = Icon_Search::search( [ 'queries' => [ 'shopping' ] ] );

		// Assert.
		$this->assertSame( 'test test-shopping-bag', $response['results'][0]['matches'][0]['value'] );
		$this->assertSame( 'Test Pack', $response['custom_libraries']['test-pack'] );
		$this->assertSame( 'test test-shopping-bag', $shopping['results'][0]['matches'][0]['value'] );
	}

	public function test_search__returns_string_library_names_for_a_numeric_looking_custom_library() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/icon/custom-libraries', static fn() => [ '-1' => 'Numeric Pack', '2024' => 'Year Pack' ] );
		add_filter( 'elementor/atomic-widgets/icon/library-values', static fn( $result, $library ) => [
			'values' => [ 'shopping-bag' => 'pack pack-shopping-bag' ],
			'truncated' => false,
			'total' => 1,
		], 10, 2 );
		add_filter( 'elementor/atomic-widgets/icon/is-renderable', '__return_true' );

		// Act.
		$matched = Icon_Search::search( [ 'queries' => [ 'shopping bag' ] ] );
		$browsing = Icon_Search::search( [ 'library' => '-1' ] );

		// Assert.
		foreach ( array_merge( $matched['results'][0]['matches'], $browsing['results'][0]['matches'] ) as $match ) {
			$this->assertIsString( $match['library'] );
		}

		$this->assertSame( [ '-1', '2024' ], array_slice( $browsing['libraries'], -2 ) );

		foreach ( $browsing['libraries'] as $library ) {
			$this->assertIsString( $library );
		}
	}

	public function test_search__sends_site_facets_only_when_nothing_matched_or_browsing() {
		// Act.
		$matched = Icon_Search::search( [ 'queries' => [ 'star' ] ] );
		$unmatched = Icon_Search::search( [ 'queries' => [ 'zzzqqq' ] ] );
		$browsing = Icon_Search::search( [ 'category' => 'shopping' ] );

		// Assert.
		$this->assertArrayNotHasKey( 'categories', $matched );
		$this->assertArrayNotHasKey( 'libraries', $matched );
		$this->assertArrayHasKey( 'categories', $unmatched );
		$this->assertArrayHasKey( 'libraries', $browsing );
	}

	private function search( array $args ): array {
		return Icon_Search::search( $args )['results'];
	}
}
