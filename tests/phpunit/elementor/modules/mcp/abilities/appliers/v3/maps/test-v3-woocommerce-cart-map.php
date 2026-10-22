<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Boolean_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Passthrough_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Settings_Writer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Woocommerce_Cart_Map extends Elementor_Test_Base {

	const WIDGET_TYPE = 'woocommerce-cart';

	const FIXTURES_DIR_LEVELS = 4;

	const TEMPLATE_ID = 42;

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_get_map__exposes_the_empty_cart_template_settings() {
		// Arrange.
		$registry = $this->registry();

		// Act.
		$settings = $registry->get_map( self::WIDGET_TYPE )->get_settings();

		// Assert.
		$this->assertSame( [], $registry->get_diagnostics( self::WIDGET_TYPE ), wp_json_encode( $registry->get_diagnostics( self::WIDGET_TYPE ) ) );
		$this->assertSame( 'additional_template_switch', $settings['customize_empty_cart']->get_control_key() );
		$this->assertSame( 'additional_template_select', $settings['empty_cart_template_id']->get_control_key() );
	}

	public function test_write__stores_the_empty_cart_template_switch_and_id() {
		// Arrange.
		$map = $this->registry()->get_map( self::WIDGET_TYPE );

		// Act.
		$result = $this->writer()->write( $map, [
			'customize_empty_cart' => true,
			'empty_cart_template_id' => self::TEMPLATE_ID,
		] );

		// Assert.
		$this->assertSame( [], $result['rejected'] );
		$this->assertSame( 'active', $result['settings']['additional_template_switch'] );
		$this->assertSame( self::TEMPLATE_ID, $result['settings']['additional_template_select'] );
	}

	public function test_write__rejects_a_template_id_of_zero() {
		// Arrange.
		$map = $this->registry()->get_map( self::WIDGET_TYPE );

		// Act.
		$result = $this->writer()->write( $map, [ 'empty_cart_template_id' => 0 ] );

		// Assert.
		$this->assertArrayHasKey( 'empty_cart_template_id', $result['rejected'] );
		$this->assertArrayNotHasKey( 'additional_template_select', $result['settings'] );
	}

	private function registry(): V3_Widget_Map_Registry {
		$widget_controls = ( require self::fixture_path( 'woocommerce-cart-controls.php' ) ) + ( require self::fixture_path( 'advanced-tab-controls.php' ) );

		$registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => $widget_controls,
			[ self::WIDGET_TYPE => require ( require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE )[ self::WIDGET_TYPE ] ],
			static fn() => true,
			static fn() => null
		);

		V3_Widget_Map_Registry::set_instance( $registry );

		return $registry;
	}

	private function writer(): V3_Map_Settings_Writer {
		$registry = new Plain_Resolvers_Registry();
		$registry->register_fallback( new Passthrough_Plain_Resolver() );
		$registry->register( Boolean_Prop_Type::get_key(), new Boolean_Plain_Resolver() );

		return new V3_Map_Settings_Writer( new Plain_Values_Resolver( $registry ) );
	}

	private static function fixture_path( string $file ): string {
		return dirname( __DIR__, self::FIXTURES_DIR_LEVELS ) . '/fixtures/' . $file;
	}
}
