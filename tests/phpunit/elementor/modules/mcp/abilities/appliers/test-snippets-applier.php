<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\DataFlow\Snippet_References;
use Elementor\Modules\DataFlow\Snippets\Snippet_Store;
use Elementor\Modules\Mcp\Abilities\Appliers\Snippets_Applier;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Snippets_Applier extends Elementor_Test_Base {

	const CLICK_REFERENCE = [
		'snippet' => 'counter',
		'event' => 'click',
	];

	public function setUp(): void {
		parent::setUp();

		Snippet_Store::register_post_type();
		$this->act_as_admin();
		Snippet_Store::save( 'counter', [
			[
				'event' => 'click',
				'description' => 'Adds one',
				'code' => '({ state }) => { state.count += 1; }',
			],
		] );
	}

	public function tearDown(): void {
		Snippet_Store::delete( 'counter' );

		parent::tearDown();
	}

	public function test_apply__writes_resolvable_references_to_indexed_node() {
		// Arrange
		$node = [ 'id' => 'abc' ];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Snippets_Applier() )->apply( $index, [ 'button' => [ self::CLICK_REFERENCE ] ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertSame( [ self::CLICK_REFERENCE ], $node[ Snippet_References::DATA_KEY ] );
	}

	public function test_apply__empty_list_clears_references() {
		// Arrange
		$node = [
			'id' => 'abc',
			Snippet_References::DATA_KEY => [ self::CLICK_REFERENCE ],
		];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Snippets_Applier() )->apply( $index, [ 'button' => [] ] );

		// Assert
		$this->assertTrue( $warnings->is_empty() );
		$this->assertSame( [], $node[ Snippet_References::DATA_KEY ] );
	}

	public function test_apply__warns_on_unknown_configuration_id() {
		// Arrange
		$index = [];

		// Act
		$warnings = ( new Snippets_Applier() )->apply( $index, [ 'ghost' => [ self::CLICK_REFERENCE ] ] );

		// Assert
		$this->assertSame( [ 'snippets_unknown_configuration_id' ], $warnings->codes() );
		$this->assertSame( 'ghost', $warnings->all()[0]['config_id'] );
	}

	public function test_apply__drops_unresolvable_references_and_warns_with_specific_codes() {
		// Arrange
		$node = [ 'id' => 'abc' ];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Snippets_Applier() )->apply( $index, [
			'button' => [
				self::CLICK_REFERENCE,
				[ 'snippet' => 'missing', 'event' => 'click' ],
				[ 'snippet' => 'counter', 'event' => 'input' ],
				[ 'snippet' => 'counter', 'event' => 'scroll' ],
			],
		] );

		// Assert
		$this->assertSame( [ self::CLICK_REFERENCE ], $node[ Snippet_References::DATA_KEY ] );
		$this->assertEqualsCanonicalizing(
			[ 'snippet_reference_invalid', 'snippet_not_found', 'snippet_event_not_defined' ],
			$warnings->codes()
		);
	}

	public function test_apply__warns_when_current_user_cannot_manage_snippets() {
		// Arrange
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'author' ] ) );
		$node = [ 'id' => 'abc' ];
		$index = [ 'button' => &$node ];

		// Act
		$warnings = ( new Snippets_Applier() )->apply( $index, [ 'button' => [ self::CLICK_REFERENCE ] ] );

		// Assert
		$this->assertContains( 'snippets_stripped_on_save', $warnings->codes() );
	}
}
