<?php

namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags\ImportExport;

use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\DynamicTags\ImportExport\Dynamic_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\DynamicTags\Module as V1DynamicTags;
use Elementor\Plugin;
use Elementor\Testing\Modules\AtomicWidgets\DynamicTags\Mocks\Mock_Dynamic_Tag;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/../mocks/mock-dynamic-tag.php';

class Test_Dynamic_Transformer extends Elementor_Test_Base {

	private Dynamic_Transformer $transformer;
	private Dynamic_Tags_Manager $original_dynamic_tags;

	public function setUp(): void {
		parent::setUp();

		$this->transformer = new Dynamic_Transformer();
		$this->original_dynamic_tags = Plugin::$instance->dynamic_tags;

		Plugin::$instance->dynamic_tags = new Dynamic_Tags_Manager();
		remove_all_actions( 'elementor/dynamic_tags/register_tags' );
		remove_all_actions( 'elementor/dynamic_tags/register' );
	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->dynamic_tags = $this->original_dynamic_tags;
	}

	public function test_transform__adds_group_from_registry_when_missing() {
		// Arrange.
		$dynamic_tag = new Mock_Dynamic_Tag();
		Plugin::$instance->dynamic_tags->register( $dynamic_tag );
		Dynamic_Tags_Module::fresh();

		$value = [
			'name' => 'mock-dynamic-tag',
			'settings' => [],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertEquals( 'dynamic', $result['$$type'] );
		$this->assertEquals( 'mock-dynamic-tag', $result['value']['name'] );
		$this->assertArrayHasKey( 'group', $result['value'] );
		$this->assertEquals( V1DynamicTags::BASE_GROUP, $result['value']['group'] );
	}

	public function test_transform__preserves_existing_group() {
		// Arrange.
		$dynamic_tag = new Mock_Dynamic_Tag();
		Plugin::$instance->dynamic_tags->register( $dynamic_tag );
		Dynamic_Tags_Module::fresh();

		$value = [
			'name' => 'mock-dynamic-tag',
			'group' => 'custom-group',
			'settings' => [],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertEquals( 'dynamic', $result['$$type'] );
		$this->assertEquals( 'mock-dynamic-tag', $result['value']['name'] );
		$this->assertEquals( 'custom-group', $result['value']['group'] );
	}

	public function test_transform__preserves_settings() {
		// Arrange.
		$dynamic_tag = new Mock_Dynamic_Tag();
		Plugin::$instance->dynamic_tags->register( $dynamic_tag );
		Dynamic_Tags_Module::fresh();

		$value = [
			'name' => 'mock-dynamic-tag',
			'group' => 'test-group',
			'settings' => [
				'mock-control-1' => [ '$$type' => 'string', 'value' => 'test-value' ],
			],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertEquals( [ 'mock-control-1' => [ '$$type' => 'string', 'value' => 'test-value' ] ], $result['value']['settings'] );
	}

	public function test_transform__returns_null_for_empty_name() {
		// Arrange.
		$value = [
			'name' => '',
			'settings' => [],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_transform__returns_null_for_missing_name() {
		// Arrange.
		$value = [
			'settings' => [],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_transform__returns_null_for_non_string_name() {
		// Arrange.
		$value = [
			'name' => 123,
			'settings' => [],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_transform__returns_null_for_non_existing_tag() {
		// Arrange.
		Dynamic_Tags_Module::fresh();

		$value = [
			'name' => 'non-existing-tag',
			'settings' => [],
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_transform__respects_disabled_context() {
		// Arrange.
		$dynamic_tag = new Mock_Dynamic_Tag();
		Plugin::$instance->dynamic_tags->register( $dynamic_tag );
		Dynamic_Tags_Module::fresh();

		$value = [
			'name' => 'mock-dynamic-tag',
			'settings' => [],
		];
		$context = Props_Resolver_Context::make()->set_disabled( true );

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertTrue( $result['disabled'] );
	}

	public function test_transform__handles_missing_settings() {
		// Arrange.
		$dynamic_tag = new Mock_Dynamic_Tag();
		Plugin::$instance->dynamic_tags->register( $dynamic_tag );
		Dynamic_Tags_Module::fresh();

		$value = [
			'name' => 'mock-dynamic-tag',
			'group' => 'test-group',
		];
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( $value, $context );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertEquals( [], $result['value']['settings'] );
	}
}
