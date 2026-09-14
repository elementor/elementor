<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use PHPUnit\Framework\TestCase;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Map_Compiler extends TestCase {

	private function reason( WP_Error $error ): string {
		$data = $error->get_error_data( $error->get_error_code() );

		return is_array( $data ) ? (string) ( $data['reason'] ?? '' ) : '';
	}

	private function valid_map(): array {
		return [
			'widget_type' => 'heading',
			'description' => 'Heading widget.',
			'catalog_visibility' => V3_Widget_Map_Compiler::CATALOG_VISIBILITY_V4_DISABLED,
			'settings' => [
				'title' => [ 'type' => 'string' ],
			],
			'default_style_target' => 'heading',
			'style_targets' => [
				'heading' => [
					'label' => 'Heading',
					'css_properties' => [
						'color' => [
							'default' => Style_Control_Target::control( 'title_color', 'color' ),
						],
					],
				],
			],
		];
	}

	private function controls(): array {
		return [
			'title_color' => [ 'type' => 'color' ],
			'title_size' => [ 'type' => 'number' ],
		];
	}

	public function test_compile__returns_map_on_valid_input() {
		// Arrange.
		$compiler = new V3_Widget_Map_Compiler();

		// Act.
		$result = $compiler->compile( $this->valid_map(), $this->controls(), 'heading' );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( 'heading', $result['widget_type'] );
	}

	public function test_compile__errors_when_control_is_missing() {
		// Arrange.
		$compiler = new V3_Widget_Map_Compiler();
		$map = $this->valid_map();
		$map['style_targets']['heading']['css_properties']['color']['default'] = Style_Control_Target::control( 'nonexistent_color', 'color' );

		// Act.
		$result = $compiler->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'missing_control', $this->reason( $result ) );
	}

	public function test_compile__errors_when_resolver_incompatible_with_control_type() {
		// Arrange.
		$compiler = new V3_Widget_Map_Compiler();
		$map = $this->valid_map();
		$map['style_targets']['heading']['css_properties']['color']['default'] = Style_Control_Target::control( 'title_size', 'color' );

		// Act.
		$result = $compiler->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'incompatible_resolver', $this->reason( $result ) );
	}

	public function test_compile__errors_when_alias_is_invalid() {
		// Arrange.
		$compiler = new V3_Widget_Map_Compiler();
		$map = $this->valid_map();
		$map['style_targets']['Invalid_Alias'] = $map['style_targets']['heading'];
		unset( $map['style_targets']['heading'] );
		$map['default_style_target'] = 'Invalid_Alias';

		// Act.
		$result = $compiler->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_alias', $this->reason( $result ) );
	}

	public function test_compile__errors_when_widget_type_mismatch() {
		// Arrange.
		$compiler = new V3_Widget_Map_Compiler();

		// Act.
		$result = $compiler->compile( $this->valid_map(), $this->controls(), 'button' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'widget_type_mismatch', $this->reason( $result ) );
	}

	public function test_compile__errors_when_state_key_is_invalid() {
		// Arrange.
		$compiler = new V3_Widget_Map_Compiler();
		$map = $this->valid_map();
		$map['style_targets']['heading']['css_properties']['color']['defualt'] = Style_Control_Target::control( 'title_color', 'color' );
		unset( $map['style_targets']['heading']['css_properties']['color']['default'] );

		// Act.
		$result = $compiler->compile( $map, $this->controls(), 'heading' );

		// Assert.
		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_state_key', $this->reason( $result ) );
	}
}
