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

require_once __DIR__ . '/../../components/mocks/mock-pro-license-api.php';

class Test_Atomic_Form extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		\Mock_Pro_License_API::reset();
	}

	public function test_action_webhook_constant_matches_expected_slug() {
		$this->assertSame( 'webhook', Atomic_Form::ACTION_WEBHOOK );
	}

	public function test_props_schema_includes_webhook_url_string_prop() {
		$schema = Atomic_Form::get_props_schema();

		$this->assertArrayHasKey( 'webhook_url', $schema );
		$this->assertInstanceOf( Prop_Type::class, $schema['webhook_url'] );
		$this->assertArrayHasKey( 'actions-after-submit', $schema );
	}

	public function test_webhook_url_default_passes_validation() {
		$schema = Atomic_Form::get_props_schema();
		$prop = $schema['webhook_url'];
		$default = $prop->get_default();

		$this->assertTrue( $prop->validate( $default ) );
	}

	public function test_actions_after_submit_control_includes_webhook_chip() {
		$form = $this->make_atomic_form_instance();

		$chips = $this->find_control_by_bind( $form->get_atomic_controls(), 'actions-after-submit' );
		$this->assertInstanceOf( Chips_Control::class, $chips );

		$values = array_column( $chips->get_props()['options'] ?? [], 'value' );
		$this->assertContains( Atomic_Form::ACTION_WEBHOOK, $values );
	}

	/**
	 * @dataProvider collect_submissions_chip_by_plan_type_provider
	 */
	public function test_actions_after_submit_collect_submissions_chip_by_plan_type( string $plan_type, bool $should_include_chip ) {
		// Arrange
		\Mock_Pro_License_API::set_license_state( true );
		\Mock_Pro_License_API::set_plan_type( $plan_type );

		// Act
		$form = $this->make_atomic_form_instance();
		$chips = $this->find_control_by_bind( $form->get_atomic_controls(), 'actions-after-submit' );
		$values = array_column( $chips->get_props()['options'] ?? [], 'value' );

		// Assert
		if ( $should_include_chip ) {
			$this->assertContains( Atomic_Form::ACTION_COLLECT_SUBMISSIONS, $values );
		} else {
			$this->assertNotContains( Atomic_Form::ACTION_COLLECT_SUBMISSIONS, $values );
		}
	}

	public function collect_submissions_chip_by_plan_type_provider(): array {
		return [
			'essential plan' => [ 'essential', false ],
			'advanced plan' => [ 'advanced', true ],
			'expert plan' => [ 'expert', true ],
			'agency plan' => [ 'agency', true ],
		];
	}

	public function test_webhook_url_text_control_is_registered() {
		$form = $this->make_atomic_form_instance();

		$url_control = $this->find_control_by_bind( $form->get_atomic_controls(), 'webhook_url' );
		$this->assertInstanceOf( Text_Control::class, $url_control );
		$this->assertSame( 'text', $url_control->get_type() );
	}

	public function test_get_base_settings_includes_email_defaults() {
		$form = $this->make_atomic_form_instance();
		$base_settings = $form->get_base_settings();

		$this->assertArrayHasKey( 'email', $base_settings );
		$this->assertSame( 'emails', $base_settings['email']['$$type'] );

		$email_value = $base_settings['email']['value'];

		$this->assertSame(
			Atomic_Form::get_default_recipient_email(),
			$email_value['to']['value'][0]['value']
		);
		$this->assertSame(
			Atomic_Form::get_default_sender_email(),
			$email_value['from']['value']
		);
		$this->assertSame( '[all-fields]', $email_value['message']['value'] );
	}

	public function test_initial_config_includes_base_settings() {
		$form = $this->make_atomic_form_instance();
		$reflection = new \ReflectionMethod( Atomic_Form::class, 'get_initial_config' );
		$reflection->setAccessible( true );
		$config = $reflection->invoke( $form );

		$this->assertArrayHasKey( 'base_settings', $config );
		$this->assertArrayHasKey( 'email', $config['base_settings'] );
	}

	public function test_base_settings_keys_match_email_prop_schema_keys() {
		$form = $this->make_atomic_form_instance();
		$schema = Atomic_Form::get_props_schema();
		$email_prop_keys = array_filter(
			array_keys( $schema ),
			static fn( $key ) => str_starts_with( $key, Atomic_Form::ACTION_EMAIL )
		);

		$this->assertSame(
			array_values( $email_prop_keys ),
			array_keys( $form->get_base_settings() )
		);
	}

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
