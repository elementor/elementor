<?php

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Webmcp_Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Webmcp_Utils extends Elementor_Test_Base {

	public function test_build_tool_name_slugifies_form_name() {
		$this->assertSame( 'contact_form', Webmcp_Utils::build_tool_name( 'Contact Form' ) );
	}

	public function test_build_tool_name_falls_back_when_empty() {
		$this->assertSame( 'submit_form', Webmcp_Utils::build_tool_name( '' ) );
	}

	public function test_build_tool_description_uses_form_name() {
		$description = Webmcp_Utils::build_tool_description( 'Contact Form' );

		$this->assertStringContainsString( 'Contact Form', $description );
	}

	public function test_build_tool_description_falls_back_when_empty() {
		$description = Webmcp_Utils::build_tool_description( '' );

		$this->assertNotEmpty( $description );
	}
}
