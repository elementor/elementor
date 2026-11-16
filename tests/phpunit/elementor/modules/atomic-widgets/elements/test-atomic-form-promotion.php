<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form_Promotion;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Preserved_Element;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Form_Promotion extends Elementor_Test_Base {

	public function test_element_type_matches_pro_form_type() {
		$this->assertSame( 'e-form', Atomic_Form_Promotion::get_element_type() );
	}

	public function test_props_schema_reuses_real_form_props() {
		// Act.
		$schema = Atomic_Form_Promotion::get_props_schema();

		// Assert - proves real form settings survive parse_atomic_settings on save.
		$this->assertArrayHasKey( 'form-name', $schema );
		$this->assertArrayHasKey( 'actions-after-submit', $schema );
		$this->assertArrayHasKey( 'webhook_url', $schema );
	}

	public function test_preserved_element_returns_full_subtree_verbatim() {
		// Arrange - a Pro widget with a nested grandchild, as stored in the DB.
		$data = [
			'id' => 'input1',
			'elType' => 'widget',
			'widgetType' => 'e-form-input',
			'settings' => [
				'placeholder' => [ '$$type' => 'string', 'value' => 'Email' ],
			],
			'styles' => [ 'foo' => 'bar' ],
			'editor_settings' => [ 'title' => 'Email' ],
			'elements' => [
				[
					'id' => 'grandchild1',
					'elType' => 'widget',
					'widgetType' => 'e-form-label',
					'settings' => [],
					'elements' => [],
				],
			],
		];

		$preserved = new Preserved_Element( $data, null );

		// Act.
		$saved = $preserved->get_data_for_save();

		// Assert - every stored field is returned untouched, including nested elements.
		$this->assertSame( 'e-form-input', $saved['widgetType'] );
		$this->assertSame( 'Email', $saved['settings']['placeholder']['value'] );
		$this->assertSame( [ 'foo' => 'bar' ], $saved['styles'] );
		$this->assertSame( 'e-form-label', $saved['elements'][0]['widgetType'] );
	}
}
