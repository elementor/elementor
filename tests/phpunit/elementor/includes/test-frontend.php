<?php
namespace Elementor\Testing\Includes;

use Elementor\Testing\Elementor_Test_Base;
use Elementor\Utils;

class Elementor_Test_Frontend extends Elementor_Test_Base {
	// This tests the urlencode_htmlentities utility method, to see that it properly decodes HTML Entities and then
	// URL-encodes them to be used in requests
	public function test_should_return_urlencoded_string() {
		add_filter( 'document_title_parts', function () {
			return [
				'title' => '"This is a string" with a variety of ‘HTML entities’. \'What?\' & (more) #stupid “things”'
			];
		} );

		$before_encoding = wp_get_document_title();

		$valid_encoding = '%22This%20is%20a%20string%22%20with%20a%20variety%20of%20%E2%80%98HTML%20entities%E2%80%99.%20%27What%3F%27%20%26%20%28more%29%20%23stupid%20%E2%80%9Cthings%E2%80%9D';
		$after_encoding = Utils::urlencode_htmlentities( $before_encoding );

		$this->assertSame( $after_encoding, $valid_encoding );
	}
}
