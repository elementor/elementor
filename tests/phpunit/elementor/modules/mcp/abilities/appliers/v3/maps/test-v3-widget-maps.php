<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Style_Writer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Plugin;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Maps extends TestCase {

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	private array $original_experiment_states = [];

	public function setUp(): void {
		parent::setUp();

		$this->set_experiment_state( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $experiment_name => $state ) {
			Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
			delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		}

		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function core_map_provider(): array {
		return [
			'counter' => [ 'counter', 'color: #111111; font-size: 48px; font-weight: 700; & title { color: #555555; font-size: 16px; } @media(--mobile) { font-size: 32px; }' ],
			'progress' => [ 'progress', 'background: #4f46e5; height: 18px; color: #ffffff; & track { background: #e5e7eb; border-radius: 9px; } & title { color: #111827; font-weight: 600; }' ],
			'social-icons' => [ 'social-icons', 'background: #0f172a; color: #ffffff; font-size: 20px; border-radius: 50%; &:hover { background: #e11d48; } & row { column-gap: 14px; }' ],
			'image-gallery' => [ 'image-gallery', 'border-radius: 12px; & caption { color: #444444; text-align: center; }' ],
			'image-carousel' => [ 'image-carousel', 'border-radius: 16px; & arrows { color: #ffffff; font-size: 28px; } & dots { background: #111111; }' ],
		];
	}

	/**
	 * @dataProvider core_map_provider
	 */
	public function test_core_map__compiles_against_the_live_widget( string $widget_type ) {
		// Act.
		$contract = V3_Widget_Map_Registry::instance()->get_llm_contract( $widget_type );

		// Assert.
		$this->assertNotNull( $contract, "{$widget_type} map did not compile against the registered widget controls." );
		$this->assertTrue( V3_Widget_Map_Registry::instance()->is_supported( $widget_type ) );
	}

	/**
	 * @dataProvider core_map_provider
	 */
	public function test_core_map__css_round_trips_through_every_target( string $widget_type, string $css ) {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( $widget_type ) ?? [];

		// Act.
		$written = $mapper->apply( $css, $widget_type, $widget_config );
		$readback_css = ( new V3_Style_Serializer() )->serialize( $written['settings_patch'], $widget_type, $widget_config );
		$rewritten = $mapper->apply( $readback_css, $widget_type, $widget_config );

		// Assert.
		$this->assertSame( [], $written['warnings'] );
		$this->assertNotSame( [], $written['settings_patch'] );
		$this->assertEquals( $written['settings_patch'], $rewritten['settings_patch'], $readback_css );
		$this->assertSame( [], $rewritten['warnings'] );
	}

	public function test_counter__routes_each_target_to_its_own_control() {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( 'counter' ) ?? [];

		// Act.
		$result = $mapper->apply( 'color: #ff0000; & title { color: #00ff00; }', 'counter', $widget_config );

		// Assert.
		$this->assertSame( '#ff0000', $result['settings_patch']['number_color'] ?? null );
		$this->assertSame( '#00ff00', $result['settings_patch']['title_color'] ?? null );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_social_icons__hover_block_writes_hover_controls_of_the_default_target() {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( 'social-icons' ) ?? [];

		// Act.
		$result = $mapper->apply( '&:hover { background: #e11d48; color: #ffffff; }', 'social-icons', $widget_config );

		// Assert.
		$this->assertSame( '#e11d48', $result['settings_patch']['hover_primary_color'] ?? null );
		$this->assertSame( '#ffffff', $result['settings_patch']['hover_secondary_color'] ?? null );
		$this->assertArrayNotHasKey( 'icon_primary_color', $result['settings_patch'] );
	}

	public function test_unknown_target__is_skipped_with_a_warning_listing_the_targets() {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( 'counter' ) ?? [];

		// Act.
		$result = $mapper->apply( '& banner { color: #000000; }', 'counter', $widget_config );

		// Assert.
		$this->assertSame( [], $result['settings_patch'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( 'number, title', $result['warnings'][0] );
	}

	public function test_property_without_binding_on_target__is_skipped_with_a_warning() {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( 'progress' ) ?? [];

		// Act.
		$result = $mapper->apply( '& track { color: #000000; }', 'progress', $widget_config );

		// Assert.
		$this->assertSame( [], $result['settings_patch'] );
		$this->assertNotEmpty( $result['warnings'] );
	}

	public function pro_map_provider(): array {
		return [
			'nav-menu' => [ 'nav-menu' ],
			'mega-menu' => [ 'mega-menu' ],
		];
	}

	/**
	 * @dataProvider pro_map_provider
	 */
	public function test_pro_map__compiles_when_pro_registers_the_widget( string $widget_type ) {
		if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			// Assert.
			$this->assertNull( V3_Widget_Map_Registry::instance()->get_llm_contract( $widget_type ) );
			$this->markTestSkipped( "{$widget_type} is an Elementor Pro widget and Pro is not loaded." );
		}

		// Act.
		$contract = V3_Widget_Map_Registry::instance()->get_llm_contract( $widget_type );

		// Assert.
		$this->assertNotNull( $contract, "{$widget_type} map did not compile against the Pro widget controls." );
	}

	public function test_social_icons__border_width_and_color_imply_a_solid_border() {
		// Act.
		$result = $this->apply( 'social-icons', 'border-width: 2px; border-color: #0ea5e9;' );

		// Assert.
		$this->assertSame( 'solid', $result['settings_patch']['image_border_border'] ?? null );
		$this->assertSame( '#0ea5e9', $result['settings_patch']['image_border_color'] ?? null );
		$this->assertArrayHasKey( 'image_border_width', $result['settings_patch'] );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_social_icons__explicit_border_style_wins_over_the_implied_solid() {
		// Act.
		$result = $this->apply( 'social-icons', 'border-color: #0ea5e9; border-style: dashed; border-width: 2px;' );

		// Assert.
		$this->assertSame( 'dashed', $result['settings_patch']['image_border_border'] ?? null );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_image_gallery__border_implies_solid_and_gap_enables_custom_spacing() {
		// Act.
		$result = $this->apply( 'image-gallery', 'border-width: 6px; border-color: #facc15; & grid { gap: 24px; }' );

		// Assert.
		$this->assertSame( 'solid', $result['settings_patch']['image_border_border'] ?? null );
		$this->assertSame( 'custom', $result['settings_patch']['image_spacing'] ?? null );
		$this->assertSame( [
			'unit' => 'px',
			'size' => 24,
		], $result['settings_patch']['image_spacing_custom'] ?? null );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_image_gallery__mobile_gap_is_rejected_with_a_warning() {
		// Act.
		$result = $this->apply( 'image-gallery', '& grid { @media(--mobile) { gap: 8px; } }' );

		// Assert.
		$this->assertArrayNotHasKey( 'image_spacing_custom_mobile', $result['settings_patch'] );
		$this->assertNotSame( [], $result['warnings'] );
	}

	public function test_counter__text_align_routes_to_number_and_title_alignment_controls() {
		// Act.
		$result = $this->apply( 'counter', 'text-align: end; & title { text-align: start; }' );

		// Assert.
		$this->assertSame( 'end', $result['settings_patch']['number_position'] ?? null );
		$this->assertSame( 'start', $result['settings_patch']['title_horizontal_alignment'] ?? null );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_counter__contract_exposes_title_position_and_no_hover_example() {
		// Act.
		$contract = V3_Widget_Map_Registry::instance()->get_llm_contract( 'counter' );
		$encoded = wp_json_encode( $contract );

		// Assert.
		$this->assertStringContainsString( 'title_position', $encoded );
		$this->assertStringNotContainsString( 'title:hover', $encoded );
	}

	public function test_container__border_radius_and_outer_box_shadow_are_mapped() {
		// Act.
		$result = $this->apply_container_map( 'border-radius: 20px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);' );

		// Assert.
		$this->assertArrayHasKey( 'border_radius', $result['settings_patch'] );
		$this->assertSame( 'yes', $result['settings_patch']['box_shadow_box_shadow_type'] ?? null );
		$shadow = $result['settings_patch']['box_shadow_box_shadow'] ?? [];
		$this->assertSame( 0, $shadow['horizontal'] ?? null );
		$this->assertSame( 10, $shadow['vertical'] ?? null );
		$this->assertSame( 30, $shadow['blur'] ?? null );
		$this->assertSame( 0, $shadow['spread'] ?? null );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_container__inset_box_shadow_is_rejected_with_a_warning() {
		// Act.
		$result = $this->apply_container_map( 'box-shadow: inset 0 2px 4px #000000;' );

		// Assert.
		$this->assertArrayNotHasKey( 'box_shadow_box_shadow', $result['settings_patch'] );
		$this->assertNotSame( [], $result['warnings'] );
	}

	public function test_container__flex_alignment_is_mapped() {
		// Act.
		$result = $this->apply_container_map( 'justify-content: flex-end; align-items: center;' );

		// Assert.
		$this->assertSame( 'flex-end', $result['settings_patch']['flex_justify_content'] ?? null );
		$this->assertSame( 'center', $result['settings_patch']['flex_align_items'] ?? null );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_mirrored_control__receives_the_same_value_at_every_breakpoint() {
		// Arrange.
		$controls = [
			'hover_color' => [ 'type' => 'color' ],
			'hover_color_alt' => [ 'type' => 'color' ],
		];
		$map = [
			'widget_type' => 'fake',
			'description' => 'Fake.',
			'catalog_visibility' => 'always',
			'settings' => [],
			'default_style_target' => 'items',
			'style_targets' => [
				'items' => Style_Target::make( 'Items' )
					->bind( 'color', V3_Control::bind_to( 'hover_color' )->mirror_to( 'hover_color_alt' ), 'hover' ),
			],
		];
		$compiled = ( new V3_Widget_Map_Compiler() )->compile( $map, $controls, 'fake' );
		$writer = new V3_Map_Style_Writer(
			new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) ),
			V3_Control_Adapter_Registry::create_default(),
			new Css_Declaration_Parser()
		);
		$ctx = new V3_Conversion_Context();

		// Act.
		$writer->write( $ctx, $compiled['style_targets']['items']['bindings'], $controls, 'desktop', 'hover', 'color: #e11d48;' );

		// Assert.
		$this->assertSame( [
			'hover_color' => '#e11d48',
			'hover_color_alt' => '#e11d48',
		], $ctx->settings_patch() );
	}

	public function test_mirror_to_a_control_of_another_type__fails_compilation() {
		// Arrange.
		$map = [
			'widget_type' => 'fake',
			'description' => 'Fake.',
			'catalog_visibility' => 'always',
			'settings' => [],
			'default_style_target' => 'items',
			'style_targets' => [
				'items' => Style_Target::make( 'Items' )
					->bind( 'color', V3_Control::bind_to( 'hover_color' )->mirror_to( 'size' ), 'hover' ),
			],
		];

		// Act.
		$compiled = ( new V3_Widget_Map_Compiler() )->compile( $map, [
			'hover_color' => [ 'type' => 'color' ],
			'size' => [ 'type' => 'slider' ],
		], 'fake' );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $compiled );
	}

	public function test_nav_menu__items_hover_color_writes_both_pointer_variants() {
		if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			$this->markTestSkipped( 'Elementor Pro is not loaded.' );
		}

		// Act.
		$result = $this->apply( 'nav-menu', '& items:hover { color: #e11d48; }' );

		// Assert.
		$this->assertSame( '#e11d48', $result['settings_patch']['color_menu_item_hover'] ?? null );
		$this->assertSame( '#e11d48', $result['settings_patch']['color_menu_item_hover_pointer_bg'] ?? null );
	}

	/**
	 * The container's live controls need an active kit document, which the sqlite test env lacks,
	 * so this compiles the real container map against the container's control types instead.
	 */
	private function apply_container_map( string $css ): array {
		$choose = static fn( array $options ): array => [
			'type' => 'choose',
			'is_responsive' => true,
			'options' => array_fill_keys( $options, [] ),
		];
		$controls = [
			'content_width' => [
				'type' => 'select',
				'options' => array_fill_keys( [ 'boxed', 'full' ], '' ),
			],
			'background_background' => [ 'type' => 'choose' ],
			'background_color' => [ 'type' => 'color' ],
			'padding' => [
				'type' => 'dimensions',
				'is_responsive' => true,
			],
			'margin' => [
				'type' => 'dimensions',
				'is_responsive' => true,
			],
			'border_radius' => [
				'type' => 'dimensions',
				'is_responsive' => true,
			],
			'box_shadow_box_shadow_type' => [ 'type' => 'popover_toggle' ],
			'box_shadow_box_shadow' => [ 'type' => 'box_shadow' ],
			'flex_justify_content' => $choose( [ 'flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly' ] ),
			'flex_align_items' => $choose( [ 'flex-start', 'center', 'flex-end', 'stretch' ] ),
		];
		$map = require ELEMENTOR_PATH . 'modules/mcp/abilities/appliers/v3/maps/container-map.php';
		$compiled = ( new V3_Widget_Map_Compiler() )->compile( $map, $controls, 'container' );
		$this->assertIsArray( $compiled, 'container map did not compile against container control types.' );

		$writer = new V3_Map_Style_Writer(
			new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) ),
			V3_Control_Adapter_Registry::create_default(),
			new Css_Declaration_Parser()
		);
		$ctx = new V3_Conversion_Context();
		$writer->write( $ctx, $compiled['style_targets']['container']['bindings'], $controls, 'desktop', null, $css );

		return [
			'settings_patch' => $ctx->settings_patch(),
			'warnings' => $ctx->warnings(),
		];
	}

	private function apply( string $widget_type, string $css ): array {
		return $this->make_mapper()->apply( $css, $widget_type, Widget_Context_Helper::get_widget_config( $widget_type ) ?? [] );
	}

	private function make_mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );

		return V3_Style_Mapper_Factory::create( $converter, self::BREAKPOINTS );
	}

	private function set_experiment_state( string $experiment_name, string $state ): void {
		if ( ! array_key_exists( $experiment_name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $experiment_name );

			if ( empty( $features ) && Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME === $experiment_name ) {
				Plugin::$instance->experiments->add_feature( Mcp_Module::get_v3_standardized_maps_experimental_data() );
				$features = Plugin::$instance->experiments->get_features( $experiment_name );
			}

			$this->original_experiment_states[ $experiment_name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		V3_Widget_Map_Registry::reset_instance();
	}
}
