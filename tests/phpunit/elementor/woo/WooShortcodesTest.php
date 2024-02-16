<?php

namespace Elementor\Testing\woo;

use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Elementor_Test_Shortcodes extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function set_up() {
		parent::set_up();

		if ( ! class_exists( 'WooCommerce' ) ) {
			$this->markTestSkipped( 'WooCommerce is not installed.' );
		}
	}

	public function test_cart_shortcode() {
		WC()->initialize_cart();
		$this->assertMatchesHtmlSnapshot( do_shortcode( '[woocommerce_cart]' ) );
	}
}
