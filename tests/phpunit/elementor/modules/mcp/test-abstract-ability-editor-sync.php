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

	private int $post_id;

	public function setUp(): void {
		parent::setUp();

		$this->post_id = self::factory()->post->create();
	}

	public function tearDown(): void {
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

	public function test_add_server_time_to_config__adds_current_server_time() {
		// Arrange
		$sync_state = new Editor_Sync_State();
		$before = time();

		// Act
		$config = $sync_state->add_server_time_to_config( [ 'existing' => 'value' ] );

		// Assert
		$this->assertSame( 'value', $config['existing'] );
		$this->assertGreaterThanOrEqual( $before, $config['server_time'] );
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
