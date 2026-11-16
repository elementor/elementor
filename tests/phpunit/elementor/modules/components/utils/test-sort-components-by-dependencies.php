<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\Components\Utils\Sort_Components_By_Dependencies;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Components
 */
class Test_Sort_Components_By_Dependencies extends TestCase {

	public function test_apply__puts_dependencies_first_for_a_chain() {
		// Arrange
		$manifest = [
			1 => [ 'title' => 'A' ],
			2 => [ 'title' => 'B' ],
			3 => [ 'title' => 'C' ],
		];
		$dependencies = [
			1 => [ 'depends_on' => [ 2 ] ],
			2 => [ 'depends_on' => [ 3 ] ],
			3 => [ 'depends_on' => [] ],
		];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $manifest, $dependencies );

		// Assert
		$this->assertSame( [ 3, 2, 1 ], array_keys( $result ) );
		$this->assertSame( [ 'title' => 'A' ], $result[1] );
	}

	public function test_apply__keeps_manifest_order_without_dependencies() {
		// Arrange
		$manifest = [
			7 => [ 'title' => 'First' ],
			4 => [ 'title' => 'Second' ],
		];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $manifest, [] );

		// Assert
		$this->assertSame( [ 7, 4 ], array_keys( $result ) );
	}

	public function test_apply__ignores_dependencies_missing_from_manifest() {
		// Arrange
		$manifest = [
			1 => [ 'title' => 'A' ],
		];
		$dependencies = [
			1 => [ 'depends_on' => [ 99 ] ],
		];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $manifest, $dependencies );

		// Assert
		$this->assertSame( [ 1 ], array_keys( $result ) );
	}

	public function test_apply__includes_every_component_once_on_cycles() {
		// Arrange
		$manifest = [
			1 => [ 'title' => 'A' ],
			2 => [ 'title' => 'B' ],
		];
		$dependencies = [
			1 => [ 'depends_on' => [ 2 ] ],
			2 => [ 'depends_on' => [ 1 ] ],
		];

		// Act
		$result = Sort_Components_By_Dependencies::apply( $manifest, $dependencies );

		// Assert
		$this->assertEqualsCanonicalizing( [ 1, 2 ], array_keys( $result ) );
		$this->assertCount( 2, $result );
	}
}
