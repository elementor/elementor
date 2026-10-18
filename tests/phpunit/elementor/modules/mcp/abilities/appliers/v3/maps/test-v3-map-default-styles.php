<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Default_Styles;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Diagnostics;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Style_Reader;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Default_Styles extends Elementor_Test_Base {

	const WIDGET_TYPE = 'defaults-widget';

	const PRIMARY_COLOR = 'globals/colors?id=primary';

	const PRIMARY_TYPOGRAPHY = 'globals/typography?id=primary';

	const KIT_PRIMARY_HEX = '#6EC1E4';

	const BOX_SHAPE = 'box';

	const DEFAULT_PADDING_CSS = 'padding-block-start: 5px; padding-block-end: 5px; padding-inline-start: 5px; padding-inline-end: 5px;';

	private function controls(): array {
		return [
			'shape' => [
				'type' => 'select',
				'default' => self::BOX_SHAPE,
			],
			'box_color' => [
				'type' => 'color',
				'default' => '',
				'selectors' => [ '{{WRAPPER}} .box' => 'color: {{VALUE}};' ],
				'global' => [ 'default' => self::PRIMARY_COLOR ],
			],
			'box_padding' => [
				'type' => 'dimensions',
				'size_units' => [ 'px' ],
				'selectors' => [ '{{WRAPPER}} .box' => 'padding: {{TOP}}{{UNIT}};' ],
				'default' => [
					'top' => '5',
					'right' => '5',
					'bottom' => '5',
					'left' => '5',
					'unit' => 'px',
					'isLinked' => true,
				],
			],
			'circle_size' => [
				'type' => 'slider',
				'size_units' => [ 'px' ],
				'selectors' => [ '{{WRAPPER}} .box' => 'width: {{SIZE}}{{UNIT}};' ],
				'default' => [
					'unit' => 'px',
					'size' => 40,
				],
				'condition' => [ 'shape' => 'circle' ],
			],
			'title_typography_typography' => [
				'type' => 'popover_toggle',
				'groupPrefix' => 'title_typography_',
				'groupType' => 'typography',
				'global' => [ 'default' => self::PRIMARY_TYPOGRAPHY ],
			],
			'title_typography_font_size' => [
				'type' => 'slider',
				'size_units' => [ 'px' ],
				'selectors' => [ '{{WRAPPER}} .title' => 'font-size: {{SIZE}}{{UNIT}};' ],
				'groupPrefix' => 'title_typography_',
				'groupType' => 'typography',
				'condition' => [ 'title_typography_typography!' => '' ],
			],
		];
	}

	private function render( array $settings, array $enabled_global_types = [ 'color', 'typography' ] ): string {
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Defaults widget.' )
			->default_target(
				Style_Target::make( 'box' )
					->defaults( [ 'border-style' => 'solid' ] )
					->bind( 'color', V3_Control::bind_to( 'box_color' ) )
					->bind( 'padding', V3_Control::bind_to( 'box_padding' ) )
					->bind( 'width', V3_Control::bind_to( 'circle_size' ) )
			)
			->targets(
				Style_Target::make( 'title' )
					->bind( 'font-size', V3_Control::bind_to( 'title_typography_font_size' ) )
			);
		$diagnostics = new V3_Map_Diagnostics();
		$compiled = ( new V3_Widget_Map_Compiler() )->compile( $map, $this->controls(), $diagnostics, self::WIDGET_TYPE );
		$kit_globals = [
			self::PRIMARY_COLOR => self::KIT_PRIMARY_HEX,
			self::PRIMARY_TYPOGRAPHY => [
				'typography_font_size' => [
					'unit' => 'px',
					'size' => 24,
				],
			],
		];
		$default_styles = new V3_Map_Default_Styles(
			new V3_Map_Style_Reader( V3_Control_Adapter_Registry::create_default() ),
			fn( string $global_key ) => $kit_globals[ $global_key ] ?? null,
			$enabled_global_types
		);

		return $default_styles->render( $compiled, $settings, $this->controls(), [ $this, 'is_visible' ] );
	}

	public function is_visible( array $control, array $values ): bool {
		foreach ( $control['condition'] ?? [] as $key => $expected ) {
			$is_negated = '!' === substr( $key, -1 );
			$actual = $values[ rtrim( $key, '!' ) ] ?? '';

			if ( $is_negated === ( $actual === $expected ) ) {
				return false;
			}
		}

		return true;
	}

	public function test_render__layers_stylesheet_then_kit_globals_then_control_defaults() {
		// Act.
		$css = $this->render( [] );

		// Assert.
		$this->assertSame(
			implode( "\n", [
				'border-style: solid;',
				'color: ' . self::KIT_PRIMARY_HEX . '; title { font-size: 24px; }',
				self::DEFAULT_PADDING_CSS,
			] ),
			$css
		);
	}

	public function test_render__ignores_the_values_set_on_the_element() {
		// Act.
		$css = $this->render( [
			'box_color' => '#000000',
			'box_padding' => [
				'top' => '30',
				'right' => '30',
				'bottom' => '30',
				'left' => '30',
				'unit' => 'px',
				'isLinked' => true,
			],
			'__globals__' => [ 'box_color' => 'globals/colors?id=accent' ],
		] );

		// Assert.
		$this->assertStringContainsString( self::DEFAULT_PADDING_CSS, $css );
		$this->assertStringContainsString( 'color: ' . self::KIT_PRIMARY_HEX, $css );
		$this->assertStringNotContainsString( '30px', $css );
		$this->assertStringNotContainsString( '#000000', $css );
	}

	public function test_render__applies_control_defaults_only_when_the_element_settings_show_them() {
		// Act.
		$box = $this->render( [] );
		$circle = $this->render( [ 'shape' => 'circle' ] );

		// Assert.
		$this->assertStringNotContainsString( 'width', $box );
		$this->assertStringContainsString( 'width: 40px', $circle );
	}

	public function test_render__skips_kit_globals_of_disabled_types() {
		// Act.
		$css = $this->render( [], [] );

		// Assert.
		$this->assertStringNotContainsString( self::KIT_PRIMARY_HEX, $css );
		$this->assertStringNotContainsString( 'font-size', $css );
	}
}
