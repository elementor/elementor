<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Section_Bind extends Elementor_Test_Base {

	public function test_serializes_bind_when_set() {
		$section = Section::make()
			->bind( 'query' )
			->set_label( 'Query' )
			->set_items( [
				Select_Control::bind_to( 'source' )->set_label( 'Source' ),
			] );

		$serialized = $section->jsonSerialize();

		$this->assertSame( 'section', $serialized['type'] );
		$this->assertSame( 'query', $serialized['value']['bind'] );
		$this->assertSame( 'Query', $serialized['value']['label'] );
		$this->assertCount( 1, $serialized['value']['items'] );
	}

	public function test_omits_bind_when_not_set() {
		$section = Section::make()->set_label( 'Settings' );

		$serialized = $section->jsonSerialize();

		$this->assertArrayNotHasKey( 'bind', $serialized['value'] );
	}

	public function test_nested_items_serialize_as_controls() {
		$section = Section::make()
			->bind( 'query' )
			->set_items( [
				Select_Control::bind_to( 'source' )->set_label( 'Source' ),
			] );

		$items = $section->jsonSerialize()['value']['items'];

		$this->assertSame( 'control', $items[0]['type'] );
		$this->assertSame( 'source', $items[0]['value']['bind'] );
	}
}
