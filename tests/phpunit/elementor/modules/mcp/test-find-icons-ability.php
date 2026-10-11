<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Find_Icons_Ability;
use Elementor\Modules\Mcp\Utils\Mcp_V4_Gate;
use Elementor\Plugin;
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

	private string $original_svg_library_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_svg_library_state = Plugin::$instance->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY )['default'];

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
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, $this->original_svg_library_state );
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

	public function test_is_available__returns_error_when_svg_library_experiment_inactive() {
		$this->act_as_editor();

		$admin_id = $this->factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $admin_id );

		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, Experiments_Manager::STATE_INACTIVE );

		$availability = $this->ability->is_available();

		$this->assertWPError( $availability );
		$this->assertSame( 'elementor_svg_library_inactive', $availability->get_error_code() );
		$this->assertStringContainsString( 'SVG icon library experiment', $availability->get_error_message() );
	}
}
