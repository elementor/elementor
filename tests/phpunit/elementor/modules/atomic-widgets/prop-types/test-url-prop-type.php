<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Url_Prop_Type extends Elementor_Test_Base {

	public function test_validate() {
		// Arrange.
		$prop_type = new Url_Prop_Type();

		// Act.
		$result = $prop_type->validate( [ '$$type' => 'url', 'value' => 'https://example.com' ] );

		// Assert.
		$this->assertTrue( $result );
	}

	/**
	 *	@dataProvider urls_provider
	 */
	public function test_skip_validation( $url ) {
		// Arrange.
		$prop_type = new Url_Prop_Type();

		// Act.
		$result = $prop_type->skip_validation()->validate( [ '$$type' => 'url', 'value' => $url ] );

		// Assert.
		$this->assertTrue( $result );
	}

	/**
	 *	@dataProvider urls_provider
	 */
	public function test_sanitize( $value, $expected )
	{
		// Arrange.
		$prop_type = new Url_Prop_Type();

		// Act.
		$result = $prop_type->sanitize( ["value" => $value] );

		// Assert.
		$this->assertEquals( $expected, $result['value'] );
	}

	public function urls_provider(): array {
		$xss_injected_url = "example.com/?id=1<script>alert(1)</script>";
		$xss_injected_url_escaped = "http://example.com/?id=1scriptalert(1)/script";
		$sql_injected_url = "' OR 1=1 --";
		$sql_injected_url_escaped = "http://'%20OR%201=1%20--";
		$js_injected_url = "<script>alert('hacked')</script>";
		$js_injected_url_escaped = "http://scriptalert('hacked')/script";
		$japanese_url = "https://example.com/こんにちは";
		$japanese_domain = "https://例え.テスト";

		return [
			[ "value" => "#", "expected" => "#" ],
			[ "value" => "#some-id", "expected" => "#some-id" ],
			[ "value" => "google.com", "expected" => "http://google.com" ],
			[ "value" => "google . com", "expected" => "http://google%20.%20com" ],
			[ "value" => "google", "expected" => "http://google" ],
			[ "value" => "google.com/about-us/#section1", "expected" => "http://google.com/about-us/#section1" ],
			[ "value" => "http://example.com", "expected" => "http://example.com" ],
			[ "value" => "https://example.com", "expected" => "https://example.com" ],
			[ "value" => "192.168.1.1", "expected" => "http://192.168.1.1" ],
			[ "value" => "2001:db8::ff00:42:8329", "expected" => "" ],
			[ "value" => $xss_injected_url, "expected" => $xss_injected_url_escaped ],
			[ "value" => $sql_injected_url, "expected" => $sql_injected_url_escaped ],
			[ "value" => $js_injected_url, "expected" => $js_injected_url_escaped ],
			[ "value" => "http://", "expected" => "http://" ],
			[ "value" => "http:///example.com", "expected" => "http:///example.com" ],
			[ "value" => $japanese_url, "expected" => $japanese_url ],
			[ "value" => $japanese_domain, "expected" => $japanese_domain ],
		];
	}
}
