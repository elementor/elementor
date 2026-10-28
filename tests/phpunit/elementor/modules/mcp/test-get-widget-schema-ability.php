<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Get_Widget_Schema_Ability;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Get_Widget_Schema_Ability extends Elementor_Test_Base {

	private Get_Widget_Schema_Ability $ability;
	private Widgets_Manager $original_widgets_manager;

	/**
	 * @var array<string, string>
	 */
	private array $original_experiment_states = [];

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Get_Widget_Schema_Ability();
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $experiment_name => $default_state ) {
			Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $default_state );
			delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		}

		V3_Widget_Map_Registry::reset_instance();
		Plugin::$instance->widgets_manager = $this->original_widgets_manager;
		parent::tearDown();
	}

	public function test_execute__rejects_heading_without_registered_map() {
		// Arrange.
		$this->act_as_admin();
		$this->given_widget_manager_with_registered_heading();
		$this->given_no_registered_v3_maps();

		// Act.
		$error_code = $this->execute_for_error_code( 'heading' );

		// Assert.
		$this->assertSame( 'elementor_v3_not_supported', $error_code );
	}

	public function test_execute__rejects_v3_container() {
		// Arrange.
		$this->act_as_admin();
		$this->given_no_registered_v3_maps();

		// Act.
		$error_code = $this->execute_for_error_code( 'container' );

		// Assert.
		$this->assertSame( 'elementor_v3_not_supported', $error_code );
	}

	public function test_execute__exposes_editor_only_decorative_description_for_atomic_container() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->execute_for_schema( 'e-flexbox' );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'boolean', $result['editor_settings']['properties']['decorative']['type'] );
		$this->assertStringStartsWith( 'Editor only', $result['editor_settings']['properties']['decorative']['description'] );
		$this->assertArrayNotHasKey( 'decorative', $result['properties'] );
	}

	public function test_execute__exposes_editor_only_name_for_every_atomic_element() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->execute_for_schema( 'e-heading' );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'string', $result['editor_settings']['properties']['name']['type'] );
		$this->assertStringStartsWith( 'Editor only', $result['editor_settings']['properties']['name']['description'] );
		$this->assertArrayNotHasKey( 'decorative', $result['editor_settings']['properties'] );
	}

	public function test_execute__rejects_v3_widget_type() {
		$this->act_as_admin();
		$this->given_widget_manager_with_fake_v3_widget( 'fake-v3' );

		$this->assertSame( 'elementor_v3_not_supported', $this->execute_for_error_code( 'fake-v3' ) );
	}

	public function test_execute__returns_404_for_unknown_widget_type() {
		$this->act_as_admin();

		$this->assertSame( 'elementor_not_found', $this->execute_for_error_code( 'does-not-exist-anywhere' ) );
	}

	public function test_execute__missing_widget_type_returns_bad_request() {
		$this->act_as_admin();

		$result = $this->ability->execute( [] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__batch_returns_each_schema_in_single_call_shape() {
		$this->act_as_admin();

		$heading = $this->execute_for_schema( 'e-heading' );
		$flexbox = $this->execute_for_schema( 'e-flexbox' );
		$result = $this->ability->execute( [ 'widget_type' => [ 'e-heading', 'e-flexbox' ] ] );

		$this->assertIsArray( $result );
		$this->assertEquals( $heading, $result['schemas']['e-heading'] );
		$this->assertEquals( $flexbox, $result['schemas']['e-flexbox'] );
		$this->assertSame( [], $result['errors'] );
	}

	public function test_execute__batch_keeps_valid_schemas_when_some_types_fail() {
		$this->act_as_admin();
		$this->given_widget_manager_with_fake_v3_widget( 'fake-v3' );

		$flexbox = $this->execute_for_schema( 'e-flexbox' );
		$result = $this->ability->execute( [
			'widget_type' => [ 'e-flexbox', 'does-not-exist-anywhere', 'fake-v3' ],
		] );

		$this->assertIsArray( $result );
		$this->assertEquals( $flexbox, $result['schemas']['e-flexbox'] );
		$this->assertArrayNotHasKey( 'does-not-exist-anywhere', $result['schemas'] );
		$this->assertArrayNotHasKey( 'fake-v3', $result['schemas'] );
		$this->assertSame( 'elementor_not_found', $result['errors']['does-not-exist-anywhere']['code'] );
		$this->assertSame( 'elementor_v3_not_supported', $result['errors']['fake-v3']['code'] );
	}

	public function test_execute__string_widget_type_returns_same_envelope_as_single_item_array() {
		$this->act_as_admin();

		$from_array = $this->ability->execute( [ 'widget_type' => [ 'e-heading' ] ] );
		$result = $this->ability->execute( [ 'widget_type' => 'e-heading' ] );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'e-heading', $result['schemas'] );
		$this->assertEquals( $from_array, $result );
	}

	public function test_execute__batch_empty_array_returns_bad_request() {
		$this->act_as_admin();

		$result = $this->ability->execute( [ 'widget_type' => [] ] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__batch_non_string_item_returns_bad_request() {
		$this->act_as_admin();

		$result = $this->ability->execute( [ 'widget_type' => [ 'e-heading', 1 ] ] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	private function execute_for_schema( string $widget_type ): array {
		$result = $this->ability->execute( [ 'widget_type' => [ $widget_type ] ] );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( $widget_type, $result['schemas'], wp_json_encode( $result['errors'] ) );

		return $result['schemas'][ $widget_type ];
	}

	private function execute_for_error_code( string $widget_type ): string {
		$result = $this->ability->execute( [ 'widget_type' => [ $widget_type ] ] );

		$this->assertIsArray( $result );
		$this->assertArrayNotHasKey( $widget_type, $result['schemas'] );

		return $result['errors'][ $widget_type ]['code'];
	}

	private function given_widget_manager_with_fake_v3_widget( string $type, array $controls = null ): void {
		$controls = $controls ?? [ 'title' => [ 'type' => 'text' ] ];

		$widget = new class( $controls ) {
			private array $controls;

			public function __construct( array $controls ) {
				$this->controls = $controls;
			}

			public function get_config(): array {
				return [
					'controls' => $this->controls,
					'atomic_props_schema' => null,
					'title' => 'Fake V3',
				];
			}
		};

		$widgets_manager = $this->createMock( Widgets_Manager::class );
		$widgets_manager->method( 'get_widget_types' )->willReturnCallback(
			function ( $name = null ) use ( $type, $widget ) {
				if ( null === $name ) {
					return [ $type => $widget ];
				}
				return $type === $name ? $widget : null;
			}
		);
		Plugin::$instance->widgets_manager = $widgets_manager;
	}

	private function given_widget_manager_with_registered_heading(): void {
		$heading = $this->original_widgets_manager->get_widget_types( 'heading' );
		$heading->get_stack();
	}

	private function given_no_registered_v3_maps(): void {
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		V3_Widget_Map_Registry::set_instance( V3_Widget_Map_Registry::create_default( [] ) );
	}

	private function set_experiment_state( string $experiment_name, string $state ): void {
		if ( ! array_key_exists( $experiment_name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $experiment_name );

			$this->original_experiment_states[ $experiment_name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		V3_Widget_Map_Registry::reset_instance();
	}
}
