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
class Test_Html_V2_To_Html_V3_Migration extends Elementor_Test_Base {

	private array $migration;

	public function setUp(): void {
		parent::setUp();

		$path = ELEMENTOR_PATH . 'migrations/operations/html-v2-to-html-v3.json';
		$this->migration = json_decode( file_get_contents( $path ), true );
	}

	public function test_up__wraps_content_as_string_prop() {
		$data = [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello <strong>world</strong>',
				'children' => [],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertSame( 'string', $result['value']['content']['$$type'] );
		$this->assertSame( 'Hello <strong>world</strong>', $result['value']['content']['value'] );
		$this->assertSame( [], $result['value']['children'] );
	}

	public function test_up__null_content_stays_null() {
		$data = [
			'$$type' => 'html-v2',
			'value' => [
				'content' => null,
				'children' => [],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertNull( $result['value']['content'] );
		$this->assertSame( [], $result['value']['children'] );
	}

	public function test_up__empty_string_content_is_wrapped() {
		$data = [
			'$$type' => 'html-v2',
			'value' => [
				'content' => '',
				'children' => [],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertSame( 'string', $result['value']['content']['$$type'] );
		$this->assertSame( '', $result['value']['content']['value'] );
	}

	public function test_up__preserves_children() {
		$data = [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Hello <strong id="e-1">world</strong>',
				'children' => [
					[ 'id' => 'e-1', 'type' => 'strong', 'content' => 'world' ],
				],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		$this->assertSame( 'html-v3', $result['$$type'] );
		$this->assertCount( 1, $result['value']['children'] );
		$this->assertSame( 'e-1', $result['value']['children'][0]['id'] );
		$this->assertSame( 'strong', $result['value']['children'][0]['type'] );
	}

	public function test_down__unwraps_content_to_plain_string() {
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

		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		$this->assertSame( 'html-v2', $result['$$type'] );
		$this->assertSame( 'Hello <strong>world</strong>', $result['value']['content'] );
		$this->assertSame( [], $result['value']['children'] );
	}

	public function test_down__null_content_stays_null() {
		$data = [
			'$$type' => 'html-v3',
			'value' => [
				'content' => null,
				'children' => [],
			],
		];

		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		$this->assertSame( 'html-v2', $result['$$type'] );
		$this->assertNull( $result['value']['content'] );
		$this->assertSame( [], $result['value']['children'] );
	}

	public function test_roundtrip__up_then_down_restores_original() {
		$original = [
			'$$type' => 'html-v2',
			'value' => [
				'content' => 'Roundtrip test',
				'children' => [
					[ 'id' => 'e-1', 'type' => 'em', 'content' => 'test' ],
				],
			],
		];

		$up = Migration_Interpreter::run( $this->migration, $original, 'up' );
		$down = Migration_Interpreter::run( $this->migration, $up, 'down' );

		$this->assertSame( $original['$$type'], $down['$$type'] );
		$this->assertSame( $original['value']['content'], $down['value']['content'] );
		$this->assertSame( $original['value']['children'], $down['value']['children'] );
	}

	public function test_roundtrip__null_content_survives_roundtrip() {
		$original = [
			'$$type' => 'html-v2',
			'value' => [
				'content' => null,
				'children' => [],
			],
		];

		$up = Migration_Interpreter::run( $this->migration, $original, 'up' );
		$down = Migration_Interpreter::run( $this->migration, $up, 'down' );

		$this->assertSame( $original['$$type'], $down['$$type'] );
		$this->assertNull( $down['value']['content'] );
	}
}
