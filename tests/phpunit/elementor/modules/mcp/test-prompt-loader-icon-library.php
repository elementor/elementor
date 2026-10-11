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
		$this->assertStringStartsWith( $this->get_source_without_markers(), $prompt );
		$this->assertMatchesRegularExpression( '/elementor\/find-icons`[^\n]*\n- `elementor\/list-components`/', $prompt );
		$this->assertStringContainsString( "\n\n# INTERACTIONS", $prompt );
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
		$this->assertStringNotContainsString( "\n\n\n", $prompt );
		$this->assertStringContainsString( "Generous padding on CTAs: min 1rem 2.5rem\n\n# INTERACTIONS", $prompt );
		$this->assertMatchesRegularExpression( '/elementor\/list-assets`[^\n]*\n- `elementor\/list-components`/', $prompt );
	}

	private function get_source_without_markers(): string {
		$source = (string) file_get_contents( ELEMENTOR_PATH . 'modules/mcp/static-resources/abilities/build-composition.md' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		return rtrim( str_replace( [ '<!--if:svg_library-->', '<!--endif:svg_library-->' ], '', $source ) );
	}
}
