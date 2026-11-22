<?php

namespace Elementor\Testing\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\CompositeWidgets\Mcp\Composite_Widgets_Resource_Ability;
use Elementor\Modules\CompositeWidgets\Mcp\Mcp_Integration;
use Elementor\Modules\CompositeWidgets\Mcp\Widget_Instance_Expander;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Tag_Expanders;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use Elementor\Testing\Modules\CompositeWidgets\Fixtures\Composite_Widgets_Registry_Factory;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/../fixtures/composite-widgets-registry-factory.php';

class Test_Mcp_Integration extends Elementor_Test_Base {

	const PROMPT_SECTION_HEADING = '# COMPOSITE WIDGETS';

	public function setUp(): void {
		parent::setUp();

		remove_all_filters( Tag_Expanders::FILTER );
		remove_all_filters( Prompt_Loader::PROMPT_FILTER );
	}

	public function test_register_hooks__adds_the_widget_tag_resource_and_prompt_section() {
		// Arrange.
		$integration = new Mcp_Integration( fn () => Composite_Widgets_Registry_Factory::make() );
		$ability_registry = new Ability_Registry();

		// Act.
		$integration->register_hooks();
		$integration->add_resource( $ability_registry );

		// Assert.
		$expanders = apply_filters( Tag_Expanders::FILTER, [] );
		$this->assertCount( 1, $expanders );
		$this->assertInstanceOf( Widget_Instance_Expander::class, $expanders[0] );

		$this->assertInstanceOf( Composite_Widgets_Resource_Ability::class, $ability_registry->find_resource_by_uri( Composite_Widgets_Resource_Ability::URI ) );

		$this->assertStringContainsString( self::PROMPT_SECTION_HEADING, Prompt_Loader::load( 'build-composition' ) );
		$this->assertStringNotContainsString( self::PROMPT_SECTION_HEADING, Prompt_Loader::load( 'manage-component' ) );
	}

	public function test_prompts__have_no_widget_section_without_the_integration() {
		// Act.
		$prompt = Prompt_Loader::load( 'build-composition' );

		// Assert.
		$this->assertStringNotContainsString( self::PROMPT_SECTION_HEADING, $prompt );
	}
}
