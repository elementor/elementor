<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Path_Resolver;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Path_Resolver extends Elementor_Test_Base {

	/**
	 * @dataProvider resolve_data_provider
	 */
	public function test_resolve( array $data, string $pattern, array $expected_paths ) {
		// Arrange.
		$resolver = Path_Resolver::make( $data );

		// Act.
		$result = $resolver->resolve( $pattern );
		$paths = array_map( fn( $item ) => $item['path'], $result );

		// Assert.
		$this->assertEquals( $expected_paths, $paths );
	}

	public function resolve_data_provider(): array {
		return [
			'simple path' => [
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'pattern' => 'settings.tag',
				'expected' => [ 'settings.tag' ],
			],
			'wildcard key' => [
				'data' => [
					'settings' => [
						'link' => [ 'value' => 'a' ],
						'text' => [ 'value' => 'b' ],
					],
				],
				'pattern' => 'settings.*.value',
				'expected' => [ 'settings.link.value', 'settings.text.value' ],
			],
			'array index wildcard' => [
				'data' => [
					'elements' => [
						[ 'id' => '1' ],
						[ 'id' => '2' ],
					],
				],
				'pattern' => 'elements[*].id',
				'expected' => [ 'elements[0].id', 'elements[1].id' ],
			],
			'nested wildcards' => [
				'data' => [
					'styles' => [
						's1' => [
							'variants' => [
								[ 'props' => [ 'width' => 100 ] ],
								[ 'props' => [ 'height' => 200 ] ],
							],
						],
					],
				],
				'pattern' => 'styles.*.variants[*].props.*',
				'expected' => [
					'styles.s1.variants[0].props.width',
					'styles.s1.variants[1].props.height',
				],
			],
			'non-existent path returns empty' => [
				'data' => [ 'settings' => [] ],
				'pattern' => 'settings.nonexistent.value',
				'expected' => [],
			],
		];
	}

	/**
	 * @dataProvider get_data_provider
	 */
	public function test_get( array $data, string $path, $expected ) {
		// Arrange.
		$resolver = Path_Resolver::make( $data );

		// Act.
		$result = $resolver->get( $path );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function get_data_provider(): array {
		return [
			'simple get' => [
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'path' => 'settings.tag',
				'expected' => 'h3',
			],
			'nested get' => [
				'data' => [ 'settings' => [ 'link' => [ 'value' => [ 'tag' => 'a' ] ] ] ],
				'path' => 'settings.link.value.tag',
				'expected' => 'a',
			],
			'array index get' => [
				'data' => [ 'elements' => [ [ 'id' => '1' ], [ 'id' => '2' ] ] ],
				'path' => 'elements[1].id',
				'expected' => '2',
			],
			'non-existent returns null' => [
				'data' => [ 'settings' => [] ],
				'path' => 'settings.nonexistent',
				'expected' => null,
			],
		];
	}

	/**
	 * @dataProvider set_data_provider
	 */
	public function test_set( array $data, string $path, $value, array $expected ) {
		// Arrange.
		$resolver = Path_Resolver::make( $data );

		// Act.
		$resolver->set( $path, $value );

		// Assert.
		$this->assertSame( $expected, $resolver->get_data() );
	}

	public function set_data_provider(): array {
		return [
			'set existing' => [
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'path' => 'settings.tag',
				'value' => 'h1',
				'expected' => [ 'settings' => [ 'tag' => 'h1' ] ],
			],
			'set new key' => [
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'path' => 'settings.newKey',
				'value' => 'newValue',
				'expected' => [ 'settings' => [ 'tag' => 'h3', 'newKey' => 'newValue' ] ],
			],
			'set nested creates path' => [
				'data' => [ 'settings' => [] ],
				'path' => 'settings.deep.nested.value',
				'value' => 'test',
				'expected' => [ 'settings' => [ 'deep' => [ 'nested' => [ 'value' => 'test' ] ] ] ],
			],
			'set array index' => [
				'data' => [ 'elements' => [ [ 'id' => '1' ], [ 'id' => '2' ] ] ],
				'path' => 'elements[0].id',
				'value' => 'updated',
				'expected' => [ 'elements' => [ [ 'id' => 'updated' ], [ 'id' => '2' ] ] ],
			],
		];
	}

	/**
	 * @dataProvider delete_data_provider
	 */
	public function test_delete( array $data, string $path, array $expected ) {
		// Arrange.
		$resolver = Path_Resolver::make( $data );

		// Act.
		$resolver->delete( $path );

		// Assert.
		$this->assertSame( $expected, $resolver->get_data() );
	}

	public function delete_data_provider(): array {
		return [
			'delete existing' => [
				'data' => [ 'settings' => [ 'tag' => 'h3', 'other' => 'value' ] ],
				'path' => 'settings.tag',
				'expected' => [ 'settings' => [ 'other' => 'value' ] ],
			],
			'delete nested' => [
				'data' => [ 'settings' => [ 'link' => [ 'value' => [ 'tag' => 'a', 'target' => '_blank' ] ] ] ],
				'path' => 'settings.link.value.tag',
				'expected' => [ 'settings' => [ 'link' => [ 'value' => [ 'target' => '_blank' ] ] ] ],
			],
			'delete non-existent is no-op' => [
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'path' => 'settings.nonexistent',
				'expected' => [ 'settings' => [ 'tag' => 'h3' ] ],
			],
		];
	}

	/**
	 * @dataProvider exists_data_provider
	 */
	public function test_exists( array $data, string $path, bool $expected ) {
		// Arrange.
		$resolver = Path_Resolver::make( $data );

		// Act.
		$result = $resolver->exists( $path );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function exists_data_provider(): array {
		return [
			'exists simple' => [
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'path' => 'settings.tag',
				'expected' => true,
			],
			'exists null value' => [
				'data' => [ 'settings' => [ 'tag' => null ] ],
				'path' => 'settings.tag',
				'expected' => true,
			],
			'not exists' => [
				'data' => [ 'settings' => [] ],
				'path' => 'settings.nonexistent',
				'expected' => false,
			],
		];
	}

	/**
	 * @dataProvider rename_key_data_provider
	 */
	public function test_rename_key( array $data, string $path, string $new_key, array $expected ) {
		// Arrange.
		$resolver = Path_Resolver::make( $data );

		// Act.
		$resolver->rename_key( $path, $new_key );

		// Assert.
		$this->assertSame( $expected, $resolver->get_data() );
	}

	public function rename_key_data_provider(): array {
		return [
			'rename simple' => [
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'path' => 'settings.tag',
				'new_key' => 'htmlTag',
				'expected' => [ 'settings' => [ 'htmlTag' => 'h3' ] ],
			],
			'rename preserves value' => [
				'data' => [ 'settings' => [ 'link' => [ 'value' => 'test' ] ] ],
				'path' => 'settings.link',
				'new_key' => 'url',
				'expected' => [ 'settings' => [ 'url' => [ 'value' => 'test' ] ] ],
			],
		];
	}

	/**
	 * @dataProvider resolve_with_wildcard_binding_data_provider
	 */
	public function test_resolve_with_wildcard_binding( array $data, string $pattern, array $wildcard_values, ?string $expected ) {
		// Arrange.
		$resolver = Path_Resolver::make( $data );

		// Act.
		$result = $resolver->resolve_with_wildcard_binding( $pattern, $wildcard_values );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function resolve_with_wildcard_binding_data_provider(): array {
		return [
			'bind single wildcard' => [
				'data' => [
					'settings' => [
						'link' => [ '$$type' => 'link' ],
						'text' => [ '$$type' => 'string' ],
					],
				],
				'pattern' => 'settings.*.$$type',
				'wildcard_values' => [ [ 'key' => 'link', 'type' => 'key' ] ],
				'expected' => 'settings.link.$$type',
			],
			'bind multiple wildcards' => [
				'data' => [
					'styles' => [
						's1' => [
							'variants' => [
								[ 'props' => [ 'width' => [ '$$type' => 'size' ] ] ],
							],
						],
					],
				],
				'pattern' => 'styles.*.variants[*].props.*.$$type',
				'wildcard_values' => [
					[ 'key' => 's1', 'type' => 'key' ],
					[ 'key' => 0, 'type' => 'index' ],
					[ 'key' => 'width', 'type' => 'key' ],
				],
				'expected' => 'styles.s1.variants[0].props.width.$$type',
			],
			'returns null if path does not exist' => [
				'data' => [ 'settings' => [] ],
				'pattern' => 'settings.*.value',
				'wildcard_values' => [ [ 'key' => 'nonexistent', 'type' => 'key' ] ],
				'expected' => null,
			],
		];
	}
}
