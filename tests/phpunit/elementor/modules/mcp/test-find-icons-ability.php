<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
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
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/atomic-widgets/icons/search-index-path' );

		if ( file_exists( $this->fixture_path ) ) {
			unlink( $this->fixture_path );
		}

		Icon_Catalog::reset();

		parent::tearDown();
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

	public function test_permission__requires_edit_posts() {
		// Arrange.
		$method = new \ReflectionMethod( $this->ability, 'get_definition' );
		$method->setAccessible( true );
		$permission_callback = $method->invoke( $this->ability )->permission_callback;

		// Act & Assert.
		$this->act_as( 'subscriber' );
		$this->assertFalse( $permission_callback() );

		$this->act_as( 'editor' );
		$this->assertTrue( $permission_callback() );
	}

	public function test_execute__handles_a_non_array_input() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = $this->ability->execute( 'not-an-array' );

		// Assert.
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_icon_search_invalid_request', $result->get_error_code() );
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

	public function test_execute__omits_the_instruction_for_a_page_past_the_last_match() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$result = $this->ability->execute( [ 'queries' => [ 'cart-shopping' ], 'page' => 999 ] );

		// Assert.
		$this->assertSame( [], $result['results'][0]['matches'] );
		$this->assertArrayNotHasKey( 'llm_instructions', $result );
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
}
