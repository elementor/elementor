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

	/**
	 * @dataProvider invalid_value_data_provider
	 */
	public function test_validate__throws_for_invalid_value( array $value, string $message ) {
		// Arrange.
		$prop_type = Dynamic_Prop_Type::make();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( $message );

		// Act.
		$prop_type->validate( [
			'$$type' => 'dynamic',
			'value' => $value,
		] );
	}

	public function invalid_value_data_provider() {
		return [
			'missing name' => [
				[ 'settings' => [], ],
				'Property `name` is required',
			],

			'non-string name' => [
				[ 'name' => 123, 'settings' => [], ],
				'Property `name` must be a string',
			],

			'missing settings' => [
				[ 'name' => 'test', ],
				'Property `settings` is required',
			],

			'non-array settings' => [
				[ 'name' => 'test', 'settings' => 'not-an-array', ],
				'Property `settings` must be an array',
			],

			'non-existing tag' => [
				[ 'name' => 'non-existing-tag', 'settings' => [], ],
				'Dynamic tag `non-existing-tag` does not exist',
			],
		];
	}

	public function test_validate__throws_for_unsupported_categories() {
		// Arrange.
		$prop_type = Dynamic_Prop_Type::make()->categories( [
			V1DynamicTags::NUMBER_CATEGORY,
			V1DynamicTags::DATETIME_CATEGORY,
		] );

		$dynamic_tag = new Mock_Dynamic_Tag();

		Plugin::$instance->dynamic_tags->register( $dynamic_tag );

		Dynamic_Tags_Module::fresh();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Dynamic tag `mock-dynamic-tag` categories (text, url) are not in supported categories (number, datetime)' );

		// Act.
		$prop_type->validate( [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'mock-dynamic-tag',
				'settings' => [],
			],
		] );
	}

	public function test_validate__throws_for_invalid_settings() {
		// Arrange.
		$prop_type = Dynamic_Prop_Type::make()->categories( [
			V1DynamicTags::TEXT_CATEGORY,
		] );

		$dynamic_tag = new Mock_Dynamic_Tag();

		Plugin::$instance->dynamic_tags->register( $dynamic_tag );

		Dynamic_Tags_Module::fresh();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Dynamic tag settings validation failed. Invalid keys: mock-control-1' );

		// Act.
		$prop_type->validate( [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'mock-dynamic-tag',
				'settings' => [
					'mock-control-1' => 'invalid-value',
					'mock-control-2' => 'valid-value',
				],
			],
		] );
	}
}
