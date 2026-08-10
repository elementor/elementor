<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Registry;

use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Ability_Registry extends TestCase {

	public function test_add__stores_ability_and_returns_via_all() {
		// Arrange
		$registry = new Ability_Registry();
		$tool = $this->make_tool( 'elementor/test-tool' );

		// Act
		$registry->add( $tool );

		// Assert
		$this->assertSame( [ $tool ], $registry->all() );
	}

	public function test_add__deduplicates_by_id() {
		// Arrange
		$registry = new Ability_Registry();
		$first = $this->make_tool( 'elementor/test-tool' );
		$second = $this->make_tool( 'elementor/test-tool' );

		// Act
		$registry->add( $first );
		$registry->add( $second );

		// Assert
		$this->assertCount( 1, $registry->all() );
		$this->assertSame( $second, $registry->all()[0] );
	}

	public function test_tools_and_resources__partition_by_kind() {
		// Arrange
		$registry = new Ability_Registry();
		$tool = $this->make_tool( 'elementor/tool-a' );
		$resource = $this->make_resource( 'elementor/resource-a', 'elementor://res/a' );

		// Act
		$registry->add( $tool );
		$registry->add( $resource );

		// Assert
		$this->assertSame( [ $tool ], $registry->tools() );
		$this->assertSame( [ $resource ], $registry->resources() );
	}

	public function test_find_by_proxy_slug__matches_tool_by_short_slug() {
		// Arrange
		$registry = new Ability_Registry();
		$tool = $this->make_tool( 'elementor/get-thing' );
		$registry->add( $tool );

		// Act
		$found = $registry->find_by_proxy_slug( 'get-thing' );

		// Assert
		$this->assertSame( $tool, $found );
	}

	public function test_find_by_proxy_slug__skips_tools_not_exposed_via_proxy() {
		// Arrange
		$registry = new Ability_Registry();
		$tool = $this->make_tool( 'elementor/hidden', false );
		$registry->add( $tool );

		// Act
		$found = $registry->find_by_proxy_slug( 'hidden' );

		// Assert
		$this->assertNull( $found );
	}

	public function test_find_resource_by_uri__matches_resource() {
		// Arrange
		$registry = new Ability_Registry();
		$resource = $this->make_resource( 'elementor/res', 'elementor://res/x' );
		$registry->add( $resource );

		// Act
		$found = $registry->find_resource_by_uri( 'elementor://res/x' );

		// Assert
		$this->assertSame( $resource, $found );
	}

	public function test_find_resource_by_uri__returns_null_for_unknown_uri() {
		// Arrange
		$registry = new Ability_Registry();

		// Act
		$found = $registry->find_resource_by_uri( 'elementor://missing' );

		// Assert
		$this->assertNull( $found );
	}

	private function make_tool( string $id, bool $exposed = true ): Abstract_Ability {
		return new class( $id, $exposed ) extends Abstract_Ability {
			private string $id_value;
			private bool $exposed;

			public function __construct( string $id, bool $exposed ) {
				$this->id_value = $id;
				$this->exposed = $exposed;
			}

			protected function get_ability_id(): string {
				return $this->id_value;
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition(
					'Test',
					'Test',
					'elementor',
					[ 'type' => 'object' ],
					[],
					fn() => true
				);
			}

			public function execute( $input = [] ) {
				return [];
			}

			public function is_exposed_via_proxy(): bool {
				return $this->exposed;
			}
		};
	}

	private function make_resource( string $id, string $uri ): Abstract_Ability {
		return new class( $id, $uri ) extends Abstract_Ability {
			private string $id_value;
			private string $uri_value;

			public function __construct( string $id, string $uri ) {
				$this->id_value = $id;
				$this->uri_value = $uri;
			}

			protected function get_ability_id(): string {
				return $this->id_value;
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition(
					'Test Resource',
					'Desc',
					'elementor',
					[ 'type' => 'string' ],
					[
						'mcp' => [
							'type' => 'resource',
							'uri' => $this->uri_value,
							'mimeType' => 'text/plain',
							'description' => 'Desc',
						],
					],
					fn() => true
				);
			}

			public function execute( $input = [] ) {
				return '';
			}
		};
	}
}
