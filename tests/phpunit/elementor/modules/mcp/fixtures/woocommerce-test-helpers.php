<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Fixtures;

use Elementor\Modules\Mcp\Abilities\Utils\Woocommerce_Pro_Features_Discovery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Woocommerce_Test_Helpers {

	/**
	 * The WooCommerce plugin is not loaded in the test environment, and a declared class cannot be removed, so the stub stays for the rest of the run.
	 */
	private function given_woocommerce_is_active(): void {
		if ( ! class_exists( 'WooCommerce' ) ) {
			require_once __DIR__ . '/woocommerce-stub.php';
		}

		$this->assertTrue( Woocommerce_Pro_Features_Discovery::is_active() );
	}
}
