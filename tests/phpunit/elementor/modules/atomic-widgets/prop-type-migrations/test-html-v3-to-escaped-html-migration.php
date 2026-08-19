<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Html_V3_To_Escaped_Html_Migration extends Elementor_Test_Base {

	private array $migration;

	public function setUp(): void {
		parent::setUp();

		$path = ELEMENTOR_PATH . 'migrations/operations/html-v3-to-escaped-html.json';
		$this->migration = json_decode( file_get_contents( $path ), true );
	}

	public function test_up__preserves_plain_string_value_from_type_only_html_v3() {
		$data = [
			'$$type' => 'html-v3',
			'value' => 'Plain string from html-v2 migration',
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'escaped-html', $result['$$type'] );
		$this->assertSame( 'Plain string from html-v2 migration', $result['value'] );
	}

	public function test_up__unwraps_content_to_plain_string() {
		$data = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [
					'$$type' => 'string',
					'value' => 'Hello <strong>world</strong>',
				],
				'children' => [],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'escaped-html', $result['$$type'] );
		$this->assertSame( 'Hello <strong>world</strong>', $result['value'] );
		$this->assertArrayNotHasKey( 'content', $result );
	}

	public function test_up__stashes_children_for_rollback() {
		$data = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [
					'$$type' => 'string',
					'value' => 'Hello',
				],
				'children' => [
					[ 'id' => 'e-1', 'type' => 'strong', 'content' => 'world' ],
				],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'Hello', $result['value'] );
		$this->assertSame(
			[ [ 'id' => 'e-1', 'type' => 'strong', 'content' => 'world' ] ],
			$result['_html_v3_children']
		);
	}

	public function test_up__does_not_stash_empty_children() {
		$data = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [
					'$$type' => 'string',
					'value' => 'Hello',
				],
				'children' => [],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'escaped-html', $result['$$type'] );
		$this->assertSame( 'Hello', $result['value'] );
		$this->assertArrayNotHasKey( '_html_v3_children', $result );
	}

	public function test_up__null_content_becomes_null_value() {
		$data = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => null,
				'children' => [],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'escaped-html', $result['$$type'] );
		$this->assertNull( $result['value'] );
	}

	public function test_down__wraps_plain_string_back_into_content() {
		$data = [
			'$$type' => 'escaped-html',
			'value' => 'Hello <strong>world</strong>',
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertSame( 'string', $result['value']['content']['$$type'] );
		$this->assertSame( 'Hello <strong>world</strong>', $result['value']['content']['value'] );
		$this->assertSame( [], $result['value']['children'] );
	}

	public function test_down__null_value_becomes_null_content() {
		$data = [
			'$$type' => 'escaped-html',
			'value' => null,
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertNull( $result['value']['content'] );
		$this->assertSame( [], $result['value']['children'] );
	}

	public function test_down__restores_stashed_children() {
		$data = [
			'$$type' => 'escaped-html',
			'value' => 'Hello',
			'_html_v3_children' => [
				[ 'id' => 'e-1', 'type' => 'strong', 'content' => 'world' ],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertSame( 'Hello', $result['value']['content']['value'] );
		$this->assertSame(
			[ [ 'id' => 'e-1', 'type' => 'strong', 'content' => 'world' ] ],
			$result['value']['children']
		);
		$this->assertArrayNotHasKey( '_html_v3_children', $result );
	}

	public function test_roundtrip__up_then_down_preserves_content_and_children() {
		$original = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [
					'$$type' => 'string',
					'value' => 'Roundtrip test',
				],
				'children' => [
					[ 'id' => 'e-1', 'type' => 'em', 'content' => 'test' ],
				],
			],
		];

		$up = Migration_Interpreter::run( $this->migration, $original, 'up' );
		$down = Migration_Interpreter::run( $this->migration, $up, 'down' );

		$this->assertSame( 'html-v3', $down['$$type'] );
		$this->assertSame( 'Roundtrip test', $down['value']['content']['value'] );
		$this->assertSame(
			[ [ 'id' => 'e-1', 'type' => 'em', 'content' => 'test' ] ],
			$down['value']['children']
		);
	}
}
