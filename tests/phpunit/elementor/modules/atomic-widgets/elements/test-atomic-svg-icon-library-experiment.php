<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Icon_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Svg_Icon_Library_Experiment extends Elementor_Test_Base {
	private string $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		$feature = Plugin::$instance->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY );

		$this->original_experiment_default_state = $feature['default'];
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY,
			$this->original_experiment_default_state
		);

		parent::tearDown();
	}

	public function test_experiment_is_registered() {
		// Act
		$feature = Plugin::$instance->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY );

		// Assert
		$this->assertIsArray( $feature );
		$this->assertSame( Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY, $feature['name'] );
		$this->assertTrue( $feature['hidden'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $feature['release_status'] );
	}

	public function test_icon_library_control_is_hidden_when_experiment_is_inactive() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act
		$props = $this->get_svg_control_props();

		// Assert
		$this->assertFalse( $props['showIconLibrary'] );
	}

	public function test_icon_library_control_is_shown_when_experiment_is_active() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act
		$props = $this->get_svg_control_props();

		// Assert
		$this->assertTrue( $props['showIconLibrary'] );
	}

	public function test_svg_schema_includes_icon_when_experiment_is_inactive() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_ICON_LIBRARY,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act
		$schema = Atomic_Svg::get_props_schema();

		// Assert
		$this->assertInstanceOf( Union_Prop_Type::class, $schema['svg'] );
		$this->assertInstanceOf( Icon_Prop_Type::class, $schema['svg']->get_prop_type( Icon_Prop_Type::get_key() ) );
	}

	private function get_svg_control_props(): array {
		$widget = new Atomic_Svg( [], [] );

		foreach ( $widget->get_atomic_controls() as $section ) {
			if ( ! $section instanceof Section ) {
				continue;
			}

			foreach ( $section->get_items() as $item ) {
				if ( $item instanceof Svg_Control ) {
					return $item->get_props();
				}
			}
		}

		$this->fail( 'SVG control was not found.' );
	}
}
