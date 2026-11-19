<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	const ICON_BUTTON_ID = 'elementor/icon-button';
	const THIRD_PARTY_ID = 'acme/badge';
	const LOCKING_WIDGET_ID = 'acme/card';
	const UNREGISTERED_WIDGET_ID = 'acme/removed';

	public function test_editor_settings__expose_registered_definitions_and_temporary_tiles() {
		// Arrange.
		new Module();

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [ 'elementsPresets' => [] ] );

		// Assert.
		$this->assertSame( Module::EDITOR_DEFINITION_KEYS, array_keys( $settings['compositeWidgets'][ self::ICON_BUTTON_ID ] ) );
		$this->assertSame(
			self::ICON_BUTTON_ID,
			$settings['elementsPresets']['composite-widget-elementor-icon-button']['replacements']['custom']['compositeWidgetId']
		);
	}

	public function test_register_hook__adds_third_party_definitions_next_to_core_ones() {
		// Arrange.
		add_action( Module::REGISTER_HOOK, function ( Widgets_Definitions_Registry $registry ) {
			$registry->register(
				Widget_Definition::make( self::THIRD_PARTY_ID )
					->title( 'Badge' )
					->template(
						Element_Builder::make( 'e-flexbox' )
							->part( 'root' )
							->children( [
								Widget_Builder::make( 'e-paragraph' )
									->part( 'text' )
									->settings( [ 'paragraph' => Escaped_Html_Prop_Type::generate( 'New' ) ] )
									->build(),
							] )
							->build()
					)
					->general( [
						[
							'section' => 'Content',
							'fields' => [
								[
									'label' => 'Text',
									'target' => [
										'part' => 'text',
										'prop' => 'paragraph',
									],
								],
							],
						],
					] )
			);
		} );

		$module = new Module();

		// Act.
		$definitions = $module->get_registry()->all();

		// Assert.
		$this->assertSame( [ self::ICON_BUTTON_ID, self::THIRD_PARTY_ID ], array_keys( $definitions ) );
	}

	public function test_get_registry__fires_the_register_hook_once() {
		// Arrange.
		$module = new Module();
		$calls = 0;
		add_action( Module::REGISTER_HOOK, function () use ( &$calls ) {
			$calls++;
		} );

		// Act.
		$module->get_registry();
		$module->get_registry();

		// Assert.
		$this->assertSame( 1, $calls );
	}

	public function test_document_load__syncs_widget_locks_in_edit_mode() {
		// Arrange.
		$this->register_locking_widget();
		new Module();
		$document = Plugin::$instance->documents->get( $this->factory()->post->create() );
		Plugin::$instance->editor->set_edit_mode( true );

		// Act.
		$data = apply_filters( 'elementor/document/load/data', $this->stale_widget_instances(), $document );

		// Assert.
		$this->assertTrue( $data[0]['elements'][0]['isLocked'] );
		$this->assertArrayNotHasKey( 'isLocked', $data[1]['elements'][0] );
	}

	public function test_document_load__leaves_locks_alone_outside_the_editor() {
		// Arrange.
		$this->register_locking_widget();
		new Module();
		$document = Plugin::$instance->documents->get( $this->factory()->post->create() );
		Plugin::$instance->editor->set_edit_mode( false );

		// Act.
		$data = apply_filters( 'elementor/document/load/data', $this->stale_widget_instances(), $document );

		// Assert.
		$this->assertSame( $this->stale_widget_instances(), $data );
	}

	public function tearDown(): void {
		Plugin::$instance->editor->set_edit_mode( null );

		parent::tearDown();
	}

	private function register_locking_widget(): void {
		add_action( Module::REGISTER_HOOK, function ( Widgets_Definitions_Registry $registry ) {
			$registry->register( [
				'id' => self::LOCKING_WIDGET_ID,
				'version' => 1,
				'title' => 'Card',
				'template' => [
					'elType' => 'e-flexbox',
					'part' => 'root',
					'elements' => [
						[
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'part' => 'title',
						],
					],
				],
				'general' => [],
			] );
		} );
	}

	private function stale_widget_instances(): array {
		return [
			[
				'id' => 'registered-root',
				'elType' => 'e-flexbox',
				'part' => 'root',
				'widget' => [
					'id' => self::LOCKING_WIDGET_ID,
					'version' => 1,
				],
				'elements' => [
					[
						'id' => 'registered-title',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'part' => 'title',
					],
				],
			],
			[
				'id' => 'unregistered-root',
				'elType' => 'e-flexbox',
				'part' => 'root',
				'widget' => [
					'id' => self::UNREGISTERED_WIDGET_ID,
					'version' => 1,
				],
				'elements' => [
					[
						'id' => 'unregistered-title',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'part' => 'title',
						'isLocked' => true,
					],
				],
			],
		];
	}
}
