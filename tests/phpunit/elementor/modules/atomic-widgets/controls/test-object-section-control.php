<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Types\Object_Section_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Object_Section_Control extends Elementor_Test_Base {

	public function test_serializes_type_label_and_nested_items() {
		// Arrange.
		$control = Object_Section_Control::bind_to( 'query' )
			->set_label( 'Query' )
			->set_items( [
				Select_Control::bind_to( 'source' )->set_label( 'Source' ),
			] );

		// Act.
		$serialized = $control->jsonSerialize();

		// Assert.
		$this->assertSame( 'control', $serialized['type'] );
		$this->assertSame( 'object-section', $serialized['value']['type'] );
		$this->assertSame( 'query', $serialized['value']['bind'] );
		$this->assertSame( 'Query', $serialized['value']['label'] );

		$items = $serialized['value']['props']['items'];
		$this->assertCount( 1, $items );
		$this->assertSame( 'select', $items[0]['type'] );
		$this->assertSame( 'source', $items[0]['bind'] );
		$this->assertSame( 'Source', $items[0]['label'] );
	}

	public function test_items_default_to_empty_array() {
		// Arrange.
		$control = Object_Section_Control::bind_to( 'query' );

		// Act.
		$props = $control->get_props();

		// Assert.
		$this->assertSame( [], $props['items'] );
	}
}
