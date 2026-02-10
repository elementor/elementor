<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V2_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Atomic_Form extends Elementor_Test_Base {
	public function test__default_children_include_input_submit_success_error(): void {
		$instance = new Atomic_Form();
		$config = $instance->get_config();
		$children = $config['default_children'] ?? [];

		$this->assertCount( 4, $children );

		$input = $children[0];
		$this->assertSame( 'widget', $input['elType'] );
		$this->assertSame( 'e-form-input', $input['widgetType'] );
		$this->assertFalse( $input['isLocked'] ?? false );

		$button = $children[1];
		$this->assertSame( 'widget', $button['elType'] );
		$this->assertSame( Atomic_Button::get_element_type(), $button['widgetType'] );
		$this->assertTrue( $button['isLocked'] ?? false );

		$expected_button_settings = [
			'text' => Html_V2_Prop_Type::generate( [
				'content'  => __( 'Submit', 'elementor' ),
				'children' => [],
			] ),
			'attributes' => Attributes_Prop_Type::generate( [
				Key_Value_Prop_Type::generate( [
					'key' => String_Prop_Type::generate( 'type' ),
					'value' => String_Prop_Type::generate( 'submit' ),
				] ),
			] ),
		];
		$this->assertSame( $expected_button_settings, $button['settings'] );

		$success = $children[2];
		$this->assertSame( 'e-div-block', $success['elType'] );
		$this->assertSame(
			Attributes_Prop_Type::generate( [
				Key_Value_Prop_Type::generate( [
					'key' => String_Prop_Type::generate( 'data-e-state' ),
					'value' => String_Prop_Type::generate( 'success' ),
				] ),
			] ),
			$success['settings']['attributes'] ?? null
		);
		$this->assertSame( 'Success message', $success['editor_settings']['title'] ?? null );
		$this->assertTrue( $success['isLocked'] ?? false );

		$error = $children[3];
		$this->assertSame( 'e-div-block', $error['elType'] );
		$this->assertSame(
			Attributes_Prop_Type::generate( [
				Key_Value_Prop_Type::generate( [
					'key' => String_Prop_Type::generate( 'data-e-state' ),
					'value' => String_Prop_Type::generate( 'error' ),
				] ),
			] ),
			$error['settings']['attributes'] ?? null
		);
		$this->assertSame( 'Error message', $error['editor_settings']['title'] ?? null );
		$this->assertTrue( $error['isLocked'] ?? false );
	}

	public function test__default_tag_is_form(): void {
		$instance = new Atomic_Form();
		$config = $instance->get_config();

		$this->assertSame( 'form', $config['default_html_tag'] ?? null );
	}
}
