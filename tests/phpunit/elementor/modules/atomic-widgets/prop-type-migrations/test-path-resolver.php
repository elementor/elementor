<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Path_Resolver;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Path_Resolver extends Elementor_Test_Base {

	/**
	 * @dataProvider resolve_data_provider
	 */
	public function test_resolve( array $data, string $pattern, array $expected_paths ) {
		// Act.
		$result = Path_Resolver::resolve( $pattern, $data );
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
		// Act.
		$result = Path_Resolver::get( $path, $data );

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
	 * @dataProvider resolve_with_wildcard_binding_data_provider
	 */
	public function test_resolve_with_wildcard_binding( array $data, string $pattern, array $wildcard_values, ?string $expected ) {
		// Act.
		$result = Path_Resolver::resolve_with_wildcard_binding( $pattern, $data, $wildcard_values );

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
