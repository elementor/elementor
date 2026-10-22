<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Settings\Page\Manager as Page_Manager;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Kit_Settings_Host;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Settings_Patch;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Widgets that print WooCommerce notices expose the site-wide notice targets next to their own:
 * their own styles stay on the widget, the notice styles go to the active kit.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Woocommerce_Notice_Targets extends Elementor_Test_Base {

	const WIDGET_TYPE = 'woocommerce-cart';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const FIXTURES_DIR_LEVELS = 4;

	const NOTICE_TYPES_SETTING = 'woocommerce_notices_elements';

	const UNRELATED_KIT_SETTING = 'body_color';

	const NOTICE_TARGETS = [ 'error-notice', 'error-notice-link', 'error-notice-icon', 'message-notice', 'message-notice-link', 'message-notice-button', 'info-notice', 'info-notice-button' ];

	public function setUp(): void {
		parent::setUp();
		$this->act_as_admin();
		Plugin::$instance->kits_manager->create_new_kit( 'V3 woocommerce notice targets', [], true );
	}

	public function tearDown(): void {
		Kit_Settings_Host::discard_pending();
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_get_map__adds_the_notice_targets_to_the_widget_targets() {
		// Arrange.
		$registry = $this->registry();

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertNotNull( $map );
		$this->assertSame( [], $registry->get_diagnostics( self::WIDGET_TYPE ), wp_json_encode( $registry->get_diagnostics( self::WIDGET_TYPE ) ) );
		$this->assertSame( 'sections', $map->get_default_target() );
		$this->assertSame( self::NOTICE_TARGETS, array_values( array_intersect( array_keys( $map->get_targets() ), self::NOTICE_TARGETS ) ) );
	}

	public function test_get_map__keeps_the_widget_targets_when_the_kit_controls_are_unavailable() {
		// Arrange.
		$registry = $this->registry( false );

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertNotNull( $map );
		$this->assertSame( [], $registry->get_diagnostics( self::WIDGET_TYPE ) );
		$this->assertArrayHasKey( 'sections', $map->get_targets() );
		$this->assertSame( [], array_values( array_intersect( array_keys( $map->get_targets() ), self::NOTICE_TARGETS ) ) );
	}

	public function test_apply__writes_widget_styles_to_the_node_and_notice_styles_to_the_kit() {
		// Arrange.
		$this->registry();
		$node = $this->node();
		$index = [ 'n' => &$node ];

		// Act.
		$result = $this->applier()->apply( $index, [ 'n' => 'background: #eeeeee; error-notice { color: #ff0000; }' ], 'patch' );
		Kit_Settings_Host::flush();

		// Assert.
		$kit_settings = $this->kit_meta();
		$this->assertSame( '#eeeeee', $node['settings']['sections_background_color'] );
		$this->assertArrayNotHasKey( 'error_message_text_color', $node['settings'] );
		$this->assertArrayNotHasKey( self::NOTICE_TYPES_SETTING, $node['settings'] );
		$this->assertSame( '#ff0000', $kit_settings['error_message_text_color'] );
		$this->assertSame( [ 'wc_error' ], $kit_settings[ self::NOTICE_TYPES_SETTING ] );
		$this->assertArrayNotHasKey( 'sections_background_color', $kit_settings );
		$this->assertContains( 'site_wide_style', $result['warnings']->codes() );
	}

	public function test_apply__widget_only_styles_do_not_warn_about_site_wide_styles() {
		// Arrange.
		$this->registry();
		$node = $this->node();
		$index = [ 'n' => &$node ];

		// Act.
		$result = $this->applier()->apply( $index, [ 'n' => 'background: #eeeeee;' ], 'patch' );

		// Assert.
		$this->assertSame( '#eeeeee', $node['settings']['sections_background_color'] );
		$this->assertNotContains( 'site_wide_style', $result['warnings']->codes() );
	}

	public function test_apply__replace_without_notice_targets_keeps_the_kit_notice_styles() {
		// Arrange.
		$this->registry();
		$this->save_kit_meta( [
			self::NOTICE_TYPES_SETTING => [ 'wc_error' ],
			'error_message_text_color' => '#111111',
		] );
		$node = $this->node( [ 'sections_background_color' => '#222222' ] );
		$index = [ 'n' => &$node ];

		// Act.
		$this->applier()->apply( $index, [ 'n' => 'background: #333333;' ], 'replace' );
		Kit_Settings_Host::flush();

		// Assert.
		$this->assertSame( '#333333', $node['settings']['sections_background_color'] );
		$this->assertSame( '#111111', $this->kit_meta()['error_message_text_color'] );
	}

	public function test_apply__replace_with_a_notice_target_clears_only_the_notice_styles() {
		// Arrange.
		$this->registry();
		$this->save_kit_meta( [
			self::NOTICE_TYPES_SETTING => [ 'wc_error', 'wc_message' ],
			'error_message_text_color' => '#111111',
			'message_message_text_color' => '#222222',
			self::UNRELATED_KIT_SETTING => '#333333',
		] );
		$node = $this->node( [ 'sections_background_color' => '#444444' ] );
		$index = [ 'n' => &$node ];

		// Act.
		$this->applier()->apply( $index, [ 'n' => 'background: #555555; message-notice { color: #666666; }' ], 'replace' );
		Kit_Settings_Host::flush();

		// Assert.
		$kit_settings = $this->kit_meta();
		$this->assertSame( '#555555', $node['settings']['sections_background_color'] );
		$this->assertArrayNotHasKey( 'error_message_text_color', $kit_settings );
		$this->assertSame( '#666666', $kit_settings['message_message_text_color'] );
		$this->assertSame( '#333333', $kit_settings[ self::UNRELATED_KIT_SETTING ] );
	}

	public function test_read__merges_the_widget_and_kit_styles() {
		// Arrange.
		$registry = $this->registry();
		$this->save_kit_meta( [
			self::NOTICE_TYPES_SETTING => [ 'wc_error' ],
			'error_message_text_color' => '#ff0000',
			self::UNRELATED_KIT_SETTING => '#333333',
		] );
		$host = $registry->get_map( self::WIDGET_TYPE )->get_settings_host();

		// Act.
		$settings = $host->read( $this->node( [ 'sections_background_color' => '#eeeeee' ] ) );
		$css = ( new V3_Style_Serializer() )->serialize( $settings, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( '#eeeeee', $settings['sections_background_color'] );
		$this->assertSame( '#ff0000', $settings['error_message_text_color'] );
		$this->assertArrayNotHasKey( self::UNRELATED_KIT_SETTING, $settings );
		$this->assertStringContainsString( 'background-color: #eeeeee;', $css );
		$this->assertStringContainsString( 'error-notice { color: #ff0000; }', $css );
	}

	public function test_write__keeps_global_links_with_the_settings_they_belong_to() {
		// Arrange.
		$registry = $this->registry();
		$host = $registry->get_map( self::WIDGET_TYPE )->get_settings_host();
		$node = $this->node();

		// Act.
		$host->write( $node, [
			'sections_background_color' => '',
			V3_Settings_Patch::GLOBALS_KEY => [
				'sections_background_color' => 'globals/colors?id=primary',
				'error_message_text_color' => 'globals/colors?id=accent',
			],
		] );
		Kit_Settings_Host::flush();

		// Assert.
		$this->assertSame( [ 'sections_background_color' => 'globals/colors?id=primary' ], $node['settings'][ V3_Settings_Patch::GLOBALS_KEY ] );
		$this->assertSame( [ 'error_message_text_color' => 'globals/colors?id=accent' ], $this->kit_meta()[ V3_Settings_Patch::GLOBALS_KEY ] );
	}

	private function registry( bool $has_kit_controls = true ): V3_Widget_Map_Registry {
		$widget_controls = ( require self::fixture_path( 'woocommerce-cart-controls.php' ) ) + ( require self::fixture_path( 'advanced-tab-controls.php' ) );
		$kit_controls = $has_kit_controls ? require self::fixture_path( 'woocommerce-notices-controls.php' ) : null;

		$registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => $widget_controls,
			[ self::WIDGET_TYPE => require ( require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE )[ self::WIDGET_TYPE ] ],
			static fn() => true,
			static fn() => $kit_controls
		);

		V3_Widget_Map_Registry::set_instance( $registry );

		return $registry;
	}

	private function node( array $settings = [] ): array {
		return [
			'id' => 'cart-1',
			'elType' => 'widget',
			'widgetType' => self::WIDGET_TYPE,
			'settings' => $settings,
			'styles' => [],
		];
	}

	private function applier(): Style_Applier {
		$converter = new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );

		return new Style_Applier( $converter, self::BREAKPOINTS );
	}

	private function kit_meta(): array {
		$settings = get_post_meta( Plugin::$instance->kits_manager->get_active_id(), Page_Manager::META_KEY, true );

		return is_array( $settings ) ? $settings : [];
	}

	private function save_kit_meta( array $settings ): void {
		update_post_meta( Plugin::$instance->kits_manager->get_active_id(), Page_Manager::META_KEY, $settings );
	}

	private static function fixture_path( string $file ): string {
		return dirname( __DIR__, self::FIXTURES_DIR_LEVELS ) . '/fixtures/' . $file;
	}
}
