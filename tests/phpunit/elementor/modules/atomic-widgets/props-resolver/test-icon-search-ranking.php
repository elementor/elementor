<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Search_Ranking extends Elementor_Test_Base {

	const TOP_THREE = 3;

	public function setUp(): void {
		parent::setUp();

		add_filter(
			'elementor/atomic-widgets/icons/search-index-path',
			fn() => ELEMENTOR_PATH . 'tests/fixtures/icon-search-ranking-index.json'
		);

		Icon_Catalog::reset();
		Icon_Matcher::reset();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/atomic-widgets/icons/search-index-path' );

		Icon_Catalog::reset();
		Icon_Matcher::reset();

		parent::tearDown();
	}

	public function test_search__cart_returns_cart_shopping_in_the_top_three() {
		// Act.
		$values = $this->search_values( 'cart' );

		// Assert.
		$this->assertContains( 'fa-solid fa-cart-shopping', array_slice( $values, 0, self::TOP_THREE ) );
	}

	public function test_search__arrow_returns_arrow_icons_first() {
		// Act.
		$names = $this->search_names( 'arrow' );

		// Assert.
		foreach ( array_slice( $names, 0, self::TOP_THREE ) as $name ) {
			$this->assertStringStartsWith( 'arrow-', $name );
		}
	}

	public function test_search__arrow_right_prefers_the_exact_icon_then_arrow_right_variants() {
		// Act.
		$names = $this->search_names( 'arrow right' );

		// Assert.
		$this->assertSame( 'arrow-right', $names[0] );
		$this->assertStringStartsWith( 'arrow-right-', $names[1] );
		$this->assertStringStartsWith( 'arrow-right-', $names[2] );
	}

	public function test_search__email_returns_envelope_in_the_top_three() {
		// Act.
		$names = $this->search_names( 'email' );

		// Assert.
		$this->assertContains( 'envelope', array_slice( $names, 0, self::TOP_THREE ) );
	}

	public function test_search__user_returns_user_then_users_before_user_variants() {
		// Act.
		$names = array_values( array_unique( $this->search_names( 'user' ) ) );

		// Assert.
		$this->assertSame( [ 'user', 'users' ], array_slice( $names, 0, 2 ) );
	}

	public function test_search__fewer_name_words_rank_before_longer_names_with_the_same_score() {
		// Act.
		$names = $this->search_names( 'cart' );

		// Assert.
		$this->assertLessThan(
			array_search( 'cart-flatbed-suitcase', $names, true ),
			array_search( 'cart-shopping', $names, true )
		);
	}

	public function test_search__library_token_filters_to_that_library_and_drops_the_prefix() {
		// Act.
		$matches = $this->search( 'fa-solid fa-star' )['matches'];

		// Assert.
		$this->assertSame( 'fa-solid fa-star', $matches[0]['value'] );
		$this->assertSame( [ 'fa-solid' ], array_values( array_unique( array_column( $matches, 'library' ) ) ) );
	}

	public function test_search__library_token_alone_browses_that_library() {
		// Act.
		$result = $this->search( 'fa-brands' );

		// Assert.
		$this->assertGreaterThan( 0, $result['total'] );
		$this->assertSame( [ 'fa-brands' ], array_values( array_unique( array_column( $result['matches'], 'library' ) ) ) );
		$this->assertSame( [ Icon_Matcher::MATCHED_ON_LIBRARY ], array_values( array_unique( array_column( $result['matches'], 'matched_on' ) ) ) );
	}

	public function test_search__short_query_matches_whole_word_names() {
		// Act.
		$names = $this->search_names( 'up' );

		// Assert.
		$this->assertContains( 'up-down', $names );
		$this->assertContains( 'up-long', $names );
	}

	public function test_search__single_letter_query_matches_the_exact_name_first() {
		// Act.
		$names = $this->search_names( 'x' );

		// Assert.
		$this->assertSame( 'x', $names[0] );
	}

	public function test_search__short_query_does_not_match_inside_other_words() {
		// Act.
		$names = $this->search_names( 'up' );

		// Assert.
		$this->assertNotContains( 'cup', $names );
		$this->assertNotContains( 'group', $names );
	}

	private function search( string $query ): array {
		$response = Icon_Search::search( [ 'queries' => [ $query ], 'per_page' => Icon_Search::MAX_PER_PAGE ] );

		return $response['results'][0];
	}

	private function search_values( string $query ): array {
		return array_column( $this->search( $query )['matches'], 'value' );
	}

	private function search_names( string $query ): array {
		return array_column( $this->search( $query )['matches'], 'name' );
	}
}
