<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Webmcp_Utils;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Form_Render extends Elementor_Test_Base {

	private const FORM_ELEMENT_ID = 'abc123de';

	public function test_render_frontend_includes_webmcp_attributes(): void {
		// Arrange.
		$form = $this->make_atomic_form_instance( [
			'form-name' => [
				'$$type' => 'string',
				'value' => 'Contact Form',
			],
		] );

		// Act.
		$rendered_output = $this->render_form( $form, false );

		// Assert.
		$expected_tool_name = Webmcp_Utils::build_tool_name( 'Contact Form', self::FORM_ELEMENT_ID );
		$expected_tool_description = Webmcp_Utils::build_tool_description( 'Contact Form' );

		$this->assertStringContainsString( 'toolname="' . $expected_tool_name . '"', $rendered_output );
		$this->assertStringContainsString( 'tooldescription="' . $expected_tool_description . '"', $rendered_output );
	}

	public function test_render_frontend_includes_webmcp_autosubmit_when_enabled(): void {
		// Arrange.
		$form = $this->make_atomic_form_instance( [
			'form-name' => [
				'$$type' => 'string',
				'value' => 'Contact Form',
			],
			'webmcp-autosubmit' => [
				'$$type' => 'boolean',
				'value' => true,
			],
		] );

		// Act.
		$rendered_output = $this->render_form( $form, false );

		// Assert.
		$this->assertStringContainsString( 'toolautosubmit', $rendered_output );
	}

	public function test_render_editor_excludes_webmcp_attributes(): void {
		// Arrange.
		$form = $this->make_atomic_form_instance( [
			'form-name' => [
				'$$type' => 'string',
				'value' => 'Contact Form',
			],
			'webmcp-autosubmit' => [
				'$$type' => 'boolean',
				'value' => true,
			],
		] );

		// Act.
		$rendered_output = $this->render_form( $form, true );

		// Assert.
		$this->assertStringNotContainsString( 'toolname=', $rendered_output );
		$this->assertStringNotContainsString( 'tooldescription=', $rendered_output );
		$this->assertStringNotContainsString( 'toolautosubmit', $rendered_output );
	}

	private function make_atomic_form_instance( array $settings = [] ): Atomic_Form {
		return new Atomic_Form( [
			'id' => self::FORM_ELEMENT_ID,
			'elType' => Atomic_Form::get_element_type(),
			'widgetType' => Atomic_Form::get_element_type(),
			'settings' => $settings,
		], null );
	}

	private function render_form( Atomic_Form $form, bool $is_edit_mode ): string {
		$original_edit_mode = Plugin::$instance->editor->is_edit_mode();
		Plugin::$instance->editor->set_edit_mode( $is_edit_mode );

		try {
			ob_start();
			$form->print_element();

			return (string) ob_get_clean();
		} finally {
			Plugin::$instance->editor->set_edit_mode( $original_edit_mode );
		}
	}
}
