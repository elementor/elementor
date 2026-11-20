<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Libraries;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Libraries extends Elementor_Test_Base {
	public function test_defaults__are_empty_when_nothing_hooks_in() {
		$this->assertSame( [], Icon_Libraries::get_custom_libraries() );
		$this->assertSame( [], Icon_Libraries::resolve_library_values( 'x' )['values'] );
		$this->assertFalse( Icon_Libraries::is_renderable_value( 'x', 'x-y' ) );
	}

	public function test_get_custom_libraries__ignores_non_array_filter_result() {
		add_filter( 'elementor/atomic-widgets/icon/custom-libraries', '__return_false' );

		$this->assertSame( [], Icon_Libraries::get_custom_libraries() );

		remove_filter( 'elementor/atomic-widgets/icon/custom-libraries', '__return_false' );
	}

	public function test_filters__return_populated_data_from_extensions() {
		// Arrange.
		add_filter( 'elementor/atomic-widgets/icon/custom-libraries', static fn() => [ 'my-pack' => 'My Pack' ] );
		add_filter( 'elementor/atomic-widgets/icon/library-values', static fn() => [
			'values' => [ 'star' => 'my my-star' ],
			'truncated' => true,
			'total' => 300,
		] );
		add_filter( 'elementor/atomic-widgets/icon/is-renderable', static fn( $renderable, $library, $value ) => 'my-pack' === $library && 'my my-star' === $value, 10, 3 );

		// Act & Assert.
		$this->assertSame( [ 'my-pack' => 'My Pack' ], Icon_Libraries::get_custom_libraries() );
		$this->assertSame(
			[
				'values' => [ 'star' => 'my my-star' ],
				'truncated' => true,
				'total' => 300,
			],
			Icon_Libraries::resolve_library_values( 'my-pack' )
		);
		$this->assertTrue( Icon_Libraries::is_renderable_value( 'my-pack', 'my my-star' ) );
		$this->assertFalse( Icon_Libraries::is_renderable_value( 'my-pack', 'other' ) );
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/atomic-widgets/icon/custom-libraries' );
		remove_all_filters( 'elementor/atomic-widgets/icon/library-values' );
		remove_all_filters( 'elementor/atomic-widgets/icon/is-renderable' );

		parent::tearDown();
	}
}
