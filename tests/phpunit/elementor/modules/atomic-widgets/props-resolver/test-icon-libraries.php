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
}
