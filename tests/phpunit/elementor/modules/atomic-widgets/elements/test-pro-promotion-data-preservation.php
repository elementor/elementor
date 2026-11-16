<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Carousel_Promotion;
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

		remove_all_filters( 'elementor/document/save/data' );
		remove_all_filters( 'elementor/atomic/form/email_action_count' );

		parent::tearDown();
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
		$this->assertSame( [], $saved[0]['elements'] );
	}

	public function test_carousel_children_and_settings_are_restored_across_a_save() {
		// Arrange.
		Plugin::$instance->elements_manager->register_element_type( new Carousel_Promotion() );

		$carousel = [
			'id' => 'car001',
			'elType' => 'e-carousel',
			'settings' => [
				'classes' => [ '$$type' => 'classes', 'value' => [ 'hero-carousel' ] ],
			],
			'elements' => [
				[
					'id' => 'viewport01',
					'elType' => 'e-carousel-viewport',
					'settings' => [],
					'elements' => [
						[
							'id' => 'container01',
							'elType' => 'e-carousel-container',
							'settings' => [],
							'elements' => [
								[ 'id' => 'slide01', 'elType' => 'e-carousel-slide', 'settings' => [], 'elements' => [] ],
								[ 'id' => 'slide02', 'elType' => 'e-carousel-slide', 'settings' => [], 'elements' => [] ],
								[ 'id' => 'slide03', 'elType' => 'e-carousel-slide', 'settings' => [], 'elements' => [] ],
								[ 'id' => 'slide04', 'elType' => 'e-carousel-slide', 'settings' => [], 'elements' => [] ],
							],
						],
					],
				],
				[ 'id' => 'arrowPrev01', 'elType' => 'e-carousel-arrow-prev', 'settings' => [], 'elements' => [] ],
				[ 'id' => 'arrowNext01', 'elType' => 'e-carousel-arrow-next', 'settings' => [], 'elements' => [] ],
				[ 'id' => 'pagination01', 'elType' => 'e-carousel-pagination', 'settings' => [], 'elements' => [] ],
			],
		];

		$document = $this->factory()->documents->create_and_get();
		$document->save( [ 'elements' => [ $carousel ], 'settings' => [] ] );

		// Act - the editor re-saves the page with the promotion's children stripped (Pro is off).
		$stripped = $carousel;
		$stripped['settings'] = [];
		$stripped['elements'] = [];

		$document->save( [ 'elements' => [ $stripped ], 'settings' => [] ] );

		// Assert - the subtree and name were restored from the stored copy, not lost.
		$saved = $document->get_elements_data();

		$this->assertCount( 1, $saved );
		$this->assertSame( 'e-carousel', $saved[0]['elType'] );
		$this->assertSame( [ 'hero-carousel' ], $saved[0]['settings']['classes']['value'] );

		$child_types = array_column( $saved[0]['elements'], 'elType' );
		$this->assertContains( 'e-carousel-viewport', $child_types );
		$this->assertContains( 'e-carousel-arrow-prev', $child_types );
		$this->assertContains( 'e-carousel-arrow-next', $child_types );
		$this->assertContains( 'e-carousel-pagination', $child_types );

		$viewport = null;
		foreach ( $saved[0]['elements'] as $child ) {
			if ( 'e-carousel-viewport' === $child['elType'] ) {
				$viewport = $child;
				break;
			}
		}

		$this->assertNotNull( $viewport );
		$slide_types = array_column( $viewport['elements'][0]['elements'], 'elType' );
		$this->assertSame(
			[ 'e-carousel-slide', 'e-carousel-slide', 'e-carousel-slide', 'e-carousel-slide' ],
			$slide_types
		);

		Plugin::$instance->elements_manager->unregister_element_type( Carousel_Promotion::get_type() );
	}
}
