<?php

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Atomic_Form;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Webmcp_Utils;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Form_Render extends Elementor_Test_Base {

	private const FORM_ELEMENT_ID = 'abc123de';

	private const AGENTS_SECTION_ID = 'agents';

	private Agent_Ready_Settings $agent_settings;

	private string $original_webmcp_experiment_state;

	public function setUp(): void {
		parent::setUp();

		delete_option( Agent_Ready_Settings::OPTION );

		$this->agent_settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->agent_settings->activate();
		$this->set_browser_tools_enabled( true );

		$this->original_webmcp_experiment_state = Plugin::$instance->experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_FORM_WEBMCP )['default'];
		$this->set_webmcp_experiment_state( Experiments_Manager::STATE_ACTIVE );
	}

	public function tearDown(): void {
		$this->set_webmcp_experiment_state( $this->original_webmcp_experiment_state );
		delete_option( Agent_Ready_Settings::OPTION );

		parent::tearDown();
	}

	public function test_render_frontend_includes_webmcp_attributes_when_browser_tools_are_disabled_and_experiment_is_inactive(): void {
		// Arrange.
		$this->set_browser_tools_enabled( false );
		$this->set_webmcp_experiment_state( Experiments_Manager::STATE_INACTIVE );
		$form = $this->make_atomic_form_instance();

		// Act.
		$rendered_output = $this->render_form( $form, false );

		// Assert.
		$this->assertStringContainsString( 'toolname=', $rendered_output );
	}

	public function test_render_frontend_excludes_webmcp_attributes_when_browser_tools_are_disabled(): void {
		// Arrange.
		$this->set_browser_tools_enabled( false );
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
		$this->assertStringNotContainsString( 'toolname=', $rendered_output );
		$this->assertStringNotContainsString( 'tooldescription=', $rendered_output );
		$this->assertStringNotContainsString( 'toolautosubmit', $rendered_output );
	}

	public function test_render_context_reports_not_exposed_when_browser_tools_are_disabled(): void {
		// Arrange.
		$this->set_browser_tools_enabled( false );
		$define_render_context = new ReflectionMethod( Atomic_Form::class, 'define_render_context' );
		$define_render_context->setAccessible( true );

		// Act.
		$render_context = $define_render_context->invoke( $this->make_atomic_form_instance() );

		// Assert.
		$this->assertFalse( $render_context[0]['context'][ Atomic_Form::WEBMCP_EXPOSE ] );
	}

	public function test_props_schema_excludes_webmcp_props_when_browser_tools_are_disabled(): void {
		// Arrange.
		$this->set_browser_tools_enabled( false );

		// Act.
		$schema = Atomic_Form::get_props_schema();

		// Assert.
		$this->assertArrayNotHasKey( 'webmcp-autosubmit', $schema );
		$this->assertArrayNotHasKey( Atomic_Form::WEBMCP_EXPOSE, $schema );
	}

	public function test_controls_exclude_agents_section_when_browser_tools_are_disabled(): void {
		// Arrange.
		$this->set_browser_tools_enabled( false );
		$form = $this->make_atomic_form_instance();

		// Act.
		$section_ids = $this->get_section_ids( $form );

		// Assert.
		$this->assertNotContains( self::AGENTS_SECTION_ID, $section_ids );
	}

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
		$this->assertStringContainsString(
			'tooldescription="' . str_replace( ' ', '&#x20;', $expected_tool_description ) . '"',
			$rendered_output
		);
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

	public function test_render_frontend_excludes_webmcp_attributes_when_not_exposed_to_agents(): void {
		// Arrange.
		$experiments = Plugin::$instance->experiments;
		$original_state = $experiments->get_features( Atomic_Widgets_Module::EXPERIMENT_FORM_WEBMCP )['default'];
		$experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_FORM_WEBMCP, Experiments_Manager::STATE_ACTIVE );
		Render_Props_Resolver::reset();

		try {
			$form = $this->make_atomic_form_instance( [
				'form-name' => [
					'$$type' => 'string',
					'value' => 'Contact Form',
				],
				'webmcp-autosubmit' => [
					'$$type' => 'boolean',
					'value' => true,
				],
				Atomic_Form::WEBMCP_EXPOSE => [
					'$$type' => 'boolean',
					'value' => false,
				],
			] );

			// Act.
			$rendered_output = $this->render_form( $form, false );
		} finally {
			$experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_FORM_WEBMCP, $original_state );
			Render_Props_Resolver::reset();
		}

		// Assert.
		$this->assertStringNotContainsString( 'toolname=', $rendered_output );
		$this->assertStringNotContainsString( 'tooldescription=', $rendered_output );
		$this->assertStringNotContainsString( 'toolautosubmit', $rendered_output );
	}

	private function set_browser_tools_enabled( bool $is_enabled ): void {
		$this->agent_settings->set_server_value( Agent_Ready_Settings::MODULE_BROWSER_TOOLS, 'enabled', $is_enabled );
	}

	private function set_webmcp_experiment_state( string $state ): void {
		Plugin::$instance->experiments->set_feature_default_state( Atomic_Widgets_Module::EXPERIMENT_FORM_WEBMCP, $state );
	}

	private function get_section_ids( Atomic_Form $form ): array {
		return array_map(
			fn( $control ) => $control->get_id(),
			$form->get_atomic_controls()
		);
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
