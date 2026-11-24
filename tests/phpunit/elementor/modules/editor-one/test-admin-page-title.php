<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Admin_Page_Title;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Admin_Page_Title extends Elementor_Test_Base {

	public function test_get_markup__default_output_is_unchanged() {
		// Act
		$markup = Admin_Page_Title::get_markup( 'Agent Ready' );

		// Assert
		$this->assertSame( '<h1 class="wp-heading-inline">Agent Ready</h1><hr class="wp-header-end">', $markup );
	}

	public function test_get_markup__visually_hidden_adds_screen_reader_text_and_keeps_header_end() {
		// Act
		$markup = Admin_Page_Title::get_markup( 'Agent Ready', true );

		// Assert
		$this->assertSame( '<h1 class="wp-heading-inline screen-reader-text">Agent Ready</h1><hr class="wp-header-end">', $markup );
	}

	public function test_get_markup__escapes_the_title() {
		// Act
		$markup = Admin_Page_Title::get_markup( '<b>Title</b>', true );

		// Assert
		$this->assertStringContainsString( '&lt;b&gt;Title&lt;/b&gt;', $markup );
	}
}
