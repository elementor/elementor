<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Settings\Page\Manager as Page_Manager;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Kit_Settings_Host;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The `woocommerce-notices` map styles site-wide notices, so its settings live on the active kit.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Woocommerce_Notices_Map extends Elementor_Test_Base {

	const WIDGET_TYPE = 'woocommerce-notices';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const FIXTURES_DIR_LEVELS = 4;

	const NOTICE_TYPES_SETTING = 'woocommerce_notices_elements';

	const UNRELATED_KIT_SETTING = 'body_color';

	const KIT_CUSTOM_CSS = 'body { margin: 0; }';

	const EXPECTED_TARGETS = [ 'error-notice', 'error-notice-link', 'error-notice-icon', 'message-notice', 'message-notice-link', 'message-notice-button', 'info-notice', 'info-notice-button' ];

	public function setUp(): void {
		parent::setUp();
		$this->act_as_admin();
		Plugin::$instance->kits_manager->create_new_kit( 'V3 woocommerce notices', [], true );
	}

	public function tearDown(): void {
		Kit_Settings_Host::discard_pending();
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_get_map__compiles_against_the_kit_controls_without_diagnostics() {
		// Arrange.
		$registry = $this->registry();

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertNotNull( $map );
		$this->assertSame( [], $registry->get_diagnostics( self::WIDGET_TYPE ), wp_json_encode( $registry->get_diagnostics( self::WIDGET_TYPE ) ) );
		$this->assertSame( self::EXPECTED_TARGETS, array_keys( $map->get_targets() ) );
	}

	public function test_get_map__is_null_when_the_kit_controls_are_unavailable() {
		// Arrange.
		$registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => [],
			[ self::WIDGET_TYPE => $this->map_definition() ],
			static fn() => true,
			static fn() => null
		);

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertNull( $map );
		$this->assertFalse( $registry->is_supported( self::WIDGET_TYPE ) );
	}

	public function test_apply__writes_the_notice_style_to_the_kit_and_enables_its_type() {
		// Arrange.
		$this->registry();
		$this->save_kit_meta( [ self::NOTICE_TYPES_SETTING => [ 'wc_info' ] ] );
		$node = $this->node( [ 'title' => 'kept' ] );
		$index = [ 'n' => &$node ];

		// Act.
		$result = $this->applier()->apply( $index, [ 'n' => 'error-notice { color: #ff0000; }' ], 'patch' );
		Kit_Settings_Host::flush();

		// Assert.
		$kit_settings = $this->kit_meta();
		$this->assertSame( '#ff0000', $kit_settings['error_message_text_color'] );
		$this->assertSame( [ 'wc_info', 'wc_error' ], $kit_settings[ self::NOTICE_TYPES_SETTING ] );
		$this->assertSame( [ 'title' => 'kept' ], $node['settings'] );
		$this->assertContains( 'site_wide_style', $result['warnings']->codes() );
	}

	public function test_apply__enables_every_styled_notice_type_in_one_write() {
		// Arrange.
		$this->registry();
		$node = $this->node();
		$index = [ 'n' => &$node ];

		// Act.
		$this->applier()->apply( $index, [ 'n' => 'error-notice { color: #ff0000; } message-notice-button { background: #00ff00; }' ], 'patch' );
		Kit_Settings_Host::flush();

		// Assert.
		$kit_settings = $this->kit_meta();
		$this->assertSame( [ 'wc_error', 'wc_message' ], $kit_settings[ self::NOTICE_TYPES_SETTING ] );
		$this->assertSame( '#00ff00', $kit_settings['message_buttons_normal_background_color'] );
		$this->assertSame( 'classic', $kit_settings['message_buttons_normal_background_background'] );
	}

	public function test_apply__keeps_the_kit_unchanged_until_flushed() {
		// Arrange.
		$this->registry();
		$node = $this->node();
		$index = [ 'n' => &$node ];

		// Act.
		$this->applier()->apply( $index, [ 'n' => 'error-notice { color: #ff0000; }' ], 'patch' );
		Kit_Settings_Host::discard_pending();

		// Assert.
		$this->assertArrayNotHasKey( 'error_message_text_color', $this->kit_meta() );
	}

	public function test_execute_guarded__drops_kit_writes_the_ability_did_not_save() {
		// Arrange.
		$this->registry();
		$ability = $this->unsaved_style_ability( $this->applier(), $this->node() );

		// Act.
		$ability->execute_guarded( [] );
		Kit_Settings_Host::flush();

		// Assert.
		$this->assertArrayNotHasKey( 'error_message_text_color', $this->kit_meta() );
	}

	public function test_apply__replace_clears_only_the_notice_styles() {
		// Arrange.
		$this->registry();
		$this->save_kit_meta( [
			self::NOTICE_TYPES_SETTING => [ 'wc_error', 'wc_message' ],
			'error_message_text_color' => '#111111',
			'message_message_text_color' => '#222222',
			self::UNRELATED_KIT_SETTING => '#333333',
			'custom_css' => self::KIT_CUSTOM_CSS,
		] );
		$node = $this->node();
		$index = [ 'n' => &$node ];

		// Act.
		$this->applier()->apply( $index, [ 'n' => 'message-notice { color: #444444; }' ], 'replace' );
		Kit_Settings_Host::flush();

		// Assert.
		$kit_settings = $this->kit_meta();
		$this->assertArrayNotHasKey( 'error_message_text_color', $kit_settings );
		$this->assertSame( '#444444', $kit_settings['message_message_text_color'] );
		$this->assertSame( '#333333', $kit_settings[ self::UNRELATED_KIT_SETTING ] );
		$this->assertSame( self::KIT_CUSTOM_CSS, $kit_settings['custom_css'] );
		$this->assertSame( [ 'wc_error', 'wc_message' ], $kit_settings[ self::NOTICE_TYPES_SETTING ] );
	}

	public function test_apply__drops_css_the_notices_cannot_store_instead_of_writing_custom_css() {
		// Arrange.
		$this->registry();
		$this->save_kit_meta( [ 'custom_css' => self::KIT_CUSTOM_CSS ] );
		$node = $this->node();
		$index = [ 'n' => &$node ];

		// Act.
		$this->applier()->apply( $index, [ 'n' => 'error-notice { color: #ff0000; transform: rotate(5deg); }' ], 'patch' );
		Kit_Settings_Host::flush();

		// Assert.
		$this->assertSame( self::KIT_CUSTOM_CSS, $this->kit_meta()['custom_css'] );
		$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
	}

	public function test_read__returns_the_kit_notice_styles() {
		// Arrange.
		$registry = $this->registry();
		$this->save_kit_meta( [
			self::NOTICE_TYPES_SETTING => [ 'wc_error' ],
			'error_message_text_color' => '#ff0000',
		] );
		$host = $registry->get_map( self::WIDGET_TYPE )->get_settings_host();

		// Act.
		$settings = $host->read( $this->node( [ 'title' => 'ignored' ] ) );
		$css = ( new V3_Style_Serializer() )->serialize( $settings, self::WIDGET_TYPE );

		// Assert.
		$this->assertSame( '#ff0000', $settings['error_message_text_color'] );
		$this->assertArrayNotHasKey( 'title', $settings );
		$this->assertSame( 'color: #ff0000;', $css );
	}

	private function registry(): V3_Widget_Map_Registry {
		$controls = require self::fixture_path( 'woocommerce-notices-controls.php' );

		$registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => [],
			[ self::WIDGET_TYPE => $this->map_definition() ],
			static fn() => true,
			static fn() => $controls
		);

		V3_Widget_Map_Registry::set_instance( $registry );

		return $registry;
	}

	private function map_definition() {
		return require ( require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE )[ self::WIDGET_TYPE ];
	}

	private function node( array $settings = [] ): array {
		return [
			'id' => 'notices-1',
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

	private function unsaved_style_ability( Style_Applier $applier, array $node ): Abstract_Ability {
		return new class( $applier, $node ) extends Abstract_Ability {
			private Style_Applier $applier;
			private array $node;

			public function __construct( Style_Applier $applier, array $node ) {
				$this->applier = $applier;
				$this->node = $node;
			}

			protected function get_ability_id(): string {
				return 'elementor/test-unsaved-style';
			}

			protected function get_definition(): Ability_Definition {
				return new Ability_Definition( 'Test Unsaved Style', 'Test ability.', 'elementor', [ 'type' => 'object' ], [], fn() => true );
			}

			public function is_available() {
				return true;
			}

			public function execute( $input = [] ) {
				$index = [ 'n' => &$this->node ];

				return $this->applier->apply( $index, [ 'n' => 'error-notice { color: #ff0000; }' ], 'patch' );
			}
		};
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
