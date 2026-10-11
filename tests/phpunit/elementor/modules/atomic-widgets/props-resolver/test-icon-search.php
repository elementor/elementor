<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;
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
		remove_all_filters( 'elementor/atomic-widgets/custom-icon-libraries/enabled' );
		remove_all_filters( 'elementor/icons_manager/additional_tabs' );
		remove_all_filters( 'elementor/atomic-widgets/icon/svg-converters' );

		Icon_Catalog::reset();
		Custom_Icon_Svg\Resolver::reset_memory();

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
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
		add_filter( 'elementor/icons_manager/additional_tabs', static fn( $tabs ) => $tabs + [
			'test-pack' => [
				'name' => 'test-pack',
				'label' => 'Test Pack',
				'prefix' => 'test-',
				'custom_icon_type' => 'fontello',
				'icons' => [ 'shopping-bag' ],
				'native' => false,
			],
		] );
		add_filter( 'elementor/atomic-widgets/icon/svg-converters', static fn() => [
			new class() implements Custom_Icon_Svg\Svg_Converter {
				public function supports( array $tab ): bool {
					return 'test-pack' === ( $tab['name'] ?? '' );
				}

				public function convert( array $tab, string $icon_value ): string {
					return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1H0z"/></svg>';
				}
			},
		] );
		Custom_Icon_Svg\Resolver::reset_memory();

		// Act.
		$response = Icon_Search::search( [ 'library' => 'test-pack' ] );

		// Assert.
		$this->assertSame( 'test test-shopping-bag', $response['results'][0]['matches'][0]['value'] );
		$this->assertSame( 'Test Pack', $response['custom_libraries']['test-pack'] );
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
