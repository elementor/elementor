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
class Test_Border_Radius_Legacy_Migration extends TestCase {

	private array $migration;

	public function setUp(): void {
		$path = dirname( __DIR__, 6 ) . '/migrations/operations/border-radius-legacy-to-border-radius.json';
		$this->migration = json_decode( file_get_contents( $path ), true );
	}

	public function test_up__renames_physical_corner_keys_to_logical_keys() {
		// Arrange
		$data = $this->make_legacy_border_radius_data();

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'border-radius', $result['$$type'] );
		$this->assertArrayHasKey( 'start-start', $result['value'] );
		$this->assertArrayHasKey( 'start-end', $result['value'] );
		$this->assertArrayHasKey( 'end-end', $result['value'] );
		$this->assertArrayHasKey( 'end-start', $result['value'] );
		$this->assertArrayNotHasKey( 'top-left', $result['value'] );
		$this->assertSame( 10, $result['value']['start-start']['value']['size'] );
		$this->assertSame( 20, $result['value']['start-end']['value']['size'] );
		$this->assertSame( 30, $result['value']['end-end']['value']['size'] );
		$this->assertSame( 40, $result['value']['end-start']['value']['size'] );
	}

	public function test_up__renames_only_existing_corners() {
		// Arrange
		$data = [
			'$$type' => 'border-radius-legacy',
			'value' => [
				'top-left' => $this->make_size( 8 ),
			],
		];

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertSame( 'border-radius', $result['$$type'] );
		$this->assertSame( 8, $result['value']['start-start']['value']['size'] );
		$this->assertArrayNotHasKey( 'start-end', $result['value'] );
	}

	public function test_down__renames_logical_corner_keys_to_physical_keys() {
		// Arrange
		$data = $this->make_logical_border_radius_data();

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		// Assert
		$this->assertSame( 'border-radius-legacy', $result['$$type'] );
		$this->assertSame( 10, $result['value']['top-left']['value']['size'] );
		$this->assertSame( 20, $result['value']['top-right']['value']['size'] );
		$this->assertSame( 30, $result['value']['bottom-right']['value']['size'] );
		$this->assertSame( 40, $result['value']['bottom-left']['value']['size'] );
	}

	public function test_roundtrip__up_then_down_preserves_values() {
		// Arrange
		$original = $this->make_legacy_border_radius_data();

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

	private function make_legacy_border_radius_data(): array {
		return [
			'$$type' => 'border-radius-legacy',
			'value' => [
				'top-left' => $this->make_size( 10 ),
				'top-right' => $this->make_size( 20 ),
				'bottom-right' => $this->make_size( 30 ),
				'bottom-left' => $this->make_size( 40 ),
			],
		];
	}

	private function make_logical_border_radius_data(): array {
		return [
			'$$type' => 'border-radius',
			'value' => [
				'start-start' => $this->make_size( 10 ),
				'start-end' => $this->make_size( 20 ),
				'end-end' => $this->make_size( 30 ),
				'end-start' => $this->make_size( 40 ),
			],
		];
	}
}
