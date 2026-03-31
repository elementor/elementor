<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Abilities;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Abilities\Atomic_Widgets_Ability;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\AtomicWidgets
 */
class Test_Atomic_Widgets_Ability extends TestCase {

	private Elements_Manager $elements_manager;
	private Breakpoints_Manager $breakpoints_manager;

	protected function setUp(): void {
		parent::setUp();

		$this->elements_manager    = $this->createMock( Elements_Manager::class );
		$this->breakpoints_manager = $this->createMock( Breakpoints_Manager::class );
	}

	private function make_ability( string $prop_types_dir = '' ): Atomic_Widgets_Ability {
		return new Atomic_Widgets_Ability(
			$this->elements_manager,
			$this->breakpoints_manager,
			$prop_types_dir
		);
	}

	public function test_execute__returns_all_expected_keys(): void {
		// Arrange
		$this->elements_manager->method( 'get_element_types' )->willReturn( [] );
		$this->breakpoints_manager->method( 'get_breakpoints_config' )->willReturn( [] );

		// Act
		$result = $this->make_ability()->execute( [] );

		// Assert
		$this->assertArrayHasKey( 'style_schema', $result );
		$this->assertArrayHasKey( 'prop_types', $result );
		$this->assertArrayHasKey( 'atomic_elements', $result );
		$this->assertArrayHasKey( 'breakpoints', $result );
	}

	public function test_execute__returns_breakpoints_from_manager(): void {
		// Arrange
		$expected = [
			'desktop' => [ 'label' => 'Desktop', 'value' => 0 ],
			'tablet'  => [ 'label' => 'Tablet',  'value' => 1024 ],
		];

		$this->elements_manager->method( 'get_element_types' )->willReturn( [] );
		$this->breakpoints_manager->method( 'get_breakpoints_config' )->willReturn( $expected );

		// Act
		$result = $this->make_ability()->execute( [] );

		// Assert
		$this->assertSame( $expected, $result['breakpoints'] );
	}

	public function test_execute__filters_elements_to_atomic_widget_base_instances(): void {
		// Arrange
		$atomic = $this->createMock( Atomic_Widget_Base::class );
		$other  = $this->createMock( \Elementor\Widget_Base::class );

		$this->elements_manager->method( 'get_element_types' )->willReturn( [
			'e-heading' => $atomic,
			'text'      => $other,
		] );
		$this->breakpoints_manager->method( 'get_breakpoints_config' )->willReturn( [] );

		// Act
		$result = $this->make_ability()->execute( [] );

		// Assert
		$this->assertSame( [ 'e-heading' ], $result['atomic_elements'] );
	}

	public function test_execute__handles_elements_manager_throwable(): void {
		// Arrange
		$this->elements_manager->method( 'get_element_types' )
			->willThrowException( new \RuntimeException( 'manager unavailable' ) );
		$this->breakpoints_manager->method( 'get_breakpoints_config' )->willReturn( [] );

		// Act
		$result = $this->make_ability()->execute( [] );

		// Assert
		$this->assertIsArray( $result['atomic_elements'] );
		$this->assertArrayHasKey( 'error', $result['atomic_elements'] );
		$this->assertSame( 'manager unavailable', $result['atomic_elements']['error'] );
	}

	public function test_execute__returns_empty_prop_types_for_missing_directory(): void {
		// Arrange
		$this->elements_manager->method( 'get_element_types' )->willReturn( [] );
		$this->breakpoints_manager->method( 'get_breakpoints_config' )->willReturn( [] );

		// Act — pass a non-existent directory
		$result = $this->make_ability( '/non/existent/path' )->execute( [] );

		// Assert
		$this->assertSame( [], $result['prop_types'] );
	}

	public function test_execute__returns_prop_type_filenames_without_extension(): void {
		// Arrange
		$this->elements_manager->method( 'get_element_types' )->willReturn( [] );
		$this->breakpoints_manager->method( 'get_breakpoints_config' )->willReturn( [] );

		$dir = sys_get_temp_dir() . '/elementor-prop-types-' . uniqid();
		mkdir( $dir );
		touch( $dir . '/color-prop-type.php' );
		touch( $dir . '/size-prop-type.php' );

		// Act
		$result = $this->make_ability( $dir )->execute( [] );

		// Cleanup
		array_map( 'unlink', glob( $dir . '/*.php' ) );
		rmdir( $dir );

		// Assert
		$this->assertEqualsCanonicalizing(
			[ 'color-prop-type', 'size-prop-type' ],
			$result['prop_types']
		);
	}
}
