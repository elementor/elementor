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

	/**
	 *	@dataProvider urls_provider
	 */
	public function test_sanitize( $value, $expected )
	{
		// Arrange.
		$prop_type = new Link_Control_Url_Prop_Type();

		// Act.
		$result = $prop_type->sanitize( ["value" => $value] );

		// Assert.
		$this->assertEquals( $expected, $result['value'] );
	}

	public function urls_provider(): array {
		$xss_injected_url = "example.com/?id=1<script>alert(1)</script>";
		$sql_injected_url = "' OR 1=1 --";
		$js_injected_url = "<script>alert('hacked')</script>";
		$japanese_url = "https://example.com/こんにちは";
		$japanese_domain = "https://例え.テスト";

		return [
			[ "value" => "#", "expected" => "#" ],
			[ "value" => "#some-id", "expected" => "#some-id" ],
			[ "value" => "google.com", "expected" => "google.com" ],
			[ "value" => "google . com", "expected" => "google.com" ],
			[ "value" => "google", "expected" => "google" ],
			[ "value" => "google.com/about-us/#section1", "expected" => "google.com/about-us/#section1" ],
			[ "value" => "http://example.com", "expected" => "http://example.com" ],
			[ "value" => "https://example.com", "expected" => "https://example.com" ],
			[ "value" => "192.168.1.1", "expected" => "192.168.1.1" ],
			[ "value" => "2001:db8::ff00:42:8329", "expected" => "2001:db8::ff00:42:8329" ],
			[ "value" => $xss_injected_url, "expected" => $xss_injected_url ],
			[ "value" => $sql_injected_url, "expected" => "'OR1=1--" ],
			[ "value" => $js_injected_url, "expected" => $js_injected_url ],
			[ "value" => "http://", "expected" => "http://" ],
			[ "value" => "http:///example.com", "expected" => "http:///example.com" ],
			[ "value" => $japanese_url, "expected" => "https://example.com/" ],
			[ "value" => $japanese_domain, "expected" => "https://." ],
		];
	}


}
