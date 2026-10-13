<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\Ajax;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	private function get_discard_output_buffers_method(): \ReflectionMethod {
		$ajax = Plugin::$instance->common->get_component( 'ajax' );
		$method = new \ReflectionMethod( Ajax_Module::class, 'discard_output_buffers' );
		$method->setAccessible( true );

		return $method;
	}

	public function test_discard_output_buffers_clears_nested_buffers() {
		$method = $this->get_discard_output_buffers_method();

		ob_start();
		ob_start();
		echo 'buffered';

		$method->invoke( Plugin::$instance->common->get_component( 'ajax' ) );

		$this->assertSame( 0, ob_get_level() );
	}

	public function test_discard_output_buffers_stops_when_ob_end_clean_fails() {
		$method = $this->get_discard_output_buffers_method();

		ob_start( function ( $buffer ) {
			return $buffer;
		}, 0, PHP_OUTPUT_HANDLER_FLUSHABLE );

		echo str_repeat( 'a', 17 * 1024 );

		$started_at = microtime( true );

		$method->invoke( Plugin::$instance->common->get_component( 'ajax' ) );

		$elapsed_seconds = microtime( true ) - $started_at;

		$this->assertLessThan( 1, $elapsed_seconds, 'Buffer cleanup must not loop indefinitely when ob_end_clean fails.' );

		while ( ob_get_level() ) {
			@ob_end_clean();
		}
	}
}
