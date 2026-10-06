<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Diagnostics;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Style_Reader;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Block_Renderer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Style_Reader extends Elementor_Test_Base {

	const WIDGET_TYPE = 'heading';

	const CUSTOM_WIDTH = 'initial';

	private function controls(): array {
		return [
			'_element_width' => [
				'type' => 'select',
				'is_responsive' => true,
				'responsive' => [],
			],
			'_element_custom_width' => [
				'type' => 'slider',
				'is_responsive' => true,
				'responsive' => [],
				'condition' => [ '_element_width' => self::CUSTOM_WIDTH ],
			],
		];
	}

	private function read( array $settings ): string {
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Heading widget.' )
			->default_target( Style_Target::make( 'heading' )->bind( 'width', V3_Control::bind_to( '_element_custom_width' )->responsive() ) );
		$compiled = ( new V3_Widget_Map_Compiler() )->compile( $map, $this->controls(), new V3_Map_Diagnostics(), self::WIDGET_TYPE );
		$widget = Plugin::$instance->widgets_manager->get_widget_types( self::WIDGET_TYPE );

		$blocks = ( new V3_Map_Style_Reader( V3_Control_Adapter_Registry::create_default() ) )->read(
			$compiled,
			$settings,
			$this->controls(),
			fn( array $control, array $values, array $controls ): bool => (bool) $widget->is_control_visible( $control, $values, $controls )
		);

		return ( new Block_Renderer() )->render_targets( $blocks, 'heading' );
	}

	public function test_read__checks_a_device_value_against_the_same_device_condition() {
		// Act.
		$css = $this->read( [
			'_element_width_mobile' => self::CUSTOM_WIDTH,
			'_element_custom_width_mobile' => [
				'unit' => 'px',
				'size' => 150,
			],
		] );

		// Assert.
		$this->assertSame( '@media(--mobile) { width: 150px; }', $css );
	}

	public function test_read__falls_back_to_the_desktop_condition_when_the_device_is_unset() {
		// Act.
		$css = $this->read( [
			'_element_width' => self::CUSTOM_WIDTH,
			'_element_custom_width_mobile' => [
				'unit' => 'px',
				'size' => 150,
			],
		] );

		// Assert.
		$this->assertSame( '@media(--mobile) { width: 150px; }', $css );
	}

	public function test_read__hides_a_device_value_whose_condition_is_unmet() {
		// Act.
		$css = $this->read( [
			'_element_custom_width_mobile' => [
				'unit' => 'px',
				'size' => 150,
			],
		] );

		// Assert.
		$this->assertSame( '', $css );
	}
}
