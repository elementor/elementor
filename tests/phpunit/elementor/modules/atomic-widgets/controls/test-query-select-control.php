<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Types\Query_Select_Control;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Query_Select_Control extends Elementor_Test_Base {
	public function test_get_type__returns_query_select() {
		// Arrange.
		$control = Query_Select_Control::bind_to( 'popup-id' );

		// Assert.
		$this->assertSame( 'query-select', $control->get_type() );
	}

	public function test_get_props__returns_null_defaults() {
		// Arrange.
		$control = Query_Select_Control::bind_to( 'popup-id' );

		// Act.
		$props = $control->get_props();

		// Assert.
		$this->assertSame(
			[
				'queryOptions' => null,
				'placeholder' => null,
				'minInputLength' => null,
			],
			$props
		);
	}

	public function test_get_props__returns_configured_values() {
		// Arrange.
		$query_options = [ 'url' => '/elementor/v1/post', 'params' => [ 'included_types' => [ 'elementor_library' ] ] ];

		$control = Query_Select_Control::bind_to( 'popup-id' );
		$control->set_query_options( $query_options );
		$control->set_placeholder( 'Select a popup' );
		$control->set_min_input_length( 0 );

		// Act.
		$props = $control->get_props();

		// Assert.
		$this->assertSame(
			[
				'queryOptions' => $query_options,
				'placeholder' => 'Select a popup',
				'minInputLength' => 0,
			],
			$props
		);
	}
}
