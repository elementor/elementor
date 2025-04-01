<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Link_Control_Url_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Link_Control_Url_Prop_Type extends Elementor_Test_Base {

	/**
	 *	@dataProvider urls_provider
	 */
	public function test_validate( $url ) {
		// Act.
		$result = Link_Control_Url_Prop_Type::validate_url( $url );

		// Assert.
		$this->assertTrue( $result );
	}

	public function urls_provider(): array {
		$xss_injected_url = "example.com/?id=1<script>alert(1)</script>";
		$sql_injected_url = "' OR 1=1 --";
		$js_injected_url = "<script>alert('hacked')</script>";

		return [
			[ "#" ],
			[ "#some-id" ],
			[ "google.com" ],
			[ "google" ],
			[ "google.com/about-us/#section1" ],
			[ "http://example.com" ],
			[ "https://example.com" ],
			[ "192.168.1.1" ],
			[ "2001:db8::ff00:42:8329" ],
			[ $xss_injected_url ],
			[ $sql_injected_url ],
			[ $js_injected_url ],
			[ "http://" ],
			[ "http:///example.com" ],
		];
	}

}
