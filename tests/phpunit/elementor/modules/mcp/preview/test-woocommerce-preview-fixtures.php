<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Preview;

use Elementor\Modules\Mcp\Preview\Woocommerce_Preview_Fixtures;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Fake_Preview_Cart {
	public array $calls = [];

	public function empty_cart( $clear_persistent_cart = true ) {
		$this->calls[] = [ 'empty_cart', $clear_persistent_cart ];
	}

	public function add_to_cart( $product_id = 0, $quantity = 1 ) {
		$this->calls[] = [ 'add_to_cart', $product_id, $quantity ];

		return 'cart-item-key';
	}
}

class Fake_Preview_Session {
	public function save_data() {}
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Woocommerce_Preview_Fixtures extends Elementor_Test_Base {

	private Woocommerce_Preview_Fixtures $fixtures;

	private object $woocommerce;

	public function setUp(): void {
		parent::setUp();

		remove_all_actions( 'elementor/mcp/preview/activated' );
		remove_all_filters( 'elementor/mcp/preview/query_vars' );

		$this->woocommerce = (object) [
			'cart' => new Fake_Preview_Cart(),
			'session' => new Fake_Preview_Session(),
		];
		add_action( 'shutdown', [ $this->woocommerce->session, 'save_data' ], 20 );

		$this->fixtures = new Woocommerce_Preview_Fixtures( fn() => $this->woocommerce );
		$this->fixtures->register();
	}

	public function test_cart_products__fill_the_cart_for_this_request_only() {
		// Act.
		$this->activate( [
			'cart_products' => [
				[ 'product_id' => 5, 'quantity' => 2 ],
				[ 'product_id' => 7, 'quantity' => 1 ],
			],
		] );

		// Assert.
		$this->assertSame( [
			[ 'empty_cart', false ],
			[ 'add_to_cart', 5, 2 ],
			[ 'add_to_cart', 7, 1 ],
		], $this->woocommerce->cart->calls );
		$this->assertFalse( has_action( 'shutdown', [ $this->woocommerce->session, 'save_data' ] ) );
		$this->assertFalse( apply_filters( 'woocommerce_set_cookie_enabled', true, 'woocommerce_cart_hash', '', 0, false ) );
		$this->assertFalse( apply_filters( 'woocommerce_persistent_cart_enabled', true ) );
	}

	public function test_cart_products__stop_cart_fragments_from_emptying_the_rendered_cart() {
		// Arrange.
		wp_register_script( 'wc-cart-fragments', 'cart-fragments.js', [], '1', true );

		// Act.
		$this->activate( [
			'cart_products' => [
				[ 'product_id' => 5, 'quantity' => 2 ],
			],
		] );
		wp_enqueue_script( 'wc-cart-fragments' );
		$this->print_footer_scripts();

		// Assert.
		$this->assertFalse( wp_script_is( 'wc-cart-fragments', 'enqueued' ) );
	}

	public function test_without_cart_products__keeps_cart_fragments() {
		// Arrange.
		wp_register_script( 'wc-cart-fragments', 'cart-fragments.js', [], '1', true );

		// Act.
		$this->activate( [] );
		wp_enqueue_script( 'wc-cart-fragments' );
		$this->print_footer_scripts();

		// Assert.
		$this->assertTrue( wp_script_is( 'wc-cart-fragments', 'enqueued' ) );
	}

	public function test_without_cart_products__leaves_the_cart_and_session_alone() {
		// Act.
		$this->activate( [] );

		// Assert.
		$this->assertSame( [], $this->woocommerce->cart->calls );
		$this->assertSame( 20, has_action( 'shutdown', [ $this->woocommerce->session, 'save_data' ] ) );
		$this->assertTrue( apply_filters( 'woocommerce_set_cookie_enabled', true, 'woocommerce_cart_hash', '', 0, false ) );
	}

	public function test_logged_in_false__renders_as_a_logged_out_visitor() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$this->activate( [ 'logged_in' => false ] );

		// Assert.
		$this->assertSame( 0, get_current_user_id() );
	}

	public function test_preview__bypasses_store_coming_soon_mode() {
		// Arrange.
		$excluded_before = apply_filters( 'woocommerce_coming_soon_exclude', false );

		// Act.
		$this->activate( [] );

		// Assert.
		$this->assertFalse( $excluded_before );
		$this->assertTrue( apply_filters( 'woocommerce_coming_soon_exclude', false ) );
	}

	public function test_product_id__replaces_the_previewed_product() {
		// Arrange.
		$this->activate( [ 'product_id' => 9 ] );

		// Act.
		$query_vars = apply_filters( 'elementor/mcp/preview/query_vars', [ 'post_type' => 'product', 'p' => 3 ], get_post( 1 ) );

		// Assert.
		$this->assertSame( [ 'post_type' => 'product', 'p' => 9 ], $query_vars );
	}

	public function test_product_id__ignored_when_the_preview_is_not_a_product() {
		// Arrange.
		$this->activate( [ 'product_id' => 9 ] );

		// Act.
		$query_vars = apply_filters( 'elementor/mcp/preview/query_vars', [ 'page_id' => 3 ], get_post( 1 ) );

		// Assert.
		$this->assertSame( [ 'page_id' => 3 ], $query_vars );
	}

	private function print_footer_scripts(): void {
		ob_start();
		do_action( 'wp_print_footer_scripts' );
		ob_end_clean();
	}

	private function activate( array $fixtures ): void {
		$post_id = $this->factory()->post->create();

		do_action( 'elementor/mcp/preview/activated', get_post( $post_id ), $fixtures );
	}
}
