<?php

namespace Elementor\Testing\Modules\Components\Transformers;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\Components\Documents\Component;
use Elementor\Modules\Components\Transformers\Component_Instance_Transformer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use PHPUnit\Framework\MockObject\MockObject;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Instance_Transformer extends Elementor_Test_Base {
	const COMPONENT_ID_A = 123;
	const COMPONENT_ID_B = 456;
	const MOCK_CONTENT_A = '<div class="component-a">Component A Content</div>';
	const MOCK_CONTENT_B = '<div class="component-b">Component B Content</div>';

	private Documents_Manager $original_documents_manager;
	private MockObject $documents_manager_mock;

	public function setUp(): void {
		parent::setUp();

		Component_Instance_Transformer::reset_rendering_stack();
		$this->mock_documents_manager();
	}

	public function tearDown(): void {
		parent::tearDown();

		Component_Instance_Transformer::reset_rendering_stack();
		$this->restore_documents_manager();
	}

	public function test_transform__returns_content_for_valid_component() {
		// Arrange
		$this->setup_single_component_mock( self::COMPONENT_ID_A, self::MOCK_CONTENT_A );
		$transformer = new Component_Instance_Transformer();

		// Act
		$result = $transformer->transform(
			[ 'component_id' => self::COMPONENT_ID_A ],
			Props_Resolver_Context::make()
		);

		// Assert
		$this->assertStringContainsString( 'component-a', $result );
	}

	public function test_transform__returns_empty_string_for_direct_circular_reference() {
		// Arrange
		$transformer = new Component_Instance_Transformer();
		$self_nesting_component = new Mock_Self_Nesting_Component( self::COMPONENT_ID_A );

		$this->documents_manager_mock
			->method( 'get_doc_for_frontend' )
			->willReturn( $self_nesting_component );

		// Act
		$result = $transformer->transform(
			[ 'component_id' => self::COMPONENT_ID_A ],
			Props_Resolver_Context::make()
		);

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_transform__returns_empty_string_for_nested_circular_reference() {
		// Arrange
		$transformer = new Component_Instance_Transformer();

		// Component A contains Component B, Component B tries to render Component A (circular)
		$component_a = new Mock_Nesting_Component( self::COMPONENT_ID_A, self::COMPONENT_ID_B );
		$component_b = new Mock_Nesting_Component( self::COMPONENT_ID_B, self::COMPONENT_ID_A );

		$this->documents_manager_mock
			->method( 'get_doc_for_frontend' )
			->willReturnCallback( fn( $id ) => $id === self::COMPONENT_ID_A ? $component_a : $component_b );

		// Act
		$result = $transformer->transform(
			[ 'component_id' => self::COMPONENT_ID_A ],
			Props_Resolver_Context::make()
		);

		// Assert - The nested render of A should return empty due to circular reference
		$this->assertEmpty( $result );
	}

	private function mock_documents_manager(): void {
		$this->original_documents_manager = Plugin::$instance->documents;

		$this->documents_manager_mock = $this->createMock( Documents_Manager::class );
		$this->documents_manager_mock->method( 'switch_to_document' )->willReturn( null );
		$this->documents_manager_mock->method( 'restore_document' )->willReturn( null );

		Plugin::$instance->documents = $this->documents_manager_mock;
	}

	private function restore_documents_manager(): void {
		Plugin::$instance->documents = $this->original_documents_manager;
	}

	private function setup_single_component_mock( int $component_id, string $content ): void {
		$component = new Mock_Simple_Component( $component_id, $content );

		$this->documents_manager_mock
			->method( 'get_doc_for_frontend' )
			->with( $component_id )
			->willReturn( $component );
	}
}

class Mock_Simple_Component extends Component {
	private int $id;
	private string $content;

	public function __construct( int $id, string $content ) {
		$this->id = $id;
		$this->content = $content;
	}

	public function get_post(): object {
		return (object) [ 'ID' => $this->id ];
	}

	public function is_built_with_elementor(): bool {
		return true;
	}

	public function get_elements_data( $status = self::STATUS_PUBLISH ): array {
		return [ 'mock' => 'data' ];
	}

	public function print_elements( $data ): void {
		echo $this->content;
	}
}

class Mock_Self_Nesting_Component extends Component {
	private int $id;

	public function __construct( int $id ) {
		$this->id = $id;
	}

	public function get_post(): object {
		return (object) [ 'ID' => $this->id ];
	}

	public function is_built_with_elementor(): bool {
		return true;
	}

	public function get_elements_data( $status = self::STATUS_PUBLISH ): array {
		return [ 'mock' => 'data' ];
	}

	public function print_elements( $data ): void {
		$transformer = new Component_Instance_Transformer();
		$result = $transformer->transform(
			[ 'component_id' => $this->id ],
			Props_Resolver_Context::make()
		);
		echo $result;
	}
}

class Mock_Nesting_Component extends Component {
	private int $id;
	private int $nested_id;

	public function __construct( int $id, int $nested_id ) {
		$this->id = $id;
		$this->nested_id = $nested_id;
	}

	public function get_post(): object {
		return (object) [ 'ID' => $this->id ];
	}

	public function is_built_with_elementor(): bool {
		return true;
	}

	public function get_elements_data( $status = self::STATUS_PUBLISH ): array {
		return [ 'mock' => 'data' ];
	}

	public function print_elements( $data ): void {
		$transformer = new Component_Instance_Transformer();
		$result = $transformer->transform(
			[ 'component_id' => $this->nested_id ],
			Props_Resolver_Context::make()
		);
		echo $result;
	}
}
