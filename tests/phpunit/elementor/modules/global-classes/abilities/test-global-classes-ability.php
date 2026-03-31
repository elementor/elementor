<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\GlobalClasses\Abilities\Global_Classes_Ability;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\GlobalClasses
 */
class Test_Global_Classes_Ability extends TestCase {

	private Kit $kit;
	private Kits_Manager $kits_manager;
	private Global_Classes_Ability $ability;

	protected function setUp(): void {
		parent::setUp();

		$this->kit          = $this->createMock( Kit::class );
		$this->kits_manager = $this->createMock( Kits_Manager::class );
		$this->kits_manager->method( 'get_active_kit' )->willReturn( $this->kit );
		$this->ability = new Global_Classes_Ability( $this->kits_manager );
	}

	public function test_execute__returns_frontend_preview_and_count(): void {
		// Arrange
		$frontend = [ 'items' => [ 'cls-1' => [ 'label' => 'Primary' ] ], 'order' => [ 'cls-1' ] ];
		$preview  = [ 'items' => [ 'cls-2' => [ 'label' => 'Draft' ] ],   'order' => [ 'cls-2' ] ];

		$this->kit->method( 'get_json_meta' )->willReturnMap( [
			[ Global_Classes_Repository::META_KEY_FRONTEND, $frontend ],
			[ Global_Classes_Repository::META_KEY_PREVIEW,  $preview  ],
		] );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( $frontend, $result['frontend'] );
		$this->assertSame( $preview,  $result['preview'] );
		$this->assertSame( 1, $result['count'] );
	}

	public function test_execute__count_reflects_number_of_frontend_items(): void {
		// Arrange
		$frontend = [
			'items' => [
				'cls-1' => [ 'label' => 'One' ],
				'cls-2' => [ 'label' => 'Two' ],
				'cls-3' => [ 'label' => 'Three' ],
			],
			'order' => [ 'cls-1', 'cls-2', 'cls-3' ],
		];

		$this->kit->method( 'get_json_meta' )->willReturnMap( [
			[ Global_Classes_Repository::META_KEY_FRONTEND, $frontend ],
			[ Global_Classes_Repository::META_KEY_PREVIEW,  [] ],
		] );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( 3, $result['count'] );
	}

	public function test_execute__normalizes_non_array_frontend_to_empty_structure(): void {
		// Arrange
		$this->kit->method( 'get_json_meta' )->willReturnMap( [
			[ Global_Classes_Repository::META_KEY_FRONTEND, false ],
			[ Global_Classes_Repository::META_KEY_PREVIEW,  false ],
		] );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( [ 'items' => [], 'order' => [] ], $result['frontend'] );
		$this->assertSame( 0, $result['count'] );
	}

	public function test_execute__normalizes_non_array_preview_to_empty_structure(): void {
		// Arrange
		$frontend = [ 'items' => [], 'order' => [] ];

		$this->kit->method( 'get_json_meta' )->willReturnMap( [
			[ Global_Classes_Repository::META_KEY_FRONTEND, $frontend ],
			[ Global_Classes_Repository::META_KEY_PREVIEW,  null ],
		] );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( [ 'items' => [], 'order' => [] ], $result['preview'] );
	}
}
