<?php

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Chips_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Form extends Elementor_Test_Base {

	public function test_action_webhook_constant_matches_expected_slug() {
		$this->assertSame( 'webhook', Atomic_Form::ACTION_WEBHOOK );
	}

	public function test_props_schema_includes_webhook_url_string_prop() {
		$schema = Atomic_Form::get_props_schema();

		$this->assertArrayHasKey( 'webhook_url', $schema );
		$this->assertInstanceOf( Prop_Type::class, $schema['webhook_url'] );
		$this->assertArrayHasKey( 'actions-after-submit', $schema );
	}

	public function test_actions_after_submit_control_includes_webhook_chip() {
		$form = $this->make_atomic_form_instance();

		$chips = $this->find_control_by_bind( $form->get_atomic_controls(), 'actions-after-submit' );
		$this->assertInstanceOf( Chips_Control::class, $chips );

		$values = array_column( $chips->get_props()['options'] ?? [], 'value' );
		$this->assertContains( Atomic_Form::ACTION_WEBHOOK, $values );
	}

	public function test_webhook_url_text_control_is_registered() {
		$form = $this->make_atomic_form_instance();

		$url_control = $this->find_control_by_bind( $form->get_atomic_controls(), 'webhook_url' );
		$this->assertInstanceOf( Text_Control::class, $url_control );
		$this->assertSame( 'text', $url_control->get_type() );
	}

	/**
	 * @param Section[]|Atomic_Control_Base[] $controls
	 */
	private function find_control_by_bind( array $controls, string $bind ): ?Atomic_Control_Base {
		foreach ( $controls as $control ) {
			if ( $control instanceof Section ) {
				$found = $this->find_control_by_bind( $control->get_items(), $bind );
				if ( null !== $found ) {
					return $found;
				}
				continue;
			}

			if ( $control instanceof Atomic_Control_Base && $control->get_bind() === $bind ) {
				return $control;
			}
		}

		return null;
	}

	private function make_atomic_form_instance(): Atomic_Form {
		return new Atomic_Form( [
			'id' => 'test_atomic_form_instance',
			'elType' => 'widget',
			'widgetType' => Atomic_Form::get_element_type(),
			'settings' => [],
		], null );
	}
}
