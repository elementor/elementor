<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Locks the agent-facing contract so a new form prop cannot ship without a description.
 */
class Test_Atomic_Form_Agent_Ready extends Elementor_Test_Base {

	const PLUMBING_PROP_KEYS = [ 'classes', 'attributes', '_cssid', 'display-conditions' ];

	public function test_every_functional_prop_has_a_description() {
		// Arrange
		$schema = Atomic_Form::get_props_schema();

		// Assert
		foreach ( $schema as $key => $prop_type ) {
			if ( in_array( $key, self::PLUMBING_PROP_KEYS, true ) ) {
				continue;
			}

			$this->assertNotSame(
				'',
				$prop_type->get_meta()['description'] ?? '',
				"Expected e-form.{$key} to have a non-empty description."
			);
		}
	}

	public function test_llm_support_is_left_at_its_default() {
		// Act
		$config = $this->get_config();

		// Assert
		$this->assertNotFalse( $config['meta']['llm_support'] ?? null );
	}

	public function test_render_markdown_reports_the_form_name() {
		// Arrange
		$form = $this->create_form( [
			'form-name' => String_Prop_Type::generate( 'Contact' ),
		] );

		// Act
		$markdown = $form->render_markdown();

		// Assert
		$this->assertSame( 'Form "Contact"', $markdown );
	}

	public function test_render_markdown_never_exposes_action_settings() {
		// Arrange
		$form = $this->create_form( [
			'webhook_url' => String_Prop_Type::generate( 'https://hooks.example.org/secret' ),
		] );

		// Act
		$markdown = $form->render_markdown();

		// Assert
		$this->assertStringNotContainsString( 'secret', $markdown );
		$this->assertStringNotContainsString( 'example.org', $markdown );
	}

	public function test_render_markdown_lists_field_labels_and_submit_text() {
		if ( ! Plugin::$instance->widgets_manager->get_widget_types( Atomic_Form::FIELD_LABEL_TYPE ) ) {
			$this->markTestSkipped( 'Atomic form field widgets are not registered.' );
		}

		// Arrange
		$form = $this->create_form(
			[ 'form-name' => String_Prop_Type::generate( 'Contact' ) ],
			[
				$this->make_widget( 'label1', Atomic_Form::FIELD_LABEL_TYPE, 'Email' ),
				$this->make_widget( 'submit1', Atomic_Form::SUBMIT_BUTTON_TYPE, 'Send' ),
			]
		);

		// Act
		$markdown = $form->render_markdown();

		// Assert
		$this->assertSame( "Form \"Contact\"\n\n- Email\n\n**Send**", $markdown );
	}

	private function get_config(): array {
		$instance = new Atomic_Form( [
			'id' => 'config-probe',
			'elType' => Atomic_Form::get_element_type(),
			'settings' => [],
		] );

		return $instance->get_config();
	}

	private function make_widget( string $id, string $type, string $text ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => $type,
			'settings' => [
				'text' => Escaped_Html_Prop_Type::generate( $text ),
			],
		];
	}

	private function create_form( array $settings = [], array $children = [] ): Atomic_Form {
		return new Atomic_Form( [
			'id' => 'form1',
			'elType' => Atomic_Form::get_element_type(),
			'settings' => $settings,
			'elements' => $children,
		] );
	}
}
