<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Prompt_Loader_Icon_Library extends Elementor_Test_Base {

	private string $original_svg_library_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_svg_library_state = Plugin::$instance->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY )['default'];
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, $this->original_svg_library_state );

		parent::tearDown();
	}

	public function test_load__includes_icon_guidance_when_the_experiment_is_active() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, Experiments_Manager::STATE_ACTIVE );

		// Act.
		$prompt = Prompt_Loader::load( 'build-composition' );

		// Assert.
		$this->assertStringContainsString( 'elementor/find-icons', $prompt );
		$this->assertStringContainsString( '# ICONS', $prompt );
		$this->assertStringNotContainsString( 'svg_library', $prompt );
	}

	public function test_load__omits_icon_guidance_when_the_experiment_is_inactive() {
		// Arrange.
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, Experiments_Manager::STATE_INACTIVE );

		// Act.
		$prompt = Prompt_Loader::load( 'build-composition' );

		// Assert.
		$this->assertStringNotContainsString( 'find-icons', $prompt );
		$this->assertStringNotContainsString( '# ICONS', $prompt );
		$this->assertStringNotContainsString( 'svg_library', $prompt );
		$this->assertStringContainsString( '# INTERACTIONS', $prompt );
	}
}
