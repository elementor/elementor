<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Find_Icons_Ability;
use Elementor\Modules\Mcp\Utils\Mcp_V4_Gate;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Find_Icons_Ability extends Elementor_Test_Base {

	private Find_Icons_Ability $ability;
	private string $fixture_path;

	public function setUp(): void {
		parent::setUp();

		$this->ability = new Find_Icons_Ability();
		$this->fixture_path = get_temp_dir() . 'find-icons-' . wp_generate_password( 8, false ) . '.json';

		file_put_contents( $this->fixture_path, wp_json_encode( [
			'icons' => [
				[
					'name' => 'cart-shopping',
					'library' => 'fa-solid',
					'value' => 'fa-solid fa-cart-shopping',
					'label' => 'Cart Shopping',
					'aliases' => [ 'shopping-cart' ],
					'terms' => [ 'buy', 'cart', 'checkout' ],
					'categories' => [ 'shopping' ],
					'license' => 'free',
				],
			],
		] ) );

		add_filter( 'elementor/atomic-widgets/icons/search-index-path', fn() => $this->fixture_path );

		Icon_Catalog::reset();
		Icon_Matcher::reset();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/atomic-widgets/icons/search-index-path' );

		if ( file_exists( $this->fixture_path ) ) {
			unlink( $this->fixture_path );
		}

		Icon_Catalog::reset();
		Icon_Matcher::reset();

		parent::tearDown();
	}

	public function test_get_id__is_stable() {
		// Act & Assert — the id is part of the public MCP surface.
		$this->assertSame( 'elementor/find-icons', $this->ability->get_id() );
	}

	public function test_ability__is_a_read_only_tool() {
		// Act & Assert.
		$this->assertSame( Abstract_Ability::KIND_TOOL, $this->ability->get_kind() );
		$this->assertSame( 'find-icons', $this->ability->get_proxy_slug() );
	}

	public function test_ability__is_gated_behind_the_atomic_editor() {
		// Act & Assert — e-svg only exists in v4.
		$this->assertTrue( Mcp_V4_Gate::is_gated( $this->ability->get_id() ) );
	}

	public function test_execute__returns_403_for_subscriber() {
		// Arrange.
		$user_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );

		// Act.
		$result = $this->ability->execute( [ 'queries' => [ 'cart' ] ] );

		// Assert.
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_the_writable_icon_pair() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = $this->ability->execute( [ 'queries' => [ 'cart-shopping' ] ] );

		// Assert.
		$match = $result['results'][0]['matches'][0];
		$this->assertSame( 'fa-solid fa-cart-shopping', $match['value'] );
		$this->assertSame( 'fa-solid', $match['library'] );
	}

	public function test_execute__accepts_the_search_shorthand() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = $this->ability->execute( [ 'search' => 'cart-shopping' ] );

		// Assert.
		$this->assertCount( 1, $result['results'] );
		$this->assertNotEmpty( $result['results'][0]['matches'] );
	}

	public function test_execute__handles_a_non_array_input() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = $this->ability->execute( 'not-an-array' );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( [], $result['results'] );
	}

	public function test_execute__adds_an_instruction_when_nothing_matches() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = $this->ability->execute( [ 'queries' => [ 'nothing-like-this-exists' ] ] );

		// Assert.
		$this->assertSame( 0, $result['results'][0]['total'] );
		$this->assertSame( Find_Icons_Ability::EMPTY_RESULT_HINT, $result['llm_instructions'] );
	}

	public function test_execute__omits_the_instruction_when_something_matches() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = $this->ability->execute( [ 'queries' => [ 'cart-shopping' ] ] );

		// Assert.
		$this->assertArrayNotHasKey( 'llm_instructions', $result );
	}

	public function test_execute__clamps_per_page_to_the_maximum() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = $this->ability->execute( [ 'queries' => [ 'cart' ], 'per_page' => 9999 ] );

		// Assert.
		$this->assertSame( Icon_Search::MAX_PER_PAGE, $result['results'][0]['per_page'] );
	}

	public function test_is_available__reports_a_missing_catalog() {
		// Arrange.
		remove_all_filters( 'elementor/atomic-widgets/icons/search-index-path' );
		add_filter(
			'elementor/atomic-widgets/icons/search-index-path',
			fn() => get_temp_dir() . 'definitely-missing-index.json'
		);
		Icon_Catalog::reset();

		// Act.
		$availability = $this->ability->is_available();

		// Assert.
		$this->assertWPError( $availability );
		$this->assertSame( 'elementor_icon_catalog_unavailable', $availability->get_error_code() );
		$this->assertSame(
			Find_Icons_Ability::CATALOG_MISSING_NOTICE,
			$availability->get_error_data()['description_notice']
		);
	}

	public function test_input_schema__documents_the_batch_queries_limit() {
		// Act.
		$get_definition = new \ReflectionMethod( Find_Icons_Ability::class, 'get_definition' );

		$schema = $get_definition->invoke( $this->ability )->input_schema;

		// Assert.
		$this->assertSame( Icon_Search::MAX_QUERIES, $schema['properties']['queries']['maxItems'] );
		$this->assertSame( Icon_Search::MAX_PER_PAGE, $schema['properties']['per_page']['maximum'] );
	}

	public function test_description__tells_agents_not_to_assemble_icon_values() {
		// Act.
		$description = $this->ability->get_description_for_llm();

		// Assert.
		$this->assertStringContainsString( 'e-svg', $description );
		$this->assertStringContainsString( 'fa-solid fa-cart-shopping', $description );
	}
}
