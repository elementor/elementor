<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Frontend;

use Elementor\Core\Frontend\Widget_Content_Render_Mode;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Widget_Content_Render_Mode extends Elementor_Test_Base {

	public function tearDown(): void {
		Widget_Content_Render_Mode::set_current( Widget_Content_Render_Mode::NORMAL );

		parent::tearDown();
	}

	public function test_defaults_to_normal_mode() {
		$this->assertSame( Widget_Content_Render_Mode::NORMAL, Widget_Content_Render_Mode::get_current() );
		$this->assertFalse( Widget_Content_Render_Mode::is( Widget_Content_Render_Mode::MARKDOWN ) );
	}

	public function test_execute_as_resets_mode_after_callback() {
		Widget_Content_Render_Mode::execute_as( Widget_Content_Render_Mode::MARKDOWN, static function () {
			return Widget_Content_Render_Mode::get_current();
		} );

		$this->assertSame( Widget_Content_Render_Mode::NORMAL, Widget_Content_Render_Mode::get_current() );
	}

	public function test_execute_as_resets_mode_after_exception() {
		try {
			Widget_Content_Render_Mode::execute_as( Widget_Content_Render_Mode::MARKDOWN, static function () {
				throw new \RuntimeException( 'render failed' );
			} );
			$this->fail( 'Expected RuntimeException was not thrown.' );
		} catch ( \RuntimeException $exception ) {
			$this->assertSame( 'render failed', $exception->getMessage() );
		}

		$this->assertSame( Widget_Content_Render_Mode::NORMAL, Widget_Content_Render_Mode::get_current() );
	}

	public function test_execute_as_preserves_existing_mode() {
		Widget_Content_Render_Mode::set_current( Widget_Content_Render_Mode::MARKDOWN );

		$result = Widget_Content_Render_Mode::execute_as( Widget_Content_Render_Mode::MARKDOWN, static function () {
			return Widget_Content_Render_Mode::get_current();
		} );

		$this->assertSame( Widget_Content_Render_Mode::MARKDOWN, $result );
		$this->assertSame( Widget_Content_Render_Mode::MARKDOWN, Widget_Content_Render_Mode::get_current() );
	}
}
