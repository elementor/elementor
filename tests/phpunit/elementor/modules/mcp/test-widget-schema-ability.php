<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Widget_Schema_Ability;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Widget_Schema_Ability extends Elementor_Test_Base {

	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	public function setUp(): void {
		parent::setUp();

		$this->original_widgets_manager  = Plugin::$instance->widgets_manager;
		$this->original_elements_manager = Plugin::$instance->elements_manager;
	}

	public function tearDown(): void {
		Plugin::$instance->widgets_manager  = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;

		parent::tearDown();
	}

	public function test_execute__returns_404_for_unknown_widget_type() {
		// Arrange
		$this->act_as_admin();
		$this->stub_registries_with_nothing();

		// Act
		$result = ( new Widget_Schema_Ability( 'non-existent' ) )->execute();

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'widget_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__v4_returns_object_schema_with_properties_and_llm_guidance() {
		// Arrange
		$this->act_as_admin();
		$this->stub_registries_with_widget( 'e-stub', $this->make_v4_config( [
			'text' => String_Prop_Type::make()->default( 'hello' ),
		] ) );

		// Act
		$result = ( new Widget_Schema_Ability( 'e-stub' ) )->execute();

		// Assert
		$this->assertSame( 'object', $result['type'] );
		$this->assertArrayHasKey( 'text', $result['properties'] );
		$this->assertArrayHasKey( 'llm_guidance', $result );
		$this->assertArrayHasKey( 'can_have_children', $result['llm_guidance'] );
		$this->assertArrayHasKey( 'nullable_properties', $result['llm_guidance'] );
	}

	public function test_execute__v4_filters_out_non_configurable_props() {
		// Arrange
		$this->act_as_admin();
		$this->stub_registries_with_widget( 'e-stub', $this->make_v4_config( [
			'text'    => String_Prop_Type::make(),
			'classes' => String_Prop_Type::make(),
			'_cssid'  => String_Prop_Type::make(),
		] ) );

		// Act
		$result = ( new Widget_Schema_Ability( 'e-stub' ) )->execute();

		// Assert
		$this->assertArrayHasKey( 'text', $result['properties'] );
		$this->assertArrayNotHasKey( 'classes', $result['properties'] );
		$this->assertArrayNotHasKey( '_cssid', $result['properties'] );
	}

	public function test_execute__v4_throws_on_atomic_flag_without_schema() {
		// Arrange
		$this->act_as_admin();
		$this->stub_registries_with_widget( 'e-stub', [ 'atomic' => true ] );

		// Act & Assert
		$this->expectException( \RuntimeException::class );

		( new Widget_Schema_Ability( 'e-stub' ) )->execute();
	}

	public function test_execute__v3_returns_object_schema_from_controls() {
		// Arrange
		$this->act_as_admin();
		$this->stub_registries_with_widget( 'legacy-widget', [
			'controls' => [
				'title'  => [ 'type' => 'text', 'default' => 'Hello' ],
				'layout' => [ 'type' => 'section' ],
				'size'   => [ 'type' => 'select', 'options' => [ 'sm' => 'Small', 'lg' => 'Large' ] ],
			],
		] );

		// Act
		$result = ( new Widget_Schema_Ability( 'legacy-widget' ) )->execute();

		// Assert
		$this->assertSame( 'object', $result['type'] );
		$this->assertArrayHasKey( 'title', $result['properties'] );
		$this->assertSame( 'Hello', $result['properties']['title']['default'] );
		$this->assertArrayNotHasKey( 'layout', $result['properties'] );
		$this->assertArrayHasKey( 'options', $result['properties']['size'] );
	}

	public function test_execute__falls_back_to_elements_manager_when_not_in_widgets_manager() {
		// Arrange
		$this->act_as_admin();

		$mock_widgets = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )->willReturn( null );
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_element = $this->createMock( \Elementor\Element_Base::class );
		$mock_element->method( 'get_config' )->willReturn( $this->make_v4_config( [
			'active' => Boolean_Prop_Type::make()->default( true ),
		] ) );

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturn( $mock_element );
		Plugin::$instance->elements_manager = $mock_elements;

		// Act
		$result = ( new Widget_Schema_Ability( 'e-flexbox' ) )->execute();

		// Assert
		$this->assertSame( 'object', $result['type'] );
		$this->assertArrayHasKey( 'active', $result['properties'] );
	}

	private function make_v4_config( array $props_schema ): array {
		return [
			'atomic'              => true,
			'atomic_props_schema' => $props_schema,
			'base_styles'         => [],
			'meta'                => [],
			'default_children'    => [],
		];
	}

	private function stub_registries_with_nothing(): void {
		$mock_widgets = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )->willReturn( null );
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturn( null );
		Plugin::$instance->elements_manager = $mock_elements;
	}

	private function stub_registries_with_widget( string $type, array $config ): void {
		$mock_widget = $this->createMock( \Elementor\Widget_Base::class );
		$mock_widget->method( 'get_config' )->willReturn( $config );

		$mock_widgets = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )->with( $type )->willReturn( $mock_widget );
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturn( null );
		Plugin::$instance->elements_manager = $mock_elements;
	}
}
