<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Search extends Elementor_Test_Base {

	private string $fixture_path;

	public function setUp(): void {
		parent::setUp();

		$this->fixture_path = get_temp_dir() . 'icon-search-' . wp_generate_password( 8, false ) . '.json';

		file_put_contents( $this->fixture_path, wp_json_encode( [ 'icons' => $this->get_fixture_icons() ] ) );

		add_filter( 'elementor/atomic-widgets/icons/search-index-path', fn() => $this->fixture_path );

		Icon_Catalog::reset();
		Icon_Matcher::reset();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/atomic-widgets/icons/search-index-path' );
		remove_all_filters( 'elementor/atomic-widgets/icons/search-results' );

		if ( file_exists( $this->fixture_path ) ) {
			unlink( $this->fixture_path );
		}

		Icon_Catalog::reset();
		Icon_Matcher::reset();

		parent::tearDown();
	}

	public function test_search__ranks_an_exact_name_first() {
		// Arrange.
		$args = [ 'queries' => [ 'cart-shopping' ] ];

		// Act.
		$matches = $this->get_matches( Icon_Search::search( $args ) );

		// Assert.
		$this->assertSame( 'fa-solid fa-cart-shopping', $matches[0]['value'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $matches[0]['matched_on'] );
	}

	public function test_search__returns_the_value_and_library_pair_verbatim() {
		// Arrange.
		$args = [ 'queries' => [ 'cart-shopping' ] ];

		// Act.
		$match = $this->get_matches( Icon_Search::search( $args ) )[0];

		// Assert — the pair must be writable as-is onto the e-svg icon prop.
		$this->assertSame( 'fa-solid', $match['library'] );
		$this->assertSame( $match['library'] . ' fa-' . $match['name'], $match['value'] );
	}

	public function test_search__matches_an_alias() {
		// Arrange.
		$args = [ 'queries' => [ 'shopping cart' ] ];

		// Act.
		$matches = $this->get_matches( Icon_Search::search( $args ) );

		// Assert.
		$this->assertSame( 'fa-solid fa-cart-shopping', $matches[0]['value'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_ALIAS, $matches[0]['matched_on'] );
	}

	public function test_search__matches_a_search_term_for_a_descriptive_phrase() {
		// Arrange.
		$args = [ 'queries' => [ 'checkout' ] ];

		// Act.
		$matches = $this->get_matches( Icon_Search::search( $args ) );

		// Assert.
		$this->assertSame( Icon_Matcher::MATCHED_ON_TERM, $matches[0]['matched_on'] );
		$this->assertContains( 'fa-solid fa-cart-shopping', array_column( $matches, 'value' ) );
	}

	public function test_search__prefers_a_whole_query_match_over_single_word_matches() {
		// Arrange.
		$args = [ 'queries' => [ 'shopping cart' ] ];

		// Act.
		$values = array_column( $this->get_matches( Icon_Search::search( $args ) ), 'value' );

		// Assert.
		$this->assertSame( 'fa-solid fa-cart-shopping', $values[0] );
		$this->assertContains( 'fa-solid fa-cart-plus', $values );
		$this->assertGreaterThan( 0, array_search( 'fa-solid fa-cart-plus', $values, true ) );
	}

	public function test_search__prefers_icons_matching_more_words_of_the_prompt() {
		// Arrange.
		$args = [ 'queries' => [ 'add to cart' ] ];

		// Act.
		$values = array_column( $this->get_matches( Icon_Search::search( $args ) ), 'value' );

		// Assert.
		$this->assertSame( 'fa-solid fa-cart-plus', $values[0] );
	}

	public function test_search__ignores_generic_prompt_words() {
		// Arrange.
		$args = [ 'queries' => [ 'some-unmatchable-icon' ] ];

		// Act.
		$result = Icon_Search::search( $args )['results'][0];

		// Assert.
		$this->assertSame( 0, $result['total'] );
		$this->assertSame( [], $result['matches'] );
	}

	public function test_search__answers_every_query_in_one_call() {
		// Arrange.
		$args = [ 'queries' => [ 'cart-shopping', 'instagram' ] ];

		// Act.
		$results = Icon_Search::search( $args )['results'];

		// Assert.
		$this->assertCount( 2, $results );
		$this->assertSame( 'cart-shopping', $results[0]['query'] );
		$this->assertSame( 'fa-brands fa-instagram', $results[1]['matches'][0]['value'] );
	}

	public function test_search__caps_the_number_of_queries() {
		// Arrange.
		$queries = [];
		for ( $i = 0; $i < Icon_Search::MAX_QUERIES + 5; $i++ ) {
			$queries[] = 'query-' . $i;
		}

		// Act.
		$results = Icon_Search::search( [ 'queries' => $queries ] )['results'];

		// Assert.
		$this->assertCount( Icon_Search::MAX_QUERIES, $results );
	}

	public function test_search__deduplicates_queries() {
		// Arrange.
		$args = [ 'queries' => [ 'star', 'star' ] ];

		// Act.
		$results = Icon_Search::search( $args )['results'];

		// Assert.
		$this->assertCount( 1, $results );
	}

	public function test_search__accepts_a_plain_string_query() {
		// Arrange.
		$args = [ 'queries' => 'instagram' ];

		// Act.
		$results = Icon_Search::search( $args )['results'];

		// Assert.
		$this->assertCount( 1, $results );
		$this->assertSame( 'instagram', $results[0]['query'] );
	}

	public function test_search__returns_one_entry_per_style_for_a_shared_name() {
		// Arrange.
		$args = [ 'queries' => [ 'star' ] ];

		// Act.
		$libraries = array_column( $this->get_matches( Icon_Search::search( $args ) ), 'library' );

		// Assert.
		$this->assertContains( 'fa-solid', $libraries );
		$this->assertContains( 'fa-regular', $libraries );
	}

	public function test_search__filters_by_library() {
		// Arrange.
		$args = [ 'queries' => [ 'star' ], 'library' => 'fa-regular' ];

		// Act.
		$matches = $this->get_matches( Icon_Search::search( $args ) );

		// Assert.
		$this->assertNotEmpty( $matches );
		foreach ( $matches as $match ) {
			$this->assertSame( 'fa-regular', $match['library'] );
		}
	}

	public function test_search__browses_a_category_without_a_query() {
		// Arrange.
		$args = [ 'queries' => [], 'category' => 'shopping' ];

		// Act.
		$matches = $this->get_matches( Icon_Search::search( $args ) );

		// Assert.
		$this->assertNotEmpty( $matches );
		$this->assertSame( Icon_Matcher::MATCHED_ON_CATEGORY, $matches[0]['matched_on'] );
		$this->assertNotContains( 'fa-brands fa-instagram', array_column( $matches, 'value' ) );
	}

	public function test_search__returns_no_results_without_a_query_or_a_filter() {
		// Arrange.
		$args = [ 'queries' => [] ];

		// Act.
		$response = Icon_Search::search( $args );

		// Assert.
		$this->assertSame( [], $response['results'] );
	}

	public function test_search__reports_the_site_libraries_categories_and_version() {
		// Arrange.
		$args = [ 'queries' => [ 'star' ] ];

		// Act.
		$response = Icon_Search::search( $args );

		// Assert.
		$this->assertContains( 'fa-solid', $response['libraries'] );
		$this->assertContains( 'shopping', $response['categories'] );
		$this->assertArrayHasKey( 'font_awesome_version', $response );
	}

	public function test_search__paginates_and_reports_truncation() {
		// Arrange.
		$args = [ 'queries' => [ 'cart' ], 'per_page' => 1 ];

		// Act.
		$first = Icon_Search::search( $args )['results'][0];
		$second = Icon_Search::search( $args + [ 'page' => 2 ] )['results'][0];

		// Assert.
		$this->assertCount( 1, $first['matches'] );
		$this->assertTrue( $first['truncated'] );
		$this->assertNotSame( $first['matches'][0]['value'], $second['matches'][0]['value'] );
	}

	public function test_search__clamps_per_page_to_the_maximum() {
		// Arrange.
		$args = [ 'queries' => [ 'star' ], 'per_page' => 9999 ];

		// Act.
		$result = Icon_Search::search( $args )['results'][0];

		// Assert.
		$this->assertSame( Icon_Search::MAX_PER_PAGE, $result['per_page'] );
	}

	public function test_search__normalizes_a_negative_page_and_per_page() {
		// Arrange.
		$args = [ 'queries' => [ 'star' ], 'page' => -3, 'per_page' => -1 ];

		// Act.
		$result = Icon_Search::search( $args )['results'][0];

		// Assert.
		$this->assertSame( 1, $result['page'] );
		$this->assertSame( Icon_Search::DEFAULT_PER_PAGE, $result['per_page'] );
	}

	public function test_search__ignores_non_string_queries() {
		// Arrange.
		$args = [ 'queries' => [ null, [ 'nested' ], 42, 'instagram' ] ];

		// Act.
		$results = Icon_Search::search( $args )['results'];

		// Assert.
		$this->assertCount( 1, $results );
		$this->assertSame( 'instagram', $results[0]['query'] );
	}

	public function test_search__truncates_an_overlong_query() {
		// Arrange.
		$args = [ 'queries' => [ str_repeat( 'a', Icon_Search::MAX_QUERY_LENGTH + 50 ) ] ];

		// Act.
		$result = Icon_Search::search( $args )['results'][0];

		// Assert.
		$this->assertSame( Icon_Search::MAX_QUERY_LENGTH, strlen( $result['query'] ) );
	}

	public function test_search__never_returns_svg_markup() {
		// Arrange.
		$args = [ 'queries' => [ 'star', 'cart' ] ];

		// Act.
		$encoded = wp_json_encode( Icon_Search::search( $args ) );

		// Assert — icon paths would blow up the agent's context for no benefit.
		$this->assertStringNotContainsString( '<svg', $encoded );
		$this->assertStringNotContainsString( 'M0 0', $encoded );
	}

	public function test_search__exposes_the_pro_license_so_agents_can_skip_those_icons() {
		// Arrange.
		$args = [ 'queries' => [ 'crown' ] ];

		// Act.
		$match = $this->get_matches( Icon_Search::search( $args ) )[0];

		// Assert.
		$this->assertSame( Icon_Catalog::LICENSE_PRO, $match['license'] );
	}

	public function test_search__results_can_be_filtered() {
		// Arrange.
		add_filter(
			'elementor/atomic-widgets/icons/search-results',
			fn( $response ) => array_merge( $response, [ 'results' => [] ] )
		);

		// Act.
		$response = Icon_Search::search( [ 'queries' => [ 'star' ] ] );

		// Assert.
		$this->assertSame( [], $response['results'] );
	}

	public function test_search__ignores_a_filter_that_returns_a_non_array() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/icons/search-results', fn() => 'broken' );

		// Act.
		$response = Icon_Search::search( [ 'queries' => [ 'star' ] ] );

		// Assert.
		$this->assertIsArray( $response );
		$this->assertNotEmpty( $response['results'] );
	}

	private function get_matches( array $response ): array {
		return $response['results'][0]['matches'];
	}

	private function get_fixture_icons(): array {
		return [
			[
				'name' => 'cart-shopping',
				'library' => 'fa-solid',
				'value' => 'fa-solid fa-cart-shopping',
				'label' => 'Cart Shopping',
				'aliases' => [ 'shopping-cart' ],
				'terms' => [ 'buy', 'cart', 'checkout', 'shopping' ],
				'categories' => [ 'shopping' ],
				'license' => 'free',
			],
			[
				'name' => 'cart-plus',
				'library' => 'fa-solid',
				'value' => 'fa-solid fa-cart-plus',
				'label' => 'Cart Plus',
				'aliases' => [],
				'terms' => [ 'add', 'cart', 'checkout', 'shopping' ],
				'categories' => [ 'shopping' ],
				'license' => 'free',
			],
			[
				'name' => 'star',
				'library' => 'fa-solid',
				'value' => 'fa-solid fa-star',
				'label' => 'Star',
				'aliases' => [],
				'terms' => [ 'favorite', 'rating' ],
				'categories' => [ 'shapes' ],
				'license' => 'free',
			],
			[
				'name' => 'star',
				'library' => 'fa-regular',
				'value' => 'fa-regular fa-star',
				'label' => 'Star',
				'aliases' => [],
				'terms' => [ 'favorite', 'rating' ],
				'categories' => [ 'shapes' ],
				'license' => 'free',
			],
			[
				'name' => 'instagram',
				'library' => 'fa-brands',
				'value' => 'fa-brands fa-instagram',
				'label' => 'Instagram',
				'aliases' => [],
				'terms' => [ 'social' ],
				'categories' => [ 'brands' ],
				'license' => 'free',
			],
			[
				'name' => 'crown',
				'library' => 'fa-solid',
				'value' => 'fa-solid fa-crown',
				'label' => 'Crown',
				'aliases' => [],
				'terms' => [ 'premium' ],
				'categories' => [ 'shapes' ],
				'license' => 'pro',
			],
		];
	}

	/**
	 * @dataProvider data_word_order_independence
	 */
	public function test_search__multi_word_queries_are_order_independent( string $query_a, string $query_b ) {
		// Arrange.
		$args_a = [ 'queries' => [ $query_a ] ];
		$args_b = [ 'queries' => [ $query_b ] ];

		// Act.
		$matches_a = $this->get_matches( Icon_Search::search( $args_a ) );
		$matches_b = $this->get_matches( Icon_Search::search( $args_b ) );

		// Assert.
		$values_a = array_column( $matches_a, 'value' );
		$values_b = array_column( $matches_b, 'value' );

		$this->assertSame( $values_a, $values_b, 'Query order should not affect ranking' );
	}

	public function data_word_order_independence(): array {
		return [
			'cart shopping' => [ 'cart shopping', 'shopping cart' ],
			'cart checkout' => [ 'cart checkout', 'checkout cart' ],
		];
	}

	public function test_search__returns_no_matches_for_queries_that_normalize_to_empty() {
		// Arrange — queries that contain only special characters or short words.
		$args = [ 'queries' => [ '!!!', '🛒', 'a', 'hi', '...' ] ];

		// Act.
		$response = Icon_Search::search( $args );

		// Assert.
		foreach ( $response['results'] as $result ) {
			$this->assertSame( 0, $result['total'], 'Empty-normalized queries should return 0 matches' );
			$this->assertEmpty( $result['matches'] );
		}
	}

	public function test_search__requires_at_least_query_library_or_category() {
		// Arrange.
		$args = [ 'queries' => [] ];

		// Act.
		$response = Icon_Search::search( $args );

		// Assert.
		$this->assertArrayHasKey( 'error', $response );
		$this->assertStringContainsString( 'required', $response['error'] );
	}

	public function test_search__all_tokens_in_name_ranks_higher() {
		// Arrange.
		$args = [ 'queries' => [ 'shopping cart' ] ];

		// Act.
		$matches = $this->get_matches( Icon_Search::search( $args ) );

		// Assert — cart-shopping has both "cart" and "shopping" in its name.
		$this->assertSame( 'fa-solid fa-cart-shopping', $matches[0]['value'] );
	}

	public function test_search__includes_custom_library_results() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );
		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) {
				$tabs['test-pack'] = [
					'name' => 'test-pack',
					'label' => 'Test Pack',
					'prefix' => 'test-',
					'custom_icon_type' => 'fontello',
					'fetchJson' => [ 'url' => 'data:application/json;base64,' . base64_encode( wp_json_encode( [
						'glyphs' => [
							[ 'css' => 'shopping-bag', 'code' => 59392, 'search' => [ 'bag', 'shopping' ] ],
						],
					] ) ) ],
					'native' => false,
				];

				return $tabs;
			}
		);

		$args = [ 'queries' => [ 'shopping' ], 'per_page' => 20 ];

		// Act.
		$matches = $this->get_matches( Icon_Search::search( $args ) );

		// Assert — custom library icons should appear alongside Font Awesome icons.
		$custom_results = array_filter( $matches, fn( $m ) => $m['library'] === 'test-pack' );
		$this->assertNotEmpty( $custom_results, 'Custom library results should be included' );

		$custom_match = array_values( $custom_results )[0];
		$this->assertSame( 'test-pack test-shopping-bag', $custom_match['value'] );
		$this->assertSame( 'Test Pack', $custom_match['library_label'] );
	}

	public function test_search__truncates_custom_libraries_at_250_icons() {
		// Arrange — a custom library with >250 icons.
		add_filter( 'elementor/atomic-widgets/custom-icon-libraries/enabled', '__return_true' );

		$glyphs = [];
		for ( $i = 0; $i < 300; $i++ ) {
			$glyphs[] = [ 'css' => "icon-$i", 'code' => 59392 + $i, 'search' => [ 'search' ] ];
		}

		add_filter(
			'elementor/icons_manager/additional_tabs',
			static function ( $tabs ) use ( $glyphs ) {
				$tabs['large-pack'] = [
					'name' => 'large-pack',
					'label' => 'Large Pack',
					'prefix' => 'lp-',
					'custom_icon_type' => 'fontello',
					'fetchJson' => [ 'url' => 'data:application/json;base64,' . base64_encode( wp_json_encode( [
						'glyphs' => $glyphs,
					] ) ) ],
					'native' => false,
				];

				return $tabs;
			}
		);

		$args = [ 'queries' => [ 'search' ], 'per_page' => 300 ];

		// Act.
		$response = Icon_Search::search( $args );
		$custom_libraries = $response['custom_libraries'];

		// Assert.
		$this->assertArrayHasKey( 'large-pack', $custom_libraries );
		$this->assertTrue( $custom_libraries['large-pack']['truncated'] );
		$this->assertSame( 300, $custom_libraries['large-pack']['total'] );
		$this->assertLessThanOrEqual( 250, count( $custom_libraries['large-pack']['values'] ) );
	}

	public function test_catalog__icon_value_format_matches_fixture() {
		// Arrange.
		$fixture_path = __DIR__ . '/../../../../fixtures/icon-value-format.json';
		$fixture = json_decode( file_get_contents( $fixture_path ), true );
		$this->assertIsArray( $fixture );
		$this->assertArrayHasKey( 'icons', $fixture );

		foreach ( $fixture['icons'] as $icon_case ) {
			$name = $icon_case['name'];
			$expected_values = $icon_case['expectedValues'];

			foreach ( $expected_values as $library => $expected_value ) {
				$catalog_entries = array_filter(
					Icon_Catalog::get_entries(),
					fn( $e ) => $e['name'] === $name && $e['library'] === $library
				);

				$this->assertNotEmpty( $catalog_entries, "Icon '$name' should exist in library '$library'" );

				$entry = array_values( $catalog_entries )[0];
				$actual_value = $entry['value'];

				$this->assertSame(
					$expected_value,
					$actual_value,
					"Icon '$name' in '$library' should have value format '$expected_value', got '$actual_value'"
				);
			}
		}
	}
}
