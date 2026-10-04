<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Setting_Schemas;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Settings_Compiler;
use PHPUnit\Framework\TestCase;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Settings_Compiler extends TestCase {

	private function controls(): array {
		return [
			'layout' => [
				'type' => 'select',
				'options' => [
					'horizontal' => 'Horizontal',
					'vertical' => 'Vertical',
					'dropdown' => 'Dropdown',
				],
			],
			'submenu_icon' => [ 'type' => 'icons' ],
			'full_width' => [
				'type' => 'switcher',
				'return_value' => 'stretch',
				'condition' => [ 'layout' => 'dropdown' ],
			],
			'menu_name' => [ 'type' => 'text' ],
		];
	}

	public function test_compile__resolves_enum_from_control_options() {
		// Arrange.
		$settings = [ 'layout' => Setting_Schemas::enum_from_control() ];

		// Act.
		$result = ( new V3_Map_Settings_Compiler() )->compile( $settings, $this->controls() );

		// Assert.
		$this->assertSame( [ 'horizontal', 'vertical', 'dropdown' ], $result['layout']['enum'] );
	}

	public function test_compile__converts_switcher_to_control_return_value_and_copies_condition() {
		// Arrange.
		$settings = [ 'stretch' => Setting_Schemas::switcher( 'full_width' ) ];

		// Act.
		$result = ( new V3_Map_Settings_Compiler() )->compile( $settings, $this->controls() );

		// Assert.
		$this->assertSame( 'boolean', $result['stretch']['type'] );
		$this->assertSame( [ 'true' => 'stretch', 'false' => '' ], $result['stretch']['convert'] );
		$this->assertSame( [ 'layout' => 'dropdown' ], $result['stretch']['condition'] );
	}

	public function test_compile__accepts_icons_on_icons_control() {
		// Arrange.
		$settings = [ 'submenu_icon' => Setting_Schemas::icons() ];

		// Act.
		$result = ( new V3_Map_Settings_Compiler() )->compile( $settings, $this->controls() );

		// Assert.
		$this->assertSame( [ 'value', 'library' ], array_keys( $result['submenu_icon']['properties'] ) );
	}

	public function test_compile__errors_when_setting_kind_does_not_match_control_type() {
		// Arrange.
		$settings = [ 'menu_name' => Setting_Schemas::switcher() ];

		// Act.
		$result = ( new V3_Map_Settings_Compiler() )->compile( $settings, $this->controls() );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'incompatible_setting_shape', $result->get_error_message() );
	}

	public function test_compile__errors_when_control_is_missing() {
		// Arrange.
		$settings = [ 'pointer' => Setting_Schemas::enum_from_control() ];

		// Act.
		$result = ( new V3_Map_Settings_Compiler() )->compile( $settings, $this->controls() );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_control', $result->get_error_message() );
	}
}
