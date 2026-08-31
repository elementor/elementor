<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Background_Video extends Elementor_Test_Base {

	private function get_define_props_schema(): array {
		$reflection = new \ReflectionMethod( Atomic_Background_Video::class, 'define_props_schema' );
		$reflection->setAccessible( true );

		return $reflection->invoke( null );
	}

	public function test_state_prop_defaults_to_playing() {
		$schema = $this->get_define_props_schema();

		$this->assertSame( 'playing', $schema['state']->get_default()['value'] );
		$this->assertSame( [ 'playing', 'paused' ], $schema['state']->get_enum() );
	}
}
