<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Proxy_Routing extends Elementor_Test_Base {

	private Mcp_Proxy_REST_API $proxy;
	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	public function setUp(): void {
		parent::setUp();

		$this->proxy                         = new Mcp_Proxy_REST_API();
		$this->original_widgets_manager      = Plugin::$instance->widgets_manager;
		$this->original_elements_manager     = Plugin::$instance->elements_manager;
	}

	public function tearDown(): void {
		Plugin::$instance->widgets_manager  = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;

		parent::tearDown();
	}

	public function test_unknown_uri_returns_404() {
		// Act
		$result = $this->dispatch( 'elementor://does-not-exist' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'unknown_resource', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_exact_match_uri_routes_to_registered_resource() {
		// Act
		$result = $this->dispatch( 'elementor://style/best-practices' );

		// Assert
		$this->assertNotWPError( $result );
	}

	public function test_widget_schema_prefix_applies_llm_dialect() {
		// Arrange
		$this->act_as_admin();
		$this->stub_widget( 'e-stub', [
			'atomic'              => true,
			'atomic_props_schema' => [
				'title' => String_Prop_Type::make()->default( 'hello' ),
			],
			'base_styles'      => [],
			'meta'             => [],
			'default_children' => [],
		] );

		// Act
		$result = $this->dispatch( 'elementor://widgets/schema/e-stub' );

		// Assert — dialect applied: plain JSON schema type, not raw prop-type object
		$this->assertNotWPError( $result );
		$this->assertSame( 'object', $result['type'] );
		$this->assertSame( 'string', $result['properties']['title']['type'] );
		$this->assertSame( 'hello', $result['properties']['title']['default'] );
	}

	public function test_widget_schema_without_explicit_dialect_defaults_to_llm() {
		// Arrange
		$this->act_as_admin();
		$this->stub_widget( 'e-stub', [
			'atomic'              => true,
			'atomic_props_schema' => [
				'title' => String_Prop_Type::make()->default( 'hello' ),
			],
			'base_styles'      => [],
			'meta'             => [],
			'default_children' => [],
		] );

		// Act — no dialect in input
		$ability = new \Elementor\Modules\Mcp\Abilities\Widget_Schema_Ability( 'e-stub' );
		$result  = $ability->execute( [] );

		// Assert — defaults to llm: JSON schema format, not raw prop-type
		$this->assertSame( 'string', $result['properties']['title']['type'] );
		$this->assertSame( 'hello', $result['properties']['title']['default'] );
	}

	public function test_widget_schema_prefix_returns_404_for_unknown_widget_type() {
		// Arrange
		$this->act_as_admin();
		$this->stub_nothing();

		// Act
		$result = $this->dispatch( 'elementor://widgets/schema/non-existent' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'widget_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	private function dispatch( string $uri ) {
		$ref = new \ReflectionMethod( $this->proxy, 'dispatch_resource' );
		$ref->setAccessible( true );

		return $ref->invoke( $this->proxy, $uri );
	}

	private function stub_widget( string $type, array $config ): void {
		$mock_widget = $this->createMock( \Elementor\Widget_Base::class );
		$mock_widget->method( 'get_config' )->willReturn( $config );

		$mock_widgets = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )->with( $type )->willReturn( $mock_widget );
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturn( null );
		Plugin::$instance->elements_manager = $mock_elements;
	}

	private function stub_nothing(): void {
		$mock_widgets = $this->createMock( Widgets_Manager::class );
		$mock_widgets->method( 'get_widget_types' )->willReturn( null );
		Plugin::$instance->widgets_manager = $mock_widgets;

		$mock_elements = $this->createMock( Elements_Manager::class );
		$mock_elements->method( 'get_element_types' )->willReturn( null );
		Plugin::$instance->elements_manager = $mock_elements;
	}
}
