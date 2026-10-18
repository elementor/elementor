<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Ability_Annotations extends Elementor_Test_Base {

	const DESTRUCTIVE_TOOL_IDS = [
		'elementor/manage-classes',
		'elementor/manage-component',
		'elementor/manage-default-styles',
		'elementor/manage-experiments',
		'elementor/manage-global-variable',
		'elementor/publish-document',
		'elementor/reorder-classes',
		'elementor/update-page-settings',
	];

	public function test_tools__declare_readonly_and_destructive_explicitly() {
		// Arrange
		$definitions = $this->tool_definitions();

		// Act
		$missing = array_keys( array_filter(
			$definitions,
			fn( Ability_Definition $definition ) => ! isset(
				$definition->meta['annotations']['readonly'],
				$definition->meta['annotations']['destructive']
			)
		) );

		// Assert
		$this->assertSame( [], $missing );
	}

	public function test_tools__only_global_and_publish_tools_are_destructive() {
		// Arrange
		$definitions = $this->tool_definitions();

		// Act
		$destructive_ids = array_keys( array_filter(
			$definitions,
			fn( Ability_Definition $definition ) => true === ( $definition->meta['annotations']['destructive'] ?? null )
		) );
		sort( $destructive_ids );

		// Assert
		$this->assertSame( self::DESTRUCTIVE_TOOL_IDS, $destructive_ids );
	}

	public function test_tools__declare_mutates_page_explicitly() {
		// Arrange
		$definitions = $this->tool_definitions();

		// Act
		$missing = array_keys( array_filter(
			$definitions,
			fn( Ability_Definition $definition ) => ! is_bool( $definition->meta['mutates_page'] ?? null )
		) );

		// Assert
		$this->assertSame( [], $missing );
	}

	/** @return array<string, Ability_Definition> */
	private function tool_definitions(): array {
		$definitions = [];

		foreach ( Module::build_core_registry()->tools() as $tool ) {
			$definitions[ $tool->get_id() ] = $this->definition_of( $tool );
		}

		return $definitions;
	}

	private function definition_of( Abstract_Ability $ability ): Ability_Definition {
		$method = new \ReflectionMethod( Abstract_Ability::class, 'definition' );
		$method->setAccessible( true );

		return $method->invoke( $ability );
	}
}
