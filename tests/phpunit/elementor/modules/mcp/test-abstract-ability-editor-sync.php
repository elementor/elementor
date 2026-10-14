<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Abstract_Ability_Editor_Sync extends Elementor_Test_Base {

	const GUARD_ERROR_CODE = 'test_guard_blocked';

	private int $post_id;

	public function setUp(): void {
		parent::setUp();

		$this->post_id = self::factory()->post->create();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/mcp/pre_execute_guard' );
		Editor_Sync_State::delete_mcp_mutation( $this->post_id );

		parent::tearDown();
	}

	public function test_execute_guarded__marks_page_when_ability_mutates_page() {
		// Arrange
		$ability = $this->make_ability( [ 'mutates_page' => true ] );

		// Act
		$ability->execute_guarded( [ 'post_id' => $this->post_id ] );

		// Assert
		$this->assertGreaterThan( 0, Editor_Sync_State::get_mcp_mutation_time( $this->post_id ) );
	}

	public function test_execute_guarded__does_not_mark_page_when_destructive_without_mutates_page() {
		// Arrange
		$ability = $this->make_ability( [ 'annotations' => [ 'destructive' => true ] ] );

		// Act
		$ability->execute_guarded( [ 'post_id' => $this->post_id ] );

		// Assert
		$this->assertSame( 0, Editor_Sync_State::get_mcp_mutation_time( $this->post_id ) );
	}

	public function test_execute_guarded__marks_page_when_mutates_page_and_not_destructive() {
		// Arrange
		$ability = $this->make_ability( [
			'mutates_page' => true,
			'annotations' => [ 'destructive' => false ],
		] );

		// Act
		$ability->execute_guarded( [ 'post_id' => $this->post_id ] );

		// Assert
		$this->assertGreaterThan( 0, Editor_Sync_State::get_mcp_mutation_time( $this->post_id ) );
	}

	public function test_execute_guarded__does_not_mark_page_when_execution_fails() {
		// Arrange
		$ability = $this->make_ability( [ 'mutates_page' => true ], [ 'status' => 'error' ] );

		// Act
		$ability->execute_guarded( [ 'post_id' => $this->post_id ] );

		// Assert
		$this->assertSame( 0, Editor_Sync_State::get_mcp_mutation_time( $this->post_id ) );
	}

	public function test_execute_guarded__does_not_mark_page_for_resource() {
		// Arrange
		$ability = $this->make_ability( [
			'mutates_page' => true,
			'mcp' => [ 'type' => 'resource' ],
		] );

		// Act
		$ability->execute_guarded( [ 'post_id' => $this->post_id ] );

		// Assert
		$this->assertSame( 0, Editor_Sync_State::get_mcp_mutation_time( $this->post_id ) );
	}

	public function test_execute_guarded__runs_guard_when_ability_mutates_page() {
		// Arrange
		$this->block_with_guard();
		$ability = $this->make_ability( [
			'mutates_page' => true,
			'annotations' => [ 'destructive' => false ],
		] );

		// Act
		$result = $ability->execute_guarded( [ 'post_id' => $this->post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( self::GUARD_ERROR_CODE, $result->get_error_code() );
		$this->assertSame( 0, Editor_Sync_State::get_mcp_mutation_time( $this->post_id ) );
	}

	public function test_execute_guarded__skips_guard_when_destructive_without_mutates_page() {
		// Arrange
		$this->block_with_guard();
		$ability = $this->make_ability( [ 'annotations' => [ 'destructive' => true ] ] );

		// Act
		$result = $ability->execute_guarded( [ 'post_id' => $this->post_id ] );

		// Assert
		$this->assertSame( [ 'status' => 'ok' ], $result );
	}

	private function block_with_guard(): void {
		add_filter( 'elementor/mcp/pre_execute_guard', fn() => new \WP_Error( self::GUARD_ERROR_CODE ) );
	}

	private function make_ability( array $meta, array $result = [ 'status' => 'ok' ] ): Abstract_Ability {
		return new class( $meta, $result ) extends Abstract_Ability {
			private array $meta;
			private array $result;

			public function __construct( array $meta, array $result ) {
				$this->meta = $meta;
				$this->result = $result;
			}

			protected function get_ability_id(): string {
				return 'elementor/test-editor-sync';
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition(
					'Test Editor Sync',
					'Test ability.',
					'elementor',
					[ 'type' => 'object' ],
					$this->meta,
					fn() => true
				);
			}

			public function is_available() {
				return true;
			}

			public function execute( $input = [] ) {
				return $this->result;
			}
		};
	}
}
