<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Atomic_Background_Video extends Elementor_Test_Base {

	public function test_state_defaults_to_playing() {
		$schema = Atomic_Background_Video::get_props_schema();
		$state = $schema['state'];

		$this->assertSame( 'playing', $state->get_default()['value'] );
		$this->assertTrue( $state->validate( $state->get_default() ) );
	}
}
