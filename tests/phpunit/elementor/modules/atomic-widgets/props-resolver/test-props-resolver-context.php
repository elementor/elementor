<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Props_Resolver_Context extends Elementor_Test_Base {

	public function test_options_default_to_empty_array() {
		$context = Props_Resolver_Context::make();

		$this->assertSame( [], $context->get_options() );
	}

	public function test_options_round_trip() {
		$widget = $this->elementor()->elements_manager->create_element_instance( [
			'id' => 'test-widget',
			'elType' => 'widget',
			'widgetType' => 'heading',
			'settings' => [],
		] );

		$context = Props_Resolver_Context::make()
			->set_options( [ 'element' => $widget ] );

		$this->assertSame( $widget, $context->get_options()['element'] );
	}

	public function test_fluent_setters_preserve_other_context_fields() {
		$prop_type = String_Prop_Type::make();

		$context = Props_Resolver_Context::make()
			->set_key( 'title' )
			->set_disabled( true )
			->set_prop_type( $prop_type )
			->set_options( [ 'foo' => 'bar' ] );

		$this->assertSame( 'title', $context->get_key() );
		$this->assertTrue( $context->is_disabled() );
		$this->assertSame( $prop_type, $context->get_prop_type() );
		$this->assertSame( [ 'foo' => 'bar' ], $context->get_options() );
	}
}
