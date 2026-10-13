<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Custom_Css_Fallback;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Custom_Css_Fallback extends Elementor_Test_Base {

	const WIDGET_TYPE = 'heading-map';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const CUSTOM_MEDIA_BLOCK = '@media (min-width: 2000px) { color: blue; title:hover { color: green; } }';

	const MEDIA_QUERIES = [
		'tablet' => '(max-width: 1024px)',
		'mobile' => '(max-width: 767px)',
	];

	const TABLET_RULE = [
		'target' => 'title',
		'state' => null,
		'breakpoint' => 'tablet',
		'media' => null,
		'declarations' => [ 'color' => 'red' ],
	];

	const WIDESCREEN_RULE = [
		'target' => 'title',
		'state' => null,
		'breakpoint' => 'desktop',
		'media' => '(min-width: 2000px)',
		'declarations' => [ 'color' => 'blue' ],
	];

	public function setUp(): void {
		parent::setUp();

		$controls = [
			'title_color' => [
				'type' => 'color',
				'selectors' => [ '{{WRAPPER}} .elementor-heading-title' => 'color: {{VALUE}};' ],
			],
		];
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Heading.' )
			->default_target(
				Style_Target::make( 'title' )
					->selector( '.elementor-heading-title' )
					->bind( 'color', V3_Control::bind_to( 'title_color' ) )
			);

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => $controls,
			[ self::WIDGET_TYPE => $map ]
		) );
	}

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_apply__writes_unsupported_breakpoint_values_and_other_media_queries_to_custom_css() {
		// Act.
		$result = $this->mapper()->apply( 'color: #111111; @media(--tablet) { color: red; } ' . self::CUSTOM_MEDIA_BLOCK, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [ 'title_color' => '#111111' ], $result['settings_patch'] );
		$this->assertSame( [ self::TABLET_RULE, self::WIDESCREEN_RULE ], $result['fallback_rules'] );
		$this->assertSame( '', $result['unmapped_css'] );
		$this->assertSame(
			[ 'color: blue (title): Media query (min-width: 2000px) is not a site breakpoint.' ],
			array_slice( $result['fallback_notes'], 1 )
		);
		$this->assertSame( [ 'The state in title:hover is not supported by style target title and was dropped.' ], $result['warnings'] );
	}

	public function test_site_media_queries__lists_max_width_breakpoints_from_widest_to_narrowest() {
		// Act.
		$queries = V3_Custom_Css_Fallback::site_media_queries();

		// Assert.
		$this->assertSame( [ 'tablet', 'mobile' ], array_keys( $queries ) );
	}

	public function test_serialize__returns_the_custom_css_as_is_after_the_mapped_css() {
		// Arrange.
		$written = $this->mapper()->apply( 'color: #111111; @media(--tablet) { color: red; } ' . self::CUSTOM_MEDIA_BLOCK, self::WIDGET_TYPE, [] );
		$custom_css = ( new V3_Custom_Css_Fallback( [ 'title' => '.elementor-heading-title' ], self::MEDIA_QUERIES ) )
			->render( $written['fallback_rules'] );
		$settings = $written['settings_patch'] + [ 'custom_css' => $custom_css ];

		// Act.
		$css = ( new V3_Style_Serializer() )->serialize( $settings, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( 'color: #111111; ' . $custom_css, $css );
	}

	public function test_style_applier__stores_the_fallback_in_custom_css_or_reports_missing_pro() {
		// Arrange.
		$node = [
			'id' => 'elem-1',
			'elType' => 'widget',
			'widgetType' => self::WIDGET_TYPE,
			'settings' => [],
			'styles' => [],
		];
		$index = [ 'title' => &$node ];
		$applier = new Style_Applier( $this->converter(), self::BREAKPOINTS );

		// Act.
		$result = $applier->apply( $index, [ 'title' => 'color: #111111; @media(--tablet) { color: red; }' ], 'patch', [ self::WIDGET_TYPE => [] ] );

		// Assert.
		$codes = array_column( $result['warnings']->all(), 'code' );
		$this->assertSame( '#111111', $node['settings']['title_color'] );

		if ( Utils::has_pro() ) {
			$this->assertStringContainsString( '{ selector .elementor-heading-title { color: red; } }', $node['settings']['custom_css'] );
			$this->assertSame( [ 'css_fallback_custom_css' ], $codes );

			return;
		}

		$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
		$this->assertSame( [ Style_Applier::UNSUPPORTED_CSS_CODE ], $codes );
	}

	private function mapper(): V3_Style_Mapper {
		return V3_Style_Mapper_Factory::create( $this->converter(), self::BREAKPOINTS );
	}

	private function converter(): Css_Converter {
		return new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );
	}
}
