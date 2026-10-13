<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Output_Buffer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Output_Buffer extends TestCase {

	protected function tearDown(): void {
		while ( ob_get_level() > 0 ) {
			$level_before = ob_get_level();
			@ob_end_clean();

			if ( ob_get_level() >= $level_before ) {
				break;
			}
		}

		parent::tearDown();
	}

	public function test_discard_all_closes_nested_buffers_and_discards_content() {
		ob_start();
		ob_start();
		echo '<style id="elementor-post-1">body{}</style>';

		Output_Buffer::discard_all();

		$this->assertSame( 0, ob_get_level() );
	}

	public function test_discard_all_clears_non_removable_buffer_without_infinite_loop() {
		$end_allowed = false;
		ob_start(
			function ( $buffer ) use ( &$end_allowed ) {
				if ( $end_allowed ) {
					return $buffer;
				}

				return false;
			}
		);
		echo '<style>corrupt</style>';

		$level_before = ob_get_level();

		$started_at = microtime( true );
		Output_Buffer::discard_all();
		$elapsed_seconds = microtime( true ) - $started_at;

		$this->assertSame( $level_before, ob_get_level() );
		$this->assertSame( '', ob_get_contents() );
		$this->assertLessThan( 1, $elapsed_seconds );

		$end_allowed = true;
		ob_end_clean();
	}

	public function test_discard_all_is_noop_when_no_buffer_is_active() {
		$this->assertSame( 0, ob_get_level() );

		Output_Buffer::discard_all();

		$this->assertSame( 0, ob_get_level() );
	}
}
