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

	const SAMPLE_PRODUCT_IDS = [ 5, 7 ];

	private object $woocommerce;

	private array $sample_product_ids = self::SAMPLE_PRODUCT_IDS;

	public function setUp(): void {
		parent::setUp();

		remove_all_actions( 'elementor/mcp/preview/activated' );

		$this->woocommerce = (object) [
			'cart' => new Fake_Preview_Cart(),
			'session' => new Fake_Preview_Session(),
		];
		add_action( 'shutdown', [ $this->woocommerce->session, 'save_data' ], 20 );

		( new Woocommerce_Preview_Fixtures(
			fn() => $this->woocommerce,
			fn() => $this->sample_product_ids
		) )->register();
	}

	public function test_preview__fills_the_cart_with_sample_products_for_this_request_only() {
		// Act.
		$this->activate();

		// Assert.
		$this->assertSame( [
			[ 'empty_cart', false ],
			[ 'add_to_cart', 5, 1 ],
			[ 'add_to_cart', 7, 1 ],
		], $this->woocommerce->cart->calls );
		$this->assertFalse( has_action( 'shutdown', [ $this->woocommerce->session, 'save_data' ] ) );
		$this->assertFalse( apply_filters( 'woocommerce_set_cookie_enabled', true, 'woocommerce_cart_hash', '', 0, false ) );
		$this->assertFalse( apply_filters( 'woocommerce_persistent_cart_enabled', true ) );
	}

	public function test_preview__stops_cart_fragments_from_emptying_the_rendered_cart() {
		// Arrange.
		wp_register_script( 'wc-cart-fragments', 'cart-fragments.js', [], '1', true );

		// Act.
		$this->activate();
		wp_enqueue_script( 'wc-cart-fragments' );
		$this->print_footer_scripts();

		// Assert.
		$this->assertFalse( wp_script_is( 'wc-cart-fragments', 'enqueued' ) );
	}

	public function test_preview_without_sample_products__leaves_the_cart_session_and_fragments_alone() {
		// Arrange.
		$this->sample_product_ids = [];
		wp_register_script( 'wc-cart-fragments', 'cart-fragments.js', [], '1', true );

		// Act.
		$this->activate();
		wp_enqueue_script( 'wc-cart-fragments' );
		$this->print_footer_scripts();

		// Assert.
		$this->assertSame( [], $this->woocommerce->cart->calls );
		$this->assertSame( 20, has_action( 'shutdown', [ $this->woocommerce->session, 'save_data' ] ) );
		$this->assertTrue( apply_filters( 'woocommerce_set_cookie_enabled', true, 'woocommerce_cart_hash', '', 0, false ) );
		$this->assertTrue( wp_script_is( 'wc-cart-fragments', 'enqueued' ) );
	}

	public function test_preview__renders_as_a_logged_out_visitor() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$this->activate();

		// Assert.
		$this->assertSame( 0, get_current_user_id() );
	}

	public function test_preview__bypasses_store_coming_soon_mode() {
		// Arrange.
		$excluded_before = apply_filters( 'woocommerce_coming_soon_exclude', false );

		// Act.
		$this->activate();

		// Assert.
		$this->assertFalse( $excluded_before );
		$this->assertTrue( apply_filters( 'woocommerce_coming_soon_exclude', false ) );
	}

	private function print_footer_scripts(): void {
		ob_start();
		do_action( 'wp_print_footer_scripts' );
		ob_end_clean();
	}

	private function activate(): void {
		$post_id = $this->factory()->post->create();

		do_action( 'elementor/mcp/preview/activated', get_post( $post_id ) );
	}
}
