<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Link_Control_Url_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Link_Control_Url_Prop_Type extends Elementor_Test_Base {

	/**
	 *	@dataProvider valid_urls_provider
	 */
	public function test_validate( $url ) {
		// Act.
		$result = Link_Control_Url_Prop_Type::validate_url( $url );

		// Assert.
		$this->assertTrue( $result );
	}

	/** @dataProvider invalid_urls_provider */
	public function test_validate__fail_when_value_is_not_a_allowed_url( $url ) {
		// Act.
		$result = Link_Control_Url_Prop_Type::validate_url( $url );

		// Assert.
		$this->assertFalse( $result );
	}

	public function valid_urls_provider() {
		return [
			[ "#" ],
			[ "#some-id" ],
			[ "url" => "google.com" ],
			[ "google" ],
			[ "google.com/about-us/#section1" ],
			[ "http://example.com" ],
			[ "https://example.com" ],
			[ "192.168.1.1" ],
			[ "2001:db8::ff00:42:8329" ],
		];
	}

	public function invalid_urls_provider() {
		return [
			[ "example.com/?id=1<script>alert(1)</script>" ], // XSS injection
			[ "' OR 1=1 --" ], // SQL injection
			[ "<script>alert('hacked')</script>" ], // JavaScript injection
			[ "http://" ],
			[ "http:///example.com" ],
		];
	}
}
