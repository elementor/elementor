<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Abstract_Ability_Accessors extends TestCase {

	public function test_get_kind__defaults_to_tool_when_no_mcp_meta() {
		// Arrange
		$ability = $this->tool_ability();

		// Act / Assert
		$this->assertSame( Abstract_Ability::KIND_TOOL, $ability->get_kind() );
	}

	public function test_get_kind__returns_resource_when_mcp_type_is_resource() {
		// Arrange
		$ability = $this->resource_ability();

		// Act / Assert
		$this->assertSame( Abstract_Ability::KIND_RESOURCE, $ability->get_kind() );
	}

	public function test_get_uri__returns_null_for_tool() {
		// Arrange
		$ability = $this->tool_ability();

		// Act / Assert
		$this->assertNull( $ability->get_uri() );
	}

	public function test_get_uri__returns_meta_uri_for_resource() {
		// Arrange
		$ability = $this->resource_ability();

		// Act / Assert
		$this->assertSame( 'elementor://test/thing', $ability->get_uri() );
	}

	public function test_get_mime_type__returns_meta_mime_for_resource() {
		// Arrange
		$ability = $this->resource_ability();

		// Act / Assert
		$this->assertSame( 'application/json', $ability->get_mime_type() );
	}

	public function test_get_proxy_slug__strips_elementor_prefix_for_tool() {
		// Arrange
		$ability = $this->tool_ability();

		// Act / Assert
		$this->assertSame( 'do-thing', $ability->get_proxy_slug() );
	}

	public function test_get_proxy_slug__returns_uri_for_resource() {
		// Arrange
		$ability = $this->resource_ability();

		// Act / Assert
		$this->assertSame( 'elementor://test/thing', $ability->get_proxy_slug() );
	}

	public function test_is_exposed_via_proxy__defaults_to_true() {
		// Arrange
		$ability = $this->tool_ability();

		// Act / Assert
		$this->assertTrue( $ability->is_exposed_via_proxy() );
	}

	public function test_is_exposed_on_server__defaults_to_true() {
		// Arrange
		$ability = $this->tool_ability();

		// Act / Assert
		$this->assertTrue( $ability->is_exposed_on_server() );
	}

	public function test_get_display_name__returns_definition_label() {
		// Arrange
		$ability = $this->tool_ability();

		// Act / Assert
		$this->assertSame( 'Test Tool', $ability->get_display_name() );
	}

	public function test_get_resource_description__returns_meta_description_for_resource() {
		// Arrange
		$ability = $this->resource_ability();

		// Act / Assert
		$this->assertSame( 'A test resource.', $ability->get_resource_description() );
	}

	private function tool_ability(): Abstract_Ability {
		return new class() extends Abstract_Ability {
			protected function get_ability_id(): string {
				return 'elementor/do-thing';
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition(
					'Test Tool',
					'Does a thing.',
					'elementor',
					[ 'type' => 'object' ],
					[],
					fn() => true
				);
			}

			public function execute( $input = [] ) {
				return [];
			}
		};
	}

	private function resource_ability(): Abstract_Ability {
		return new class() extends Abstract_Ability {
			protected function get_ability_id(): string {
				return 'elementor/test-thing';
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition(
					'Test Resource',
					'A test resource.',
					'elementor',
					[ 'type' => 'string' ],
					[
						'mcp' => [
							'type' => 'resource',
							'uri' => 'elementor://test/thing',
							'mimeType' => 'application/json',
							'description' => 'A test resource.',
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
