<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form_Promotion;
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

	public function test_props_schema_includes_second_email_action() {
		// Act.
		$schema = Atomic_Form_Promotion::get_props_schema();

		// Assert - the email_action_count filter keeps a Pro-configured second email.
		$this->assertArrayHasKey( 'email', $schema );
		$this->assertArrayHasKey( 'email_2', $schema );
	}

	public function test_get_data_for_save_preserves_unregistered_children_subtree() {
		// Arrange - Pro child widgets are unregistered when Pro is off.
		$promotion = new Atomic_Form_Promotion( [
			'id' => 'form1',
			'elType' => 'e-form',
			'settings' => [],
			'elements' => [
				[
					'id' => 'input1',
					'elType' => 'widget',
					'widgetType' => 'e-form-input',
					'settings' => [
						'placeholder' => [ '$$type' => 'string', 'value' => 'Email' ],
					],
					'elements' => [],
				],
				[
					'id' => 'flex1',
					'elType' => 'e-flexbox',
					'settings' => [],
					'elements' => [
						[
							'id' => 'checkbox1',
							'elType' => 'widget',
							'widgetType' => 'e-form-checkbox',
							'settings' => [
								'_cssid' => [ '$$type' => 'string', 'value' => 'chk' ],
							],
							'elements' => [],
						],
					],
				],
			],
		], null );

		// Act.
		$saved = $promotion->get_data_for_save();

		// Assert - both direct children survive.
		$this->assertCount( 2, $saved['elements'] );

		// Unregistered Pro widget preserved verbatim (widgetType + settings).
		$this->assertSame( 'e-form-input', $saved['elements'][0]['widgetType'] );
		$this->assertSame( 'Email', $saved['elements'][0]['settings']['placeholder']['value'] );

		// Grandchild inside a core container preserved too.
		$this->assertSame( 'e-flexbox', $saved['elements'][1]['elType'] );
		$this->assertCount( 1, $saved['elements'][1]['elements'] );
		$this->assertSame( 'e-form-checkbox', $saved['elements'][1]['elements'][0]['widgetType'] );
		$this->assertSame( 'chk', $saved['elements'][1]['elements'][0]['settings']['_cssid']['value'] );
	}
}
