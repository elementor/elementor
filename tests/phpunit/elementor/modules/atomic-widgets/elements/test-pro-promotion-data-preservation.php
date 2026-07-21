<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form_Promotion;
use Elementor\Modules\AtomicWidgets\Elements\Promotions\Pro_Promotion_Data_Preservation;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Pro_Promotion_Data_Preservation extends Elementor_Test_Base {

	private Pro_Promotion_Data_Preservation $preservation;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		Plugin::$instance->elements_manager->get_element_types();

		Plugin::$instance->elements_manager->register_element_type( new Atomic_Form_Promotion() );

		$this->preservation = new Pro_Promotion_Data_Preservation();
		$this->preservation->register_hooks();
	}

	public function tearDown(): void {
		Plugin::$instance->elements_manager->unregister_element_type( Atomic_Form_Promotion::get_type() );

		$this->reset_elements_manager_types();

		remove_all_filters( 'elementor/document/save/data' );
		remove_all_filters( 'elementor/atomic/form/email_action_count' );

		parent::tearDown();
	}

	private function reset_elements_manager_types(): void {
		$reflection = new \ReflectionClass( Plugin::$instance->elements_manager );
		$property = $reflection->getProperty( '_element_types' );
		$property->setAccessible( true );
		$property->setValue( Plugin::$instance->elements_manager, null );

		Plugin::$instance->elements_manager->get_element_types();
	}

	public function test_form_children_and_settings_are_restored_across_a_save() {
		// Arrange - a form (promotion) with fields and a name, as first stored in the DB.
		$form = [
			'id' => 'form001',
			'elType' => 'e-form',
			'settings' => [ 'form-name' => [ '$$type' => 'string', 'value' => 'Contact us' ] ],
			'elements' => [
				[ 'id' => 'input01', 'elType' => 'widget', 'widgetType' => 'e-form-input', 'settings' => [], 'elements' => [] ],
				[ 'id' => 'label01', 'elType' => 'widget', 'widgetType' => 'e-form-label', 'settings' => [], 'elements' => [] ],
			],
		];

		$document = $this->factory()->documents->create_and_get();
		$document->save( [ 'elements' => [ $form ], 'settings' => [] ] );

		// Act - the editor re-saves the page with the promotion's children stripped (Pro is off).
		$stripped = $form;
		$stripped['settings'] = [];
		$stripped['elements'] = [];

		$document->save( [ 'elements' => [ $stripped ], 'settings' => [] ] );

		// Assert - the fields and name were restored from the stored copy, not lost.
		$saved = $document->get_elements_data();

		$this->assertCount( 1, $saved );
		$this->assertSame( 'e-form', $saved[0]['elType'] );
		$this->assertSame( 'Contact us', $saved[0]['settings']['form-name']['value'] );

		$widget_types = array_column( $saved[0]['elements'], 'widgetType' );
		$this->assertContains( 'e-form-input', $widget_types );
		$this->assertContains( 'e-form-label', $widget_types );
	}

	public function test_form_without_stored_children_is_left_untouched() {
		// Arrange - a form that never had children must not be altered.
		$empty_form = [
			'id' => 'form002',
			'elType' => 'e-form',
			'settings' => [],
			'elements' => [],
		];

		$document = $this->factory()->documents->create_and_get();
		$document->save( [ 'elements' => [ $empty_form ], 'settings' => [] ] );

		// Act.
		$document->save( [ 'elements' => [ $empty_form ], 'settings' => [] ] );

		// Assert.
		$saved = $document->get_elements_data();
		$this->assertArrayNotHasKey( 'elements', $saved[0] );
	}
}
