<?php

namespace Elementor\Testing\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\DynamicTags\Module as V1DynamicTags;
use Elementor\Plugin;
use Elementor\Testing\Modules\AtomicWidgets\DynamicTags\Mocks\Mock_Dynamic_Tag;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__  . '/mocks/mock-dynamic-tag.php';

class Test_Dynamic_Prop_Type extends Elementor_Test_Base {

	private Dynamic_Tags_Manager $original_dynamic_tags;

	public function setUp(): void {
		parent::setUp();

		$this->original_dynamic_tags = Plugin::$instance->dynamic_tags;

		Plugin::$instance->dynamic_tags = new Dynamic_Tags_Manager();

		remove_all_actions( 'elementor/dynamic_tags/register_tags' );
		remove_all_actions( 'elementor/dynamic_tags/register' );
	}

	public function tearDown(): void {
		parent::tearDown();

		Plugin::$instance->dynamic_tags = $this->original_dynamic_tags;
	}

	public function test_validate() {
		// Arrange.
		$prop_type = Dynamic_Prop_Type::make()->categories( [
			V1DynamicTags::TEXT_CATEGORY,
		] );

		$dynamic_tag = new Mock_Dynamic_Tag();

		Plugin::$instance->dynamic_tags->register( $dynamic_tag );

		Dynamic_Tags_Module::fresh();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'mock-dynamic-tag',
				'settings' => [
					'mock-control-1' => [ '$$type' => 'string', 'value' => 'mock-value-1' ],
					'mock-control-2' => [ '$$type' => 'string', 'value' => 'valid-value' ],
				],
			],
		] );

		// Assert.
		$this->assertTrue( $result );
	}

	/**
	 * @dataProvider invalid_value_data_provider
	 */
	public function test_validate__fail_for_invalid_value( array $value ) {
		// Arrange.
		$prop_type = Dynamic_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'dynamic',
			'value' => $value,
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function invalid_value_data_provider() {
		return [
			'missing name' => [
				[ 'settings' => [], ],
			],

			'non-string name' => [
				[ 'name' => 123, 'settings' => [], ],
			],

			'missing settings' => [
				[ 'name' => 'test', ],
			],

			'non-array settings' => [
				[ 'name' => 'test', 'settings' => 'not-an-array', ],
			],

			'non-existing tag' => [
				[ 'name' => 'non-existing-tag', 'settings' => [], ],
			],
		];
	}

	public function test_validate__fail_for_unsupported_categories() {
		// Arrange.
		$prop_type = Dynamic_Prop_Type::make()->categories( [
			V1DynamicTags::NUMBER_CATEGORY,
			V1DynamicTags::DATETIME_CATEGORY,
		] );

		$dynamic_tag = new Mock_Dynamic_Tag();

		Plugin::$instance->dynamic_tags->register( $dynamic_tag );

		Dynamic_Tags_Module::fresh();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'mock-dynamic-tag',
				'settings' => [],
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fail_for_invalid_settings() {
		// Arrange.
		$prop_type = Dynamic_Prop_Type::make()->categories( [
			V1DynamicTags::TEXT_CATEGORY,
		] );

		$dynamic_tag = new Mock_Dynamic_Tag();

		Plugin::$instance->dynamic_tags->register( $dynamic_tag );

		Dynamic_Tags_Module::fresh();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'mock-dynamic-tag',
				'settings' => [
					'mock-control-1' => [ '$$type' => 'string', 'value' => 'invalid-value' ],
					'mock-control-2' => [ '$$type' => 'string', 'value' => 'valid-value' ],
				],
			],
		] );

		// Assert.
		$this->assertFalse( $result );
	}
}
