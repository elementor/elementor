<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Overridden_Setting_Warnings;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Overridden_Setting_Warnings extends Elementor_Test_Base {

	const WIDGET_TYPE = 'menu-map';

	const CONFIG_ID = 'Menu';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const OVERRIDDEN_CODE = 'setting_overridden_by_style';

	public function setUp(): void {
		parent::setUp();

		$controls = [
			'pointer' => [
				'type' => 'select',
				'options' => [
					'underline' => 'Underline',
					'framed' => 'Framed',
					'background' => 'Background',
				],
			],
			'pointer_color_menu_item_hover' => [
				'type' => 'color',
				'condition' => [ 'pointer' => 'background' ],
			],
		];
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Menu.' )
			->default_target(
				Style_Target::make( 'pointer' )
					->bind( 'background', V3_Control::bind_to( 'pointer_color_menu_item_hover' ), 'hover' )
			);

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => $controls,
			[ self::WIDGET_TYPE => $map ]
		) );
	}

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_apply__warns_when_a_style_requirement_replaces_an_explicit_setting() {
		// Arrange.
		$node = $this->node( [ 'pointer' => 'framed' ] );

		// Act.
		$warnings = $this->apply( $node, '&:hover { background: #ff0000; }' );

		// Assert.
		$this->assertSame( 'background', $node['settings']['pointer'] );
		$this->assertSame( [ self::OVERRIDDEN_CODE ], array_column( $warnings, 'code' ) );
		$this->assertStringContainsString( "pointer was changed from 'framed' to 'background'", $warnings[0]['message'] );
		$this->assertStringContainsString( 'background (:hover)', $warnings[0]['message'] );
	}

	public function test_apply__does_not_warn_when_the_setting_already_has_the_required_value() {
		// Arrange.
		$node = $this->node( [ 'pointer' => 'background' ] );

		// Act.
		$warnings = $this->apply( $node, '&:hover { background: #ff0000; }' );

		// Assert.
		$this->assertSame( [], $warnings );
	}

	public function test_apply__does_not_warn_when_the_setting_was_never_set() {
		// Arrange.
		$node = $this->node( [] );

		// Act.
		$warnings = $this->apply( $node, '&:hover { background: #ff0000; }' );

		// Assert.
		$this->assertSame( 'background', $node['settings']['pointer'] );
		$this->assertSame( [], $warnings );
	}

	public function test_report__quotes_an_empty_choice_by_its_schema_value() {
		// Arrange.
		$warnings = Warnings_Bag::make();
		$controls = [
			'gallery_display_caption' => [
				'type' => 'select',
				'options' => [
					'none' => 'None',
					'' => 'Attachment Caption',
				],
			],
		];

		// Act.
		V3_Overridden_Setting_Warnings::report( $warnings, self::CONFIG_ID, [
			'gallery_display_caption' => 'none',
		], [
			'gallery_display_caption' => [
				'value' => '',
				'declaration' => 'margin',
			],
		], $controls );

		// Assert.
		$this->assertStringContainsString(
			"gallery_display_caption was changed from 'none' to 'attachment-caption'",
			$warnings->all()[0]['message']
		);
	}

	public function test_apply__warns_when_a_style_turns_on_a_switcher_that_was_explicitly_off() {
		// Arrange.
		$node = $this->node( [ 'pointer' => '' ] );

		// Act.
		$warnings = $this->apply( $node, '&:hover { background: #ff0000; }' );

		// Assert.
		$this->assertSame( 'background', $node['settings']['pointer'] );
		$this->assertSame( [ self::OVERRIDDEN_CODE ], array_column( $warnings, 'code' ) );
		$this->assertStringContainsString( "pointer was off and was set to 'background'", $warnings[0]['message'] );
	}

	private function node( array $settings ): array {
		return [
			'id' => 'elem-1',
			'elType' => 'widget',
			'widgetType' => self::WIDGET_TYPE,
			'settings' => $settings,
			'styles' => [],
		];
	}

	/**
	 * @return array<int, array{code: string, message: string}>
	 */
	private function apply( array &$node, string $css ): array {
		$index = [ self::CONFIG_ID => &$node ];
		$applier = new Style_Applier( $this->converter(), self::BREAKPOINTS );

		$result = $applier->apply( $index, [ self::CONFIG_ID => $css ], 'patch', [ self::WIDGET_TYPE => [] ] );

		return array_map(
			fn( array $warning ) => [
				'code' => $warning['code'],
				'message' => $warning['message'],
			],
			$result['warnings']->all()
		);
	}

	private function converter(): Css_Converter {
		return new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );
	}
}
