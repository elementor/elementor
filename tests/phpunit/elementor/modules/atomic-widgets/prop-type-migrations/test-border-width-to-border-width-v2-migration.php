<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Border_Width_To_Border_Width_V2_Migration extends TestCase {

	private array $migration;

	public function setUp(): void {
		$path = dirname( __DIR__, 6 ) . '/migrations/operations/border-width-to-border-width-v2.json';
		$this->migration = json_decode( file_get_contents( $path ), true );
	}

	public function test_up__renames_physical_side_keys_to_logical_keys() {
		// Arrange
		$data = $this->make_legacy_border_width_data();

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'border-width-v2', $result['$$type'] );
		$this->assertArrayHasKey( 'block-start', $result['value'] );
		$this->assertArrayHasKey( 'inline-end', $result['value'] );
		$this->assertArrayHasKey( 'block-end', $result['value'] );
		$this->assertArrayHasKey( 'inline-start', $result['value'] );
		$this->assertArrayNotHasKey( 'top', $result['value'] );
		$this->assertSame( 1, $result['value']['block-start']['value']['size'] );
		$this->assertSame( 2, $result['value']['inline-end']['value']['size'] );
		$this->assertSame( 3, $result['value']['block-end']['value']['size'] );
		$this->assertSame( 4, $result['value']['inline-start']['value']['size'] );
	}

	public function test_up__renames_only_existing_sides() {
		// Arrange
		$data = [
			'$$type' => 'border-width',
			'value' => [
				'top' => $this->make_size( 2 ),
			],
		];

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'border-width-v2', $result['$$type'] );
		$this->assertSame( 2, $result['value']['block-start']['value']['size'] );
		$this->assertArrayNotHasKey( 'inline-end', $result['value'] );
	}

	public function test_down__renames_logical_side_keys_to_physical_keys() {
		// Arrange
		$data = $this->make_logical_border_width_data();

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		// Assert
		$this->assertSame( 'border-width', $result['$$type'] );
		$this->assertSame( 1, $result['value']['top']['value']['size'] );
		$this->assertSame( 2, $result['value']['right']['value']['size'] );
		$this->assertSame( 3, $result['value']['bottom']['value']['size'] );
		$this->assertSame( 4, $result['value']['left']['value']['size'] );
	}

	public function test_roundtrip__up_then_down_preserves_values() {
		// Arrange
		$original = $this->make_legacy_border_width_data();

		// Act
		$up = Migration_Interpreter::run( $this->migration, $original, 'up' );
		$down = Migration_Interpreter::run( $this->migration, $up, 'down' );

		// Assert
		$this->assertSame( $original, $down );
	}

	private function make_size( int $size ): array {
		return [
			'$$type' => 'size',
			'value' => [
				'size' => $size,
				'unit' => 'px',
			],
		];
	}

	private function make_legacy_border_width_data(): array {
		return [
			'$$type' => 'border-width',
			'value' => [
				'top' => $this->make_size( 1 ),
				'right' => $this->make_size( 2 ),
				'bottom' => $this->make_size( 3 ),
				'left' => $this->make_size( 4 ),
			],
		];
	}

	private function make_logical_border_width_data(): array {
		return [
			'$$type' => 'border-width-v2',
			'value' => [
				'block-start' => $this->make_size( 1 ),
				'inline-end' => $this->make_size( 2 ),
				'block-end' => $this->make_size( 3 ),
				'inline-start' => $this->make_size( 4 ),
			],
		];
	}
}
