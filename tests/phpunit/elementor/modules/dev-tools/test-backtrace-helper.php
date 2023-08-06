<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\DevTools;

use Elementor\Modules\DevTools\Backtrace_Helper;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Backtrace_Helper extends Elementor_Test_Base {
	public function test_backtrace_one_level() {
		$caller = Backtrace_Helper::find_who_called_me( 1 );

		$this->assertEquals(
			[
				'function' => __FUNCTION__,
				'class' => __CLASS__,
			],
        array_slice( $caller, 0, 2, true ));

	}
	public function test_backtrace_multiple_levels() {
		for ( $i = 0; $i <= 5; $i++ ) {
			$caller = $this->run_backtrace_helper( $i + 2, $i );

			$this->assertEquals(
				[
					'function' => __FUNCTION__,
					'class' => __CLASS__,
				],
            array_slice( $caller, 0, 2, true ));

		}
	}

	private function run_backtrace_helper( $level, $count = 0 ) {
		if ( 0 === $count ) {
			return Backtrace_Helper::find_who_called_me( $level );
		}
		return $this->run_backtrace_helper( $level, $count - 1 );
	}

	public function test_backtrace_non_existing_level() {
		$caller = Backtrace_Helper::find_who_called_me( 100 );

		$this->assertEquals(
			[
				'function' => '',
				'class' => '',
				'file' => '',
				'line' => '',
				'type' => '',
                'name' => 'Unknown'
			],
        $caller);

	}

}
