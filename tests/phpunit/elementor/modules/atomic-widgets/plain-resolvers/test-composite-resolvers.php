<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PlainResolvers;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Dynamic_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Global_Variable_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Html_V3_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\String_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Number_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Composite_Resolvers extends TestCase {

	public function test_global_variable_resolver__resolves_label_to_id() {
		$variables_service = $this->createMock( Variables_Service::class );
		$variables_service->method( 'find_by_label_or_id' )->with( 'Primary' )->willReturn( [ 'id' => 'var-123' ] );

		$resolver = new Global_Variable_Plain_Resolver( $variables_service, Color_Variable_Prop_Type::get_key() );

		$this->assertSame(
			[
				'$$type' => 'global-color-variable',
				'value' => 'var-123',
			],
			$resolver->resolve( 'Primary' )
		);
	}

	public function test_global_variable_resolver__falls_back_to_input_when_not_found() {
		$variables_service = $this->createMock( Variables_Service::class );
		$variables_service->method( 'find_by_label_or_id' )->willReturn( null );

		$resolver = new Global_Variable_Plain_Resolver( $variables_service, Color_Variable_Prop_Type::get_key() );

		$this->assertSame(
			[
				'$$type' => 'global-color-variable',
				'value' => 'unknown-id',
			],
			$resolver->resolve( 'unknown-id' )
		);
	}

	public function test_dynamic_resolver__builds_dynamic_envelope_from_plain_input() {
		$module = Dynamic_Tags_Module::fresh();
		$reflection = new \ReflectionClass( $module->registry );
		$tags_prop = $reflection->getProperty( 'tags' );
		$tags_prop->setAccessible( true );
		$tags_prop->setValue( $module->registry, [] );

		$resolver = new Dynamic_Plain_Resolver();

		$result = $resolver->resolve( [ 'name' => 'unknown-tag' ] );

		$this->assertSame( Dynamic_Prop_Type::get_key(), $result['$$type'] );
		$this->assertSame( 'unknown-tag', $result['value']['name'] );
		$this->assertSame( [], $result['value']['settings'] );
	}

	public function test_dynamic_resolver__skips_setting_when_sub_resolve_fails() {
		$this->seed_dynamic_tag( 'my-tag', [
			'title' => String_Prop_Type::make(),
			'count' => Number_Prop_Type::make(),
		] );

		$registry = new Plain_Resolvers_Registry();
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );
		$registry->register( Number_Prop_Type::get_key(), new Number_Plain_Resolver() );
		$walker = new Plain_Values_Resolver( $registry );

		$resolver = new Dynamic_Plain_Resolver( $walker );

		$result = $resolver->resolve( [
			'name' => 'my-tag',
			'settings' => [
				'title' => 'Hello',
				'count' => 'not-a-number',
			],
		] );

		$this->assertNotNull( $result, 'Failed sub-resolve should not fail the whole dynamic envelope' );
		$this->assertSame( 'Hello', $result['value']['settings']['title']['value'] ?? null );
		$this->assertArrayNotHasKey( 'count', $result['value']['settings'] );
	}

	private function seed_dynamic_tag( string $name, array $props_schema ): void {
		$module = Dynamic_Tags_Module::fresh();
		$reflection = new \ReflectionClass( $module->registry );
		$tags_prop = $reflection->getProperty( 'tags' );
		$tags_prop->setAccessible( true );
		$tags_prop->setValue( $module->registry, [
			$name => [
				'name' => $name,
				'group' => 'test',
				'categories' => [],
				'props_schema' => $props_schema,
			],
		] );
	}

	public function test_html_v3_resolver__resolves_plain_content_to_string_envelope() {
		$registry = new Plain_Resolvers_Registry();
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );
		$walker = new Plain_Values_Resolver( $registry );
		$registry->register( Html_V3_Prop_Type::get_key(), new Html_V3_Plain_Resolver( $walker ) );
		$walker = new Plain_Values_Resolver( $registry );

		$result = $walker->resolve(
			[
				'content' => 'Hello',
				'children' => [
					[
						'id' => 'child-1',
						'type' => 'span',
						'content' => 'world',
					],
				],
			],
			Html_V3_Prop_Type::make()
		);

		$this->assertSame(
			[
				'$$type' => 'html-v3',
				'value' => [
					'content' => [ '$$type' => 'string', 'value' => 'Hello' ],
					'children' => [
						[
							'id' => 'child-1',
							'type' => 'span',
							'content' => 'world',
						],
					],
				],
			],
			$result
		);
	}
}
