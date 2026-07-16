<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Editor_Config;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Dynamic_Tag_Llm_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Dynamic_Tag_Llm_Resolver extends TestCase {

	private $original_instance;

	protected function setUp(): void {
		parent::setUp();

		$this->original_instance = Dynamic_Tags_Module::instance();
	}

	protected function tearDown(): void {
		$reflection = new \ReflectionClass( Dynamic_Tags_Module::class );
		$instance_prop = $reflection->getProperty( 'instance' );
		$instance_prop->setAccessible( true );
		$instance_prop->setValue( null, $this->original_instance );

		parent::tearDown();
	}

	private function given_tags( array $tags ): void {
		$module = Dynamic_Tags_Module::fresh();

		$reflection = new \ReflectionClass( Dynamic_Tags_Editor_Config::class );
		$tags_prop = $reflection->getProperty( 'tags' );
		$tags_prop->setAccessible( true );
		$tags_prop->setValue( $module->registry, $tags );

		$module_reflection = new \ReflectionClass( Dynamic_Tags_Module::class );
		$instance_prop = $module_reflection->getProperty( 'instance' );
		$instance_prop->setAccessible( true );
		$instance_prop->setValue( null, $module );
	}

	public function test_resolve__fills_group_from_registry_and_wraps_scalar_settings() {
		// Arrange
		$this->given_tags( [
			'post-custom-field' => [
				'name' => 'post-custom-field',
				'label' => 'Post Custom Field',
				'group' => 'post',
				'categories' => [ 'text', 'url' ],
				'props_schema' => [
					'key' => String_Prop_Type::make()->default( '' ),
					'before' => String_Prop_Type::make()->default( 'prefix' ),
					'fallback' => String_Prop_Type::make()->default( '' ),
				],
			],
		] );

		// Act
		$resolved = Dynamic_Tag_Llm_Resolver::resolve( [
			'name' => 'post-custom-field',
			'settings' => [ 'key' => 'price' ],
		] );

		// Assert
		$this->assertSame( 'dynamic', $resolved['$$type'] );
		$this->assertSame( 'post-custom-field', $resolved['value']['name'] );
		$this->assertSame( 'post', $resolved['value']['group'] );

		$settings = $resolved['value']['settings'];
		$this->assertSame( [ '$$type' => 'string', 'value' => 'price' ], $settings['key'] );
		$this->assertSame( [ '$$type' => 'string', 'value' => 'prefix' ], $settings['before'] );

		$this->assertArrayNotHasKey( 'fallback', $settings );
	}

	public function test_resolve__keeps_already_wrapped_settings_untouched() {
		// Arrange
		$this->given_tags( [
			'post-custom-field' => [
				'name' => 'post-custom-field',
				'label' => 'Post Custom Field',
				'group' => 'post',
				'categories' => [ 'text' ],
				'props_schema' => [
					'key' => String_Prop_Type::make(),
				],
			],
		] );

		// Act
		$resolved = Dynamic_Tag_Llm_Resolver::resolve( [
			'name' => 'post-custom-field',
			'settings' => [
				'key' => [ '$$type' => 'string', 'value' => 'price' ],
			],
		] );

		// Assert
		$this->assertSame(
			[ '$$type' => 'string', 'value' => 'price' ],
			$resolved['value']['settings']['key']
		);
	}

	public function test_resolve__returns_complete_value_for_unknown_tags() {
		// Arrange
		$this->given_tags( [] );

		// Act
		$resolved = Dynamic_Tag_Llm_Resolver::resolve( [
			'name' => 'does-not-exist',
		] );

		// Assert
		$this->assertSame( [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'does-not-exist',
				'group' => '',
				'settings' => [],
			],
		], $resolved );
	}

	public function test_resolve__uses_initial_value_when_available() {
		// Arrange
		$this->given_tags( [
			'site-title' => [
				'name' => 'site-title',
				'label' => 'Site Title',
				'group' => 'site',
				'categories' => [ 'text' ],
				'props_schema' => [
					'prefix' => String_Prop_Type::make()->initial_value( '--' ),
				],
			],
		] );

		// Act
		$resolved = Dynamic_Tag_Llm_Resolver::resolve( [
			'name' => 'site-title',
			'settings' => [],
		] );

		// Assert
		$this->assertSame(
			[ '$$type' => 'string', 'value' => '--' ],
			$resolved['value']['settings']['prefix']
		);
	}

	public function test_resolve__handles_null_input() {
		// Arrange
		$this->given_tags( [] );

		// Act
		$resolved = Dynamic_Tag_Llm_Resolver::resolve( null );

		// Assert
		$this->assertSame( [
			'$$type' => 'dynamic',
			'value' => [
				'name' => '',
				'group' => '',
				'settings' => [],
			],
		], $resolved );
	}

	public function test_resolve__skips_settings_without_default_or_initial_value() {
		// Arrange
		$this->given_tags( [
			'post-title' => [
				'name' => 'post-title',
				'label' => 'Post Title',
				'group' => 'post',
				'categories' => [ 'text' ],
				'props_schema' => [
					'optional_field' => String_Prop_Type::make(),
				],
			],
		] );

		// Act
		$resolved = Dynamic_Tag_Llm_Resolver::resolve( [
			'name' => 'post-title',
			'settings' => [],
		] );

		// Assert
		$this->assertArrayNotHasKey( 'optional_field', $resolved['value']['settings'] );
	}

	public function test_make__returns_callable_transformer() {
		// Arrange
		$this->given_tags( [
			'site-title' => [
				'name' => 'site-title',
				'label' => 'Site Title',
				'group' => 'site',
				'categories' => [ 'text' ],
				'props_schema' => [],
			],
		] );

		// Act
		$transformer = Dynamic_Tag_Llm_Resolver::make();
		$resolved = $transformer( [ 'name' => 'site-title', 'settings' => [] ] );

		// Assert
		$this->assertIsCallable( $transformer );
		$this->assertSame( 'dynamic', $resolved['$$type'] );
		$this->assertSame( 'site-title', $resolved['value']['name'] );
		$this->assertSame( 'site', $resolved['value']['group'] );
	}
}
