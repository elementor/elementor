<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	const ICON_BUTTON_ID = 'elementor/icon-button';
	const THIRD_PARTY_ID = 'acme/badge';

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
						Widget_Builder::make( 'e-paragraph' )
							->part( 'root' )
							->settings( [ 'paragraph' => Escaped_Html_Prop_Type::generate( 'New' ) ] )
							->build()
					)
					->general( [
						[
							'section' => 'Content',
							'fields' => [
								[
									'label' => 'Text',
									'target' => [
										'part' => 'root',
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
}
